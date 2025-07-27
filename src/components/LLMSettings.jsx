import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useLLMStore } from '../store/llmStore';
import toast from 'react-hot-toast';

const { FiKey, FiServer, FiCheck, FiX, FiRefreshCw, FiShield, FiTrash2, FiCpu, FiBrain, FiGlobe, FiSettings, FiZap, FiLoader } = FiIcons;

const LLMSettings = () => {
  const {
    selectedModel,
    apiKeys,
    ollamaStatus,
    ollamaModels,
    ollamaUrl,
    setApiKey,
    removeApiKey,
    setSelectedModel,
    checkOllamaConnection,
    validateApiKey,
    setOllamaUrl
  } = useLLMStore();

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState({});
  const [newApiKey, setNewApiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('ollama');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customOllamaUrl, setCustomOllamaUrl] = useState(ollamaUrl);
  const [showOllamaSettings, setShowOllamaSettings] = useState(false);

  // Enhanced LLM providers configuration
  const llmProviders = [
    {
      id: 'ollama',
      name: 'Ollama (Local)',
      description: 'Run models locally without API keys',
      icon: FiCpu,
      models: ollamaModels.length > 0 ? ollamaModels : ['llama2', 'codellama', 'mistral'],
      requiresKey: false,
      color: 'text-orange-400'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT-3.5, GPT-4, and GPT-4 Turbo models',
      icon: FiBrain,
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
      requiresKey: true,
      color: 'text-green-400',
      website: 'https://platform.openai.com/api-keys'
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude 3 models (Opus, Sonnet, Haiku)',
      icon: FiGlobe,
      models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      requiresKey: true,
      color: 'text-purple-400',
      website: 'https://console.anthropic.com/'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Google\'s latest LLM models',
      icon: FiBrain,
      models: ['gemini-pro', 'gemini-pro-vision'],
      requiresKey: true,
      color: 'text-blue-400',
      website: 'https://makersuite.google.com/app/apikey'
    },
    {
      id: 'mistral',
      name: 'Mistral AI',
      description: 'Efficient open-weight models',
      icon: FiGlobe,
      models: ['mistral-tiny', 'mistral-small', 'mistral-medium', 'mistral-large-latest'],
      requiresKey: true,
      color: 'text-red-400',
      website: 'https://console.mistral.ai/'
    },
    {
      id: 'groq',
      name: 'Groq',
      description: 'Ultra-fast inference with Llama, Mixtral, and Gemma',
      icon: FiZap,
      models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'],
      requiresKey: true,
      color: 'text-yellow-400',
      website: 'https://console.groq.com/keys'
    }
  ];

  // Check Ollama connection on component mount
  useEffect(() => {
    checkOllamaStatus();
  }, []);

  // Function to check Ollama status
  const checkOllamaStatus = async () => {
    setLoading(true);
    try {
      await checkOllamaConnection();
    } catch (error) {
      console.error("Failed to check Ollama connection:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle provider change
  const handleProviderChange = (providerId) => {
    setSelectedProvider(providerId);
    setNewApiKey('');
  };

  // Handle API key submission with enhanced validation
  const handleApiKeySubmit = async () => {
    if (!newApiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setValidating(prev => ({ ...prev, [selectedProvider]: true }));
    try {
      await validateApiKey(selectedProvider, newApiKey);
      setApiKey(selectedProvider, newApiKey);
      toast.success(`${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)} API key validated and saved successfully!`);
      setNewApiKey('');
      setShowKeyModal(false);
    } catch (error) {
      console.error('API key validation failed:', error);
      toast.error(error.message || 'API key validation failed');
    } finally {
      setValidating(prev => ({ ...prev, [selectedProvider]: false }));
    }
  };

  // Handle model selection
  const handleModelSelect = (model) => {
    const provider = llmProviders.find(p => p.models.includes(model));
    if (provider && provider.requiresKey && !apiKeys[provider.id]) {
      toast.error(`Please add an API key for ${provider.name} first`);
      setShowKeyModal(true);
      setSelectedProvider(provider.id);
      return;
    }

    setSelectedModel(model);
    toast.success(`Model changed to ${model}`);
  };

  // Handle removing an API key
  const handleRemoveApiKey = (provider) => {
    if (confirm(`Are you sure you want to remove the API key for ${provider}?`)) {
      removeApiKey(provider);
      toast.success(`Removed API key for ${provider}`);

      // If the selected model was using this provider, switch to Ollama
      const currentModelProvider = llmProviders.find(p => p.models.includes(selectedModel));
      if (currentModelProvider && currentModelProvider.id === provider) {
        setSelectedModel('llama2');
        toast.info('Switched to default Ollama model');
      }
    }
  };

  // Save Ollama URL settings
  const saveOllamaSettings = async () => {
    setOllamaUrl(customOllamaUrl);
    setShowOllamaSettings(false);
    toast.success('Ollama settings updated');
    // Check connection with new URL
    await checkOllamaConnection();
  };

  // Get available models for the selected provider
  const getAvailableModels = () => {
    const provider = llmProviders.find(p => p.id === selectedProvider);
    return provider ? provider.models : [];
  };

  // Get provider for a model
  const getProviderForModel = (model) => {
    return llmProviders.find(p => p.models.includes(model));
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">LLM Configuration</h3>

        {/* Ollama Status */}
        <div className="mb-6 flex items-center justify-between p-4 bg-dark-bg rounded-lg">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiServer} className={ollamaStatus ? 'text-vibe-green' : 'text-vibe-orange'} />
            <div>
              <h4 className="font-medium text-white">Ollama Status</h4>
              <p className="text-sm text-gray-400">
                {loading ? 'Checking connection...' : ollamaStatus ? 'Connected' : 'Not connected'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {ollamaUrl}
              </p>
              {ollamaModels.length > 0 && (
                <p className="text-xs text-vibe-green mt-1">
                  {ollamaModels.length} models available
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowOllamaSettings(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Ollama Settings"
            >
              <SafeIcon icon={FiSettings} />
            </button>
            <button
              onClick={checkOllamaStatus}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Check connection"
            >
              <SafeIcon icon={loading ? FiRefreshCw : FiRefreshCw} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Current Model Section */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Current Model</h4>
          <div className="p-4 bg-dark-bg rounded-lg border border-dark-border mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {(() => {
                  const provider = getProviderForModel(selectedModel);
                  return provider ? (
                    <SafeIcon icon={provider.icon} className={provider.color} />
                  ) : (
                    <SafeIcon icon={FiCpu} className="text-gray-400" />
                  );
                })()}
                <div>
                  <h5 className="font-medium text-white">{selectedModel}</h5>
                  <p className="text-sm text-gray-400">
                    {getProviderForModel(selectedModel)?.name || 'Unknown provider'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(true)}
                className="px-3 py-1 bg-vibe-purple hover:bg-vibe-purple/80 text-white text-sm rounded transition-colors"
              >
                Change Model
              </button>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">API Keys</h4>
          <div className="space-y-3 content-scroll hover-show-scrollbar smooth-scroll max-h-[400px] overflow-y-auto pr-1">
            {llmProviders
              .filter(provider => provider.requiresKey)
              .map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-dark-border"
                >
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={provider.icon} className={provider.color} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-white">{provider.name}</h5>
                        {provider.website && (
                          <a
                            href={provider.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-vibe-purple hover:underline"
                          >
                            Get API Key
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {provider.description}
                      </p>
                      <div className="text-xs mt-1">
                        {apiKeys[provider.id] ? (
                          <span className="text-vibe-green flex items-center">
                            <SafeIcon icon={FiCheck} className="mr-1" />
                            API Key configured
                          </span>
                        ) : (
                          <span className="text-gray-500">No API key</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {apiKeys[provider.id] ? (
                      <button
                        onClick={() => handleRemoveApiKey(provider.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove API key"
                      >
                        <SafeIcon icon={FiTrash2} />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedProvider(provider.id);
                          setShowKeyModal(true);
                        }}
                        className="px-3 py-1 bg-dark-bg border border-dark-border hover:border-gray-600 text-sm text-gray-300 rounded transition-colors"
                      >
                        Add Key
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Add API Key Modal */}
      {showKeyModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowKeyModal(false)}
        >
          <motion.div
            className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {selectedProvider === 'ollama' ? 'Select Model' : 'Configure LLM Provider'}
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <SafeIcon icon={FiX} />
              </button>
            </div>

            {/* Provider Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select Provider
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {llmProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderChange(provider.id)}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      selectedProvider === provider.id
                        ? 'border-vibe-purple bg-vibe-purple/10'
                        : 'border-dark-border hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <SafeIcon
                        icon={provider.icon}
                        className={selectedProvider === provider.id ? "text-vibe-purple" : provider.color}
                      />
                      <div>
                        <p
                          className={`font-medium ${
                            selectedProvider === provider.id ? 'text-white' : 'text-gray-300'
                          }`}
                        >
                          {provider.name}
                        </p>
                        {apiKeys[provider.id] && (
                          <div className="flex items-center text-xs text-vibe-green mt-1">
                            <SafeIcon icon={FiCheck} className="mr-1" />
                            Configured
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      {provider.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Input (if needed) */}
            {selectedProvider !== 'ollama' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">
                    API Key for {llmProviders.find(p => p.id === selectedProvider)?.name}
                  </label>
                  {llmProviders.find(p => p.id === selectedProvider)?.website && (
                    <a
                      href={llmProviders.find(p => p.id === selectedProvider)?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-vibe-purple hover:underline"
                    >
                      Get API Key →
                    </a>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <SafeIcon
                      icon={FiKey}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="password"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none"
                      placeholder="Enter API key"
                      onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
                    />
                  </div>
                  <button
                    onClick={handleApiKeySubmit}
                    disabled={validating[selectedProvider] || !newApiKey.trim()}
                    className="px-4 py-3 bg-vibe-purple hover:bg-vibe-purple/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {validating[selectedProvider] && <SafeIcon icon={FiLoader} className="animate-spin" />}
                    <span>{validating[selectedProvider] ? 'Validating...' : 'Validate & Save'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-400 flex items-center">
                    <SafeIcon icon={FiShield} className="mr-1" />
                    Your API keys are stored securely in your browser
                  </p>
                  {validating[selectedProvider] && (
                    <p className="text-xs text-vibe-orange">
                      Testing API key validity...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Available Models ({getAvailableModels().length})
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto hover-show-scrollbar scrollbar-fade-in p-1">
                {getAvailableModels().map((model) => (
                  <button
                    key={model}
                    onClick={() => handleModelSelect(model)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      selectedModel === model
                        ? 'border-vibe-purple bg-vibe-purple/10 text-white'
                        : 'border-dark-border hover:border-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{model}</div>
                    {selectedModel === model && (
                      <div className="text-xs text-vibe-purple mt-1">Currently selected</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Ollama Settings Modal */}
      {showOllamaSettings && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowOllamaSettings(false)}
        >
          <motion.div
            className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-md"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Ollama Settings</h3>
              <button
                onClick={() => setShowOllamaSettings(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <SafeIcon icon={FiX} />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ollama Server URL
              </label>
              <input
                type="text"
                value={customOllamaUrl}
                onChange={(e) => setCustomOllamaUrl(e.target.value)}
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none"
                placeholder="http://localhost:11434"
              />
              <p className="text-xs text-gray-400 mt-2">
                Default: http://localhost:11434
              </p>
              <div className="mt-3 p-3 bg-vibe-orange/10 border border-vibe-orange/20 rounded-lg">
                <p className="text-xs text-vibe-orange">
                  <strong>CORS Setup Required:</strong> For browser access, start Ollama with:
                </p>
                <code className="block bg-dark-bg p-2 rounded mt-2 text-xs font-mono">
                  OLLAMA_ORIGINS=* ollama serve
                </code>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowOllamaSettings(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveOllamaSettings}
                className="px-4 py-2 bg-vibe-purple hover:bg-vibe-purple/80 text-white rounded-lg transition-colors"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LLMSettings;