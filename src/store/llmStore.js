import { create } from 'zustand';
import axios from 'axios';
import { persist } from 'zustand/middleware';

// Default Ollama server URL
const OLLAMA_URL = 'http://localhost:11434';

export const useLLMStore = create(
  persist(
    (set, get) => ({
      selectedModel: 'llama2',
      ollamaStatus: false,
      ollamaModels: [],
      apiKeys: {},
      ollamaUrl: OLLAMA_URL,
      
      setOllamaUrl: (url) => set({ ollamaUrl: url }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      
      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key }
        })),
      
      removeApiKey: (provider) =>
        set((state) => {
          const newApiKeys = { ...state.apiKeys };
          delete newApiKeys[provider];
          return { apiKeys: newApiKeys };
        }),
      
      checkOllamaConnection: async () => {
        const ollamaUrl = get().ollamaUrl;
        try {
          const response = await axios.get(`${ollamaUrl}/api/tags`, {
            headers: {
              'Accept': 'application/json',
            },
            timeout: 5000
          });
          
          const availableModels = response.data.models || [];
          const modelList = availableModels.map(model => model.name || model);
          
          set({
            ollamaStatus: response.status === 200,
            ollamaModels: modelList
          });
          
          return true;
        } catch (error) {
          console.error('Ollama connection error:', error);
          set({
            ollamaStatus: false,
            ollamaModels: []
          });
          return false;
        }
      },
      
      validateApiKey: async (provider, key) => {
        if (!key || key.trim() === '') {
          throw new Error('API key cannot be empty');
        }

        try {
          switch (provider) {
            case 'openai':
              const openaiResponse = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                  model: 'gpt-3.5-turbo',
                  messages: [{ role: 'user', content: 'Hi' }],
                  max_tokens: 5
                },
                {
                  headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                  },
                  timeout: 10000
                }
              );
              return openaiResponse.status === 200;

            case 'anthropic':
              const anthropicResponse = await axios.post(
                'https://api.anthropic.com/v1/messages',
                {
                  model: 'claude-3-haiku-20240307',
                  max_tokens: 5,
                  messages: [{ role: 'user', content: 'Hi' }]
                },
                {
                  headers: {
                    'x-api-key': key,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                  },
                  timeout: 10000
                }
              );
              return anthropicResponse.status === 200;

            case 'gemini':
              const geminiResponse = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`,
                {
                  contents: [{ parts: [{ text: 'Hi' }] }],
                  generationConfig: { maxOutputTokens: 5 }
                },
                { timeout: 10000 }
              );
              return geminiResponse.status === 200;

            case 'mistral':
              const mistralResponse = await axios.post(
                'https://api.mistral.ai/v1/chat/completions',
                {
                  model: 'mistral-tiny',
                  messages: [{ role: 'user', content: 'Hi' }],
                  max_tokens: 5
                },
                {
                  headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                  },
                  timeout: 10000
                }
              );
              return mistralResponse.status === 200;

            case 'groq':
              const groqResponse = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                  model: 'llama3-8b-8192',
                  messages: [{ role: 'user', content: 'Hi' }],
                  max_tokens: 5
                },
                {
                  headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                  },
                  timeout: 10000
                }
              );
              return groqResponse.status === 200;

            default:
              throw new Error(`Unsupported provider: ${provider}`);
          }
        } catch (error) {
          console.error(`API key validation error for ${provider}:`, error);
          
          if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            switch (status) {
              case 401:
                throw new Error('Invalid API key - Authentication failed');
              case 403:
                throw new Error('API key does not have required permissions');
              case 429:
                throw new Error('Rate limit exceeded - Please try again later');
              case 500:
                throw new Error('Provider server error - Please try again later');
              default:
                throw new Error(`API validation failed: ${data?.error?.message || error.message}`);
            }
          } else if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout - Please check your connection');
          } else {
            throw new Error(`Network error: ${error.message}`);
          }
        }
      },

      // Enhanced function to make LLM requests with better error handling
      generateResponse: async (prompt, options = {}) => {
        const state = get();
        const { selectedModel, apiKeys, ollamaUrl, ollamaStatus } = state;
        const { temperature = 0.7, maxTokens = 1000, conversation = [] } = options;

        // Validation checks
        if (!prompt || prompt.trim() === '') {
          throw new Error('Prompt cannot be empty');
        }

        try {
          // Handle Ollama models
          if (state.ollamaModels.includes(selectedModel) || ['llama2', 'codellama', 'mistral', 'llama3', 'phi3'].includes(selectedModel)) {
            if (!ollamaStatus) {
              throw new Error('Ollama is not connected. Please check your Ollama installation and connection.');
            }

            const response = await axios.post(
              `${ollamaUrl}/api/generate`,
              {
                model: selectedModel,
                prompt,
                options: {
                  temperature,
                  num_predict: maxTokens
                },
                stream: false
              },
              {
                timeout: 60000 // Longer timeout for local models
              }
            );

            if (response.data && response.data.response) {
              return response.data.response;
            } else {
              throw new Error('Invalid response from Ollama');
            }
          }

          // Handle OpenAI models
          if (['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'].includes(selectedModel)) {
            if (!apiKeys.openai) {
              throw new Error('OpenAI API key not found. Please add your API key in settings.');
            }

            // Build conversation context
            const messages = conversation.length > 0 
              ? [...conversation.slice(-10), { role: 'user', content: prompt }]
              : [{ role: 'user', content: prompt }];

            const response = await axios.post(
              'https://api.openai.com/v1/chat/completions',
              {
                model: selectedModel,
                messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
                temperature,
                max_tokens: maxTokens
              },
              {
                headers: {
                  'Authorization': `Bearer ${apiKeys.openai}`,
                  'Content-Type': 'application/json'
                },
                timeout: 30000
              }
            );

            return response.data.choices[0].message.content;
          }

          // Handle Anthropic models
          if (['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'].includes(selectedModel)) {
            if (!apiKeys.anthropic) {
              throw new Error('Anthropic API key not found. Please add your API key in settings.');
            }

            const response = await axios.post(
              'https://api.anthropic.com/v1/messages',
              {
                model: selectedModel,
                max_tokens: maxTokens,
                temperature,
                messages: [{ role: 'user', content: prompt }]
              },
              {
                headers: {
                  'x-api-key': apiKeys.anthropic,
                  'anthropic-version': '2023-06-01',
                  'Content-Type': 'application/json'
                },
                timeout: 30000
              }
            );

            return response.data.content[0].text;
          }

          // Handle Gemini models
          if (['gemini-pro', 'gemini-pro-vision'].includes(selectedModel)) {
            if (!apiKeys.gemini) {
              throw new Error('Google Gemini API key not found. Please add your API key in settings.');
            }

            const response = await axios.post(
              `https://generativelanguage.googleapis.com/v1/models/${selectedModel}:generateContent?key=${apiKeys.gemini}`,
              {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature,
                  maxOutputTokens: maxTokens
                }
              },
              {
                timeout: 30000
              }
            );

            return response.data.candidates[0].content.parts[0].text;
          }

          // Handle Mistral models
          if (['mistral-tiny', 'mistral-small', 'mistral-medium', 'mistral-large-latest'].includes(selectedModel)) {
            if (!apiKeys.mistral) {
              throw new Error('Mistral API key not found. Please add your API key in settings.');
            }

            const response = await axios.post(
              'https://api.mistral.ai/v1/chat/completions',
              {
                model: selectedModel,
                messages: [{ role: 'user', content: prompt }],
                temperature,
                max_tokens: maxTokens
              },
              {
                headers: {
                  'Authorization': `Bearer ${apiKeys.mistral}`,
                  'Content-Type': 'application/json'
                },
                timeout: 30000
              }
            );

            return response.data.choices[0].message.content;
          }

          // Handle Groq models
          if (['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'].includes(selectedModel)) {
            if (!apiKeys.groq) {
              throw new Error('Groq API key not found. Please add your API key in settings.');
            }

            const response = await axios.post(
              'https://api.groq.com/openai/v1/chat/completions',
              {
                model: selectedModel,
                messages: [{ role: 'user', content: prompt }],
                temperature,
                max_tokens: maxTokens
              },
              {
                headers: {
                  'Authorization': `Bearer ${apiKeys.groq}`,
                  'Content-Type': 'application/json'
                },
                timeout: 30000
              }
            );

            return response.data.choices[0].message.content;
          }

          throw new Error(`Unsupported model: ${selectedModel}`);

        } catch (error) {
          console.error('LLM request error:', error);
          
          // Enhanced error handling with specific messages
          if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            switch (status) {
              case 400:
                throw new Error(`Bad request: ${data?.error?.message || 'Invalid request parameters'}`);
              case 401:
                throw new Error('Authentication failed. Please check your API key.');
              case 403:
                throw new Error('Access forbidden. Your API key may not have the required permissions.');
              case 404:
                throw new Error(`Model "${selectedModel}" not found or not available.`);
              case 429:
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
              case 500:
                throw new Error('Server error. Please try again later.');
              case 503:
                throw new Error('Service temporarily unavailable. Please try again later.');
              default:
                throw new Error(`Request failed: ${data?.error?.message || error.message}`);
            }
          } else if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. The model may be taking too long to respond.');
          } else if (error.code === 'ECONNREFUSED') {
            throw new Error('Connection refused. Please check if the service is running.');
          } else {
            throw new Error(error.message || 'An unexpected error occurred');
          }
        }
      }
    }),
    {
      name: 'llm-store',
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        ollamaUrl: state.ollamaUrl,
        apiKeys: state.apiKeys
      })
    }
  )
);