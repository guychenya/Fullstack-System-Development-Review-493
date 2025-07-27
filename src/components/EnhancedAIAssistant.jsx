import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useLLMStore } from '../store/llmStore';
import toast from 'react-hot-toast';

const { 
  FiBrain, FiSend, FiX, FiLoader, FiMaximize2, FiMinimize2, 
  FiCode, FiCopy, FiMessageCircle, FiSettings, FiTrash2, 
  FiRefreshCw, FiChevronDown, FiCheck, FiAlertCircle, 
  FiZap, FiCpu, FiGlobe, FiFlame 
} = FiIcons;

const EnhancedAIAssistant = ({ 
  mode = 'overlay', 
  onClose, 
  onModeChange,
  className = ''
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [conversation, setConversation] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI coding assistant. How can I help you today?',
      timestamp: Date.now()
    }
  ]);

  const {
    selectedModel,
    setSelectedModel,
    ollamaStatus,
    apiKeys,
    generateResponse,
    checkOllamaConnection
  } = useLLMStore();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollbar, setShowScrollbar] = useState(false);

  // Enhanced LLM providers with availability status
  const llmProviders = [
    {
      id: 'ollama',
      name: 'Ollama (Local)',
      icon: FiCpu,
      models: ['llama2', 'codellama', 'mistral', 'llama3', 'phi3'],
      available: ollamaStatus,
      color: 'text-orange-400'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      icon: FiBrain,
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
      available: !!apiKeys.openai,
      color: 'text-green-400'
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      icon: FiGlobe,
      models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      available: !!apiKeys.anthropic,
      color: 'text-purple-400'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      icon: FiBrain,
      models: ['gemini-pro', 'gemini-pro-vision'],
      available: !!apiKeys.gemini,
      color: 'text-blue-400'
    },
    {
      id: 'groq',
      name: 'Groq',
      icon: FiZap,
      models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'],
      available: !!apiKeys.groq,
      color: 'text-yellow-400'
    }
  ];

  // Get all available models
  const getAllAvailableModels = () => {
    const models = [];
    llmProviders.forEach(provider => {
      if (provider.available) {
        provider.models.forEach(model => {
          models.push({
            model,
            provider: provider.name,
            providerId: provider.id,
            icon: provider.icon,
            color: provider.color
          });
        });
      }
    });
    return models;
  };

  // Context management settings
  const [chatSettings, setChatSettings] = useState({
    maxMessages: 50,
    contextWindow: 4000,
    autoTruncate: true,
    saveHistory: true
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Check model availability on mount
  useEffect(() => {
    checkOllamaConnection();
  }, [checkOllamaConnection]);

  // Handle scrollbar visibility
  useEffect(() => {
    const handleMouseEnter = () => setShowScrollbar(true);
    const handleMouseLeave = () => setShowScrollbar(false);
    
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.addEventListener('mouseenter', handleMouseEnter);
      messagesContainer.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      if (messagesContainer) {
        messagesContainer.removeEventListener('mouseenter', handleMouseEnter);
        messagesContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const getProviderFromModel = (model) => {
    const provider = llmProviders.find(p => p.models.includes(model));
    return provider?.id || 'unknown';
  };

  const isModelAvailable = (model) => {
    const provider = getProviderFromModel(model);
    if (provider === 'ollama') return ollamaStatus;
    return !!apiKeys[provider];
  };

  const handleModelChange = (newModel) => {
    if (!isModelAvailable(newModel)) {
      toast.error(`${newModel} is not available. Please check your API keys or Ollama connection.`);
      return;
    }

    setSelectedModel(newModel);
    setShowModelSelector(false);

    // Add system message about model change
    const systemMessage = {
      role: 'system',
      content: `Model switched to ${newModel}`,
      timestamp: Date.now()
    };
    setConversation(prev => [...prev, systemMessage]);
    toast.success(`Switched to ${newModel}`);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;

    // Check if current model is available
    if (!isModelAvailable(selectedModel)) {
      toast.error(`${selectedModel} is not available. Please select a different model or check your API keys.`);
      return;
    }

    const userMessage = {
      role: 'user',
      content: prompt,
      timestamp: Date.now()
    };

    setConversation(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      // Auto-truncate if conversation is getting too long
      let contextConversation = conversation;
      if (chatSettings.autoTruncate && conversation.length > chatSettings.maxMessages) {
        contextConversation = [
          conversation[0], // Keep system greeting
          ...conversation.slice(-chatSettings.maxMessages + 2) // Keep recent messages
        ];
      }

      const response = await generateResponse(prompt, {
        conversation: contextConversation,
        maxTokens: 1000,
        temperature: 0.7
      });

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        model: selectedModel
      };

      setConversation(prev => [...prev, assistantMessage]);

      // Save to localStorage if enabled
      if (chatSettings.saveHistory) {
        localStorage.setItem('ai-assistant-history', JSON.stringify([...conversation, userMessage, assistantMessage]));
      }
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Failed to generate response'}. Please try again or switch to a different model.`,
        timestamp: Date.now(),
        isError: true
      };
      setConversation(prev => [...prev, errorMessage]);
      toast.error('Failed to generate response');
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setConversation([
      {
        role: 'assistant',
        content: 'Hi! I\'m your AI coding assistant. How can I help you today?',
        timestamp: Date.now()
      }
    ]);
    if (chatSettings.saveHistory) {
      localStorage.removeItem('ai-assistant-history');
    }
    toast.success('Conversation cleared');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };

  const formatMessageContent = (content) => {
    if (!content) return '';
    
    const parts = content.split(/```([^`]+)```/);
    if (parts.length === 1) {
      return content.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < content.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    }

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const firstLineBreak = part.indexOf('\n');
        const language = firstLineBreak > 0 ? part.substring(0, firstLineBreak).trim() : '';
        const code = firstLineBreak > 0 ? part.substring(firstLineBreak + 1) : part;

        return (
          <div key={index} className="relative mt-2 mb-2 rounded-md overflow-hidden">
            {language && (
              <div className="bg-gray-800 px-3 py-1 text-xs text-gray-400 border-b border-gray-700">
                {language}
              </div>
            )}
            <pre className="bg-gray-800 p-3 overflow-x-auto text-sm no-scrollbar">
              <code>{code}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(code)}
              className="absolute top-2 right-2 p-1 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 transition-colors"
              title="Copy code"
            >
              <SafeIcon icon={FiCopy} className="text-sm" />
            </button>
          </div>
        );
      }
      return part.split('\n').map((line, i) => (
        <React.Fragment key={`${index}-${i}`}>
          {line}
          {i < part.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  const getCurrentModelInfo = () => {
    const allModels = getAllAvailableModels();
    return allModels.find(m => m.model === selectedModel) || {
      model: selectedModel,
      provider: 'Unknown',
      icon: FiAlertCircle,
      color: 'text-red-400'
    };
  };

  const currentModelInfo = getCurrentModelInfo();
  const availableModels = getAllAvailableModels();

  // Get container classes based on mode
  const getContainerClasses = () => {
    const baseClasses = 'bg-dark-surface border border-dark-border overflow-hidden';
    
    switch (mode) {
      case 'fullscreen':
        return `${baseClasses} w-full h-full ${className}`;
      case 'split':
        return `${baseClasses} w-full h-full flex flex-col ${className}`;
      case 'overlay':
      default:
        return `${baseClasses} rounded-xl shadow-2xl w-96 h-[600px] ${className}`;
    }
  };

  return (
    <div className={getContainerClasses()}>
      {/* Enhanced Chat header */}
      <div className="flex items-center justify-between bg-dark-bg p-4 border-b border-dark-border">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <SafeIcon icon={FiBrain} className="text-vibe-purple" />
            {/* Connection indicator with flame animation */}
            {isModelAvailable(selectedModel) && (
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <SafeIcon icon={FiFlame} className="text-xs text-orange-400" />
              </motion.div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-white">AI Assistant</h3>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={currentModelInfo.icon} className={`text-xs ${currentModelInfo.color}`} />
              <span className="text-xs text-gray-400">{currentModelInfo.model}</span>
              {!isModelAvailable(selectedModel) && (
                <SafeIcon icon={FiAlertCircle} className="text-xs text-red-400" title="Model not available" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="p-1 text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
              title="Switch model"
            >
              <SafeIcon icon={currentModelInfo.icon} className={currentModelInfo.color} />
              <SafeIcon icon={FiChevronDown} className="text-xs" />
            </button>

            <AnimatePresence>
              {showModelSelector && (
                <motion.div
                  className="absolute top-8 right-0 w-64 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto hover-show-scrollbar scrollbar-fade-in"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="p-2">
                    <div className="text-xs text-gray-400 mb-2 px-2">Available Models ({availableModels.length})</div>
                    {availableModels.length > 0 ? (
                      availableModels.map((modelInfo) => (
                        <button
                          key={modelInfo.model}
                          onClick={() => handleModelChange(modelInfo.model)}
                          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-left ${
                            selectedModel === modelInfo.model
                              ? 'bg-vibe-purple text-white'
                              : 'hover:bg-dark-bg text-gray-300'
                          }`}
                        >
                          <SafeIcon icon={modelInfo.icon} className={modelInfo.color} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{modelInfo.model}</div>
                            <div className="text-xs text-gray-400">{modelInfo.provider}</div>
                          </div>
                          {selectedModel === modelInfo.model && (
                            <SafeIcon icon={FiCheck} className="text-sm" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-400">
                        No models available. Please check your API keys or Ollama connection.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mode change buttons (only in overlay mode) */}
          {mode === 'overlay' && onModeChange && (
            <>
              <button
                onClick={() => onModeChange('split')}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Split view"
              >
                <SafeIcon icon={FiMinimize2} className="text-sm" />
              </button>
              <button
                onClick={() => onModeChange('fullscreen')}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Fullscreen"
              >
                <SafeIcon icon={FiMaximize2} className="text-sm" />
              </button>
            </>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
          >
            <SafeIcon icon={FiX} className="text-sm" />
          </button>
        </div>
      </div>

      {/* Chat messages with improved scrolling */}
      <div 
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto p-4 chat-messages-scroll smooth-scroll ${showScrollbar ? 'scrollbar-fade-in' : 'hover-show-scrollbar'}`}
      >
        {conversation.map((message, index) => (
          <motion.div
            key={index}
            className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-vibe-purple text-white'
                  : message.role === 'system'
                  ? 'bg-dark-border text-gray-400 text-center text-sm'
                  : message.isError
                  ? 'bg-red-900/30 border border-red-500/50 text-red-200'
                  : 'bg-dark-bg text-white'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <SafeIcon
                  icon={
                    message.role === 'user'
                      ? FiMessageCircle
                      : message.role === 'system'
                      ? FiSettings
                      : message.isError
                      ? FiAlertCircle
                      : FiBrain
                  }
                  className={
                    message.role === 'user'
                      ? 'text-white'
                      : message.isError
                      ? 'text-red-400'
                      : 'text-vibe-purple'
                  }
                />
                <span className="text-xs font-medium">
                  {message.role === 'user' ? 'You' : message.role === 'system' ? 'System' : 'Assistant'}
                </span>
                {message.model && (
                  <span className="text-xs opacity-60">({message.model})</span>
                )}
              </div>
              {message.role !== 'system' && (
                <div className="text-sm">
                  {formatMessageContent(message.content)}
                </div>
              )}
              {message.role === 'system' && (
                <div className="text-xs italic">
                  {message.content}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            className="flex justify-start mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="max-w-[80%] rounded-lg p-3 bg-dark-bg text-white">
              <div className="flex items-center space-x-2 mb-1">
                <SafeIcon icon={FiLoader} className="text-vibe-purple animate-spin" />
                <span className="text-xs font-medium">Assistant is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Chat input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-dark-border">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              !isModelAvailable(selectedModel)
                ? `${selectedModel} not available - check settings`
                : "Ask me anything..."
            }
            className="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none text-white placeholder-gray-500"
            disabled={isLoading || !isModelAvailable(selectedModel)}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading || !isModelAvailable(selectedModel)}
            className="p-2 bg-vibe-purple text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vibe-purple/80 transition-colors"
          >
            <SafeIcon icon={isLoading ? FiLoader : FiSend} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-xs">
          <div className="flex items-center space-x-3 text-gray-500">
            <span>
              {availableModels.length > 0 ? `${availableModels.length} models available` : 'No models available'}
            </span>
            <span>•</span>
            <span>{conversation.length} messages</span>
            {conversation.length > chatSettings.maxMessages - 10 && (
              <>
                <span>•</span>
                <span className="text-vibe-orange">Near limit</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={clearConversation}
            className="text-vibe-purple hover:underline flex items-center space-x-1"
          >
            <SafeIcon icon={FiTrash2} />
            <span>Clear</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedAIAssistant;