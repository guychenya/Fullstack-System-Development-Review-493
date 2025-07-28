import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useLLMStore } from '../store/llmStore';
import toast from 'react-hot-toast';

const { 
  FiBrain, FiSend, FiX, FiLoader, FiMaximize2, FiMinimize2, FiCode, 
  FiCopy, FiMessageCircle, FiSettings, FiTrash2, FiRefreshCw, 
  FiChevronDown, FiCheck, FiAlertCircle, FiZap, FiCpu, FiGlobe, 
  FiFlame, FiClipboard, FiFile, FiPaperclip, FiAtSign
} = FiIcons;

const EnhancedAIAssistant = ({ mode = 'overlay', onClose, onModeChange, className = '' }) => {
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
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  
  // File reference features
  const [showFileSuggestions, setShowFileSuggestions] = useState(false);
  const [fileSuggestions, setFileSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [atSignIndex, setAtSignIndex] = useState(-1);
  const [droppedFiles, setDroppedFiles] = useState([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
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

  // Simulated file system
  const [files, setFiles] = useState({
    'main.js': `// Welcome to FluxCode Editor
function greetDeveloper() {
  console.log("Hello, Developer! Ready to code with the perfect vibe?");
  
  const vibes = ['focused', 'creative', 'relaxed'];
  const currentVibe = vibes[Math.floor(Math.random() * vibes.length)];
  
  return \`Current vibe: \${currentVibe}\`;
}

greetDeveloper();`,
    'app.jsx': `import React from 'react';

function App() {
  return (
    <div className="app">
      <h1>FluxCode App</h1>
      <p>Edit this file to get started!</p>
    </div>
  );
}

export default App;`,
    'utils.js': `// Utility functions

export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export function calculateSum(numbers) {
  return numbers.reduce((sum, num) => sum + num, 0);
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}`
  });
  
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
  
  // File suggestion system
  useEffect(() => {
    if (prompt.includes('@') && inputRef.current) {
      const atIndex = prompt.lastIndexOf('@');
      if (atIndex !== -1) {
        const textAfterAt = prompt.slice(atIndex + 1);
        // Only show suggestions if we're typing right after the @ symbol
        if (cursorPosition > atIndex && !textAfterAt.includes(' ')) {
          setAtSignIndex(atIndex);
          
          // Filter file suggestions based on text after @
          const suggestions = Object.keys(files).filter(file => 
            file.toLowerCase().includes(textAfterAt.toLowerCase())
          );
          
          setFileSuggestions(suggestions);
          setShowFileSuggestions(suggestions.length > 0);
          return;
        }
      }
    }
    
    // Hide suggestions if conditions aren't met
    setShowFileSuggestions(false);
    setFileSuggestions([]);
  }, [prompt, cursorPosition, files]);

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
  
  // Handle file selection from suggestions
  const handleFileSelect = (filename) => {
    if (!filename) return;
    
    // Replace the text after @ with the selected filename
    const beforeAt = prompt.substring(0, atSignIndex + 1);
    const afterAt = prompt.substring(atSignIndex + 1);
    const afterAtNextSpace = afterAt.indexOf(' ') > -1 ? afterAt.indexOf(' ') : afterAt.length;
    
    const newPrompt = beforeAt + filename + afterAt.substring(afterAtNextSpace);
    setPrompt(newPrompt);
    setShowFileSuggestions(false);
    
    // Focus the input and place cursor after the inserted filename
    if (inputRef.current) {
      inputRef.current.focus();
      const newCursorPos = beforeAt.length + filename.length;
      setTimeout(() => {
        inputRef.current.selectionStart = newCursorPos;
        inputRef.current.selectionEnd = newCursorPos;
        setCursorPosition(newCursorPos);
      }, 0);
    }
  };
  
  // Handle drag and drop for files
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDraggingOver) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    // Process the dropped file data
    const fileData = e.dataTransfer.getData('application/json');
    if (fileData) {
      try {
        const parsedData = JSON.parse(fileData);
        if (parsedData.filename && parsedData.content) {
          setDroppedFiles([{
            name: parsedData.filename,
            content: parsedData.content
          }]);
          
          // Add file reference to current prompt
          if (prompt.trim() === '') {
            setPrompt(`Can you analyze this file: @${parsedData.filename}`);
          } else {
            setPrompt(`${prompt.trim()} with reference to @${parsedData.filename}`);
          }
          
          // Add file to our files state so it can be referenced
          setFiles(prev => ({
            ...prev,
            [parsedData.filename]: parsedData.content
          }));
          
          toast.success(`File "${parsedData.filename}" added to conversation`);
        }
      } catch (error) {
        console.error('Error parsing dropped file data:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;
    
    // Check if current model is available
    if (!isModelAvailable(selectedModel)) {
      toast.error(`${selectedModel} is not available. Please select a different model or check your API keys.`);
      return;
    }
    
    // Process file references in prompt (replace @filename with file content)
    let processedPrompt = prompt;
    let fileRefs = [];
    const atMatches = [...prompt.matchAll(/@(\w+\.\w+)/g)];
    
    if (atMatches.length > 0) {
      atMatches.forEach(match => {
        const filename = match[1];
        if (files[filename]) {
          fileRefs.push({ filename, content: files[filename] });
          // For display purposes, we keep the @filename in the prompt
          // But we'll use the file references when processing
        }
      });
    }

    const userMessage = {
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      id: Date.now(), // Add unique ID for copying
      fileRefs: fileRefs.length > 0 ? fileRefs : undefined
    };
    
    setConversation(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setDroppedFiles([]);

    try {
      // Auto-truncate if conversation is getting too long
      let contextConversation = conversation;
      if (chatSettings.autoTruncate && conversation.length > chatSettings.maxMessages) {
        contextConversation = [
          conversation[0], // Keep system greeting
          ...conversation.slice(-chatSettings.maxMessages + 2) // Keep recent messages
        ];
      }
      
      // Build enhanced prompt with file contents
      let enhancedPrompt = prompt;
      
      if (fileRefs.length > 0) {
        enhancedPrompt += "\n\nHere are the referenced files:\n\n";
        fileRefs.forEach(fileRef => {
          enhancedPrompt += `\`\`\`${fileRef.filename}\n${fileRef.content}\n\`\`\`\n\n`;
        });
      }
      
      // Include dropped files if any
      if (droppedFiles.length > 0) {
        enhancedPrompt += "\n\nHere are the dropped files:\n\n";
        droppedFiles.forEach(file => {
          enhancedPrompt += `\`\`\`${file.name}\n${file.content}\n\`\`\`\n\n`;
        });
      }

      const response = await generateResponse(enhancedPrompt, {
        conversation: contextConversation,
        maxTokens: 1000,
        temperature: 0.7
      });
      
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        model: selectedModel,
        id: Date.now() + 1 // Add unique ID for copying
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
        isError: true,
        id: Date.now() + 2 // Add unique ID for copying
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
        timestamp: Date.now(),
        id: Date.now()
      }
    ]);
    
    if (chatSettings.saveHistory) {
      localStorage.removeItem('ai-assistant-history');
    }
    
    toast.success('Conversation cleared');
  };

  // Enhanced copy functionality
  const copyMessageToClipboard = async (message) => {
    try {
      let textToCopy = '';
      
      // Format the message based on its role
      if (message.role === 'user') {
        textToCopy = `Question: ${message.content}`;
      } else if (message.role === 'assistant') {
        textToCopy = `Answer: ${message.content}`;
        if (message.model) {
          textToCopy += `\n\n(Generated by ${message.model})`;
        }
      } else if (message.role === 'system') {
        textToCopy = `System: ${message.content}`;
      }
      
      await navigator.clipboard.writeText(textToCopy);
      
      // Show visual feedback
      setCopiedMessageId(message.id || message.timestamp);
      setTimeout(() => setCopiedMessageId(null), 2000);
      
      toast.success(`${message.role === 'user' ? 'Question' : 'Response'} copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  // Copy entire conversation
  const copyEntireConversation = async () => {
    try {
      const conversationText = conversation
        .filter(msg => msg.role !== 'system') // Exclude system messages
        .map(msg => {
          const timestamp = new Date(msg.timestamp).toLocaleString();
          const role = msg.role === 'user' ? 'Question' : 'Answer';
          let content = `[${timestamp}] ${role}: ${msg.content}`;
          if (msg.model && msg.role === 'assistant') {
            content += ` (${msg.model})`;
          }
          return content;
        })
        .join('\n\n');
        
      await navigator.clipboard.writeText(conversationText);
      toast.success('Entire conversation copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy conversation:', error);
      toast.error('Failed to copy conversation');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Tab' && showFileSuggestions && fileSuggestions.length > 0) {
      e.preventDefault();
      // Complete with the first suggestion
      handleFileSelect(fileSuggestions[0]);
    } else if (e.key === 'Escape') {
      // Hide suggestions on escape
      setShowFileSuggestions(false);
    }
  };
  
  const handleInputChange = (e) => {
    setPrompt(e.target.value);
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart);
    }
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
              <div className="bg-gray-800 px-3 py-1 text-xs text-gray-400 border-b border-gray-700 flex items-center justify-between">
                <span>{language}</span>
                <button
                  onClick={() => copyToClipboard(code)}
                  className="p-1 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
                  title="Copy code"
                >
                  <SafeIcon icon={FiCopy} className="text-xs" />
                </button>
              </div>
            )}
            <pre className="bg-gray-800 p-3 overflow-x-auto text-sm no-scrollbar">
              <code>{code}</code>
            </pre>
            {!language && (
              <button
                onClick={() => copyToClipboard(code)}
                className="absolute top-2 right-2 p-1 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 transition-colors"
                title="Copy code"
              >
                <SafeIcon icon={FiCopy} className="text-sm" />
              </button>
            )}
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
    <div 
      className={getContainerClasses()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
          {/* Copy entire conversation button */}
          <button
            onClick={copyEntireConversation}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Copy entire conversation"
          >
            <SafeIcon icon={FiClipboard} className="text-sm" />
          </button>
          
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
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-red-400 transition-colors">
            <SafeIcon icon={FiX} className="text-sm" />
          </button>
        </div>
      </div>
      
      {/* Chat messages with improved scrolling and copy functionality */}
      <div 
        ref={messagesContainerRef} 
        className={`flex-1 overflow-y-auto p-4 chat-messages-scroll smooth-scroll ${
          showScrollbar ? 'scrollbar-fade-in' : 'hover-show-scrollbar'
        } ${isDraggingOver ? 'border-2 border-dashed border-vibe-purple bg-vibe-purple/10' : ''}`}
      >
        {conversation.map((message, index) => (
          <motion.div
            key={message.id || index}
            className={`flex mb-4 group ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 relative ${
                message.role === 'user'
                  ? 'bg-vibe-purple text-white'
                  : message.role === 'system'
                  ? 'bg-dark-border text-gray-400 text-center text-sm'
                  : message.isError
                  ? 'bg-red-900/30 border border-red-500/50 text-red-200'
                  : 'bg-dark-bg text-white'
              }`}
            >
              {/* Copy button for each message */}
              {message.role !== 'system' && (
                <button
                  onClick={() => copyMessageToClipboard(message)}
                  className={`absolute top-2 right-2 p-1 rounded-md transition-all opacity-0 group-hover:opacity-100 ${
                    copiedMessageId === (message.id || message.timestamp)
                      ? 'bg-vibe-green text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                  title={`Copy ${message.role === 'user' ? 'question' : 'response'}`}
                >
                  <SafeIcon
                    icon={copiedMessageId === (message.id || message.timestamp) ? FiCheck : FiCopy}
                    className="text-xs"
                  />
                </button>
              )}
              
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
                <div className="text-sm pr-8">
                  {formatMessageContent(message.content)}
                </div>
              )}
              
              {message.role === 'system' && (
                <div className="text-xs italic">
                  {message.content}
                </div>
              )}
              
              {/* Show file references if any */}
              {message.fileRefs && message.fileRefs.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <div className="flex items-center text-xs">
                    <SafeIcon icon={FiPaperclip} className="mr-1" />
                    <span>File references:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {message.fileRefs.map((fileRef, idx) => (
                      <div 
                        key={idx}
                        className="px-2 py-1 bg-white/10 rounded-md text-xs flex items-center"
                      >
                        <SafeIcon icon={FiFile} className="mr-1" />
                        <span>{fileRef.filename}</span>
                      </div>
                    ))}
                  </div>
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
        
        {isDraggingOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-bg/80 pointer-events-none">
            <div className="p-4 bg-vibe-purple/20 border-2 border-dashed border-vibe-purple rounded-lg flex flex-col items-center">
              <SafeIcon icon={FiFile} className="text-4xl text-vibe-purple mb-2" />
              <span className="text-vibe-purple font-medium">Drop file to reference in chat</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Enhanced Chat input with file reference support */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-dark-border">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              onClick={() => inputRef.current && setCursorPosition(inputRef.current.selectionStart)}
              placeholder={!isModelAvailable(selectedModel) ? `${selectedModel} not available - check settings` : "Ask me anything or use @filename to reference code..."}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none text-white placeholder-gray-500"
              disabled={isLoading || !isModelAvailable(selectedModel)}
            />
            
            {/* File suggestions dropdown */}
            <AnimatePresence>
              {showFileSuggestions && (
                <motion.div 
                  className="absolute left-0 mt-1 bg-dark-bg border border-dark-border rounded-md shadow-lg z-50 w-64"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-1 max-h-40 overflow-y-auto">
                    {fileSuggestions.map((file) => (
                      <button
                        key={file}
                        onClick={() => handleFileSelect(file)}
                        className="w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-dark-border"
                      >
                        <SafeIcon icon={FiFile} className="text-vibe-blue" />
                        <span>{file}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading || !isModelAvailable(selectedModel)}
            className="p-2 bg-vibe-purple text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vibe-purple/80 transition-colors"
          >
            <SafeIcon icon={isLoading ? FiLoader : FiSend} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        {/* Dropped files indicator */}
        {droppedFiles.length > 0 && (
          <div className="mt-2 p-2 bg-dark-surface rounded-md border border-dark-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiFile} className="text-vibe-blue" />
              <span className="text-sm">{droppedFiles[0].name}</span>
            </div>
            <button 
              onClick={() => setDroppedFiles([])}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
            >
              <SafeIcon icon={FiX} className="text-sm" />
            </button>
          </div>
        )}
        
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
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={copyEntireConversation}
              className="text-vibe-blue hover:underline flex items-center space-x-1"
              title="Copy entire conversation"
            >
              <SafeIcon icon={FiClipboard} />
              <span>Copy All</span>
            </button>
            <button
              type="button"
              onClick={clearConversation}
              className="text-vibe-purple hover:underline flex items-center space-x-1"
            >
              <SafeIcon icon={FiTrash2} />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EnhancedAIAssistant;