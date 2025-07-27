import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import LLMSettings from '../components/LLMSettings';
import toast from 'react-hot-toast';

const { FiUser, FiPalette, FiBell, FiShield, FiCode, FiSave, FiBrain } = FiIcons;

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'Full-stack developer passionate about creating amazing experiences',
    },
    appearance: {
      theme: 'dark',
      accentColor: 'purple',
      fontSize: 'medium',
    },
    notifications: {
      vibeReminders: true,
      productivityAlerts: true,
      projectUpdates: false,
    },
    editor: {
      tabSize: 2,
      wordWrap: true,
      lineNumbers: true,
      autoSave: true,
    },
  });

  // Load saved settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('vibeCodeSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        applyTheme(parsed.appearance.theme);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Apply theme when component mounts or theme changes
  useEffect(() => {
    applyTheme(settings.appearance.theme);
  }, [settings.appearance.theme]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const body = document.body;

    // Remove existing theme classes
    root.classList.remove('light-theme', 'dark-theme');
    body.classList.remove('light-theme', 'dark-theme');

    switch(theme) {
      case 'light':
        root.classList.add('light-theme');
        body.classList.add('light-theme');
        document.body.style.backgroundColor = '#f8f9fa';
        break;
      case 'dark':
        root.classList.add('dark-theme');
        body.classList.add('dark-theme');
        document.body.style.backgroundColor = '#0F0F23';
        break;
      case 'auto':
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
        break;
      default:
        applyTheme('dark');
    }

    // Force immediate re-render of components
    setTimeout(() => {
      const event = new Event('themechange');
      window.dispatchEvent(event);
    }, 0);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'appearance', name: 'Appearance', icon: FiPalette },
    { id: 'notifications', name: 'Notifications', icon: FiBell },
    { id: 'editor', name: 'Editor', icon: FiCode },
    { id: 'security', name: 'Security', icon: FiShield },
    { id: 'llm', name: 'LLM Settings', icon: FiBrain },
  ];

  const handleSave = () => {
    // Save settings to localStorage for persistence
    localStorage.setItem('vibeCodeSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
        <input
          type="text"
          value={settings.profile.name}
          onChange={(e) => updateSetting('profile', 'name', e.target.value)}
          className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={settings.profile.email}
          onChange={(e) => updateSetting('profile', 'email', e.target.value)}
          className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
        <textarea
          value={settings.profile.bio}
          onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
          rows="3"
          className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none text-white"
        />
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
        <select
          value={settings.appearance.theme}
          onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
          className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none text-white"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="auto">Auto</option>
        </select>
        <p className="mt-2 text-xs text-gray-400">
          Current theme: <span className="font-medium capitalize">{settings.appearance.theme}</span>
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
        <div className="grid grid-cols-5 gap-3">
          {['purple', 'blue', 'green', 'orange', 'pink'].map((color) => (
            <button
              key={color}
              onClick={() => updateSetting('appearance', 'accentColor', color)}
              className={`w-12 h-12 rounded-lg border-2 ${settings.appearance.accentColor === color ? 'border-white' : 'border-transparent'} bg-vibe-${color} relative transition-all duration-200 hover:scale-110`}
            >
              {settings.appearance.accentColor === color && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-vibe-purple rounded-full"></span>
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Selected color: <span className={`text-vibe-${settings.appearance.accentColor} font-medium`}>
            {settings.appearance.accentColor.charAt(0).toUpperCase() + settings.appearance.accentColor.slice(1)}
          </span>
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
        <select
          value={settings.appearance.fontSize}
          onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value)}
          className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none text-white"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <div className="pt-4 mt-6 border-t border-dark-border">
        <h3 className="text-md font-medium text-white mb-3">Theme Preview</h3>
        <div className={`p-4 rounded-lg border transition-all duration-300 ${settings.appearance.theme === 'light' ? 'bg-white border-gray-200 text-gray-800' : 'bg-dark-bg border-dark-border text-white'}`}>
          <div className="mb-3">
            <h4 className={`font-semibold mb-1 text-${settings.appearance.fontSize === 'small' ? 'sm' : settings.appearance.fontSize === 'large' ? 'lg' : 'base'}`}>
              Preview Content
            </h4>
            <p className={`text-${settings.appearance.fontSize === 'small' ? 'xs' : settings.appearance.fontSize === 'large' ? 'base' : 'sm'} opacity-75`}>
              This is how your content will appear with the current theme settings.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className={`px-3 py-1 bg-vibe-${settings.appearance.accentColor} text-white rounded-md text-sm hover:opacity-80 transition-opacity`}>
              Sample Button
            </button>
            <div className={`w-3 h-3 bg-vibe-${settings.appearance.accentColor} rounded-full`}></div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          💡 Changes are applied immediately. Click "Save" to persist your settings.
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h4>
            <p className="text-gray-400 text-sm">
              {key === 'vibeReminders' && 'Get reminders to set your coding vibe'}
              {key === 'productivityAlerts' && 'Receive alerts about productivity patterns'}
              {key === 'projectUpdates' && 'Notifications about project changes'}
            </p>
          </div>
          <button
            onClick={() => updateSetting('notifications', key, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-vibe-purple' : 'bg-gray-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderEditorSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Tab Size</label>
        <select
          value={settings.editor.tabSize}
          onChange={(e) => updateSetting('editor', 'tabSize', parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none text-white"
        >
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value={8}>8 spaces</option>
        </select>
      </div>
      {['wordWrap', 'lineNumbers', 'autoSave'].map((setting) => (
        <div key={setting} className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">
              {setting.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h4>
          </div>
          <button
            onClick={() => updateSetting('editor', setting, !settings.editor[setting])}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.editor[setting] ? 'bg-vibe-purple' : 'bg-gray-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.editor[setting] ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Two-Factor Authentication</h4>
        <p className="text-gray-400 text-sm mb-3">
          Add an extra layer of security to your account
        </p>
        <button 
          onClick={() => toast.success('2FA setup initiated!')}
          className="px-4 py-2 bg-vibe-green hover:bg-vibe-green/80 text-white rounded-lg transition-colors"
        >
          Enable 2FA
        </button>
      </div>
      <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Change Password</h4>
        <p className="text-gray-400 text-sm mb-3">
          Update your password regularly for better security
        </p>
        <button 
          onClick={() => toast.success('Password change initiated!')}
          className="px-4 py-2 bg-vibe-blue hover:bg-vibe-blue/80 text-white rounded-lg transition-colors"
        >
          Change Password
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'notifications': return renderNotificationSettings();
      case 'editor': return renderEditorSettings();
      case 'security': return renderSecuritySettings();
      case 'llm': return <LLMSettings />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Customize your VibeCoding experience</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id ? 'bg-vibe-purple text-white' : 'text-gray-400 hover:text-white hover:bg-dark-border'}`}
                >
                  <SafeIcon icon={tab.icon} />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-vibe-purple hover:bg-vibe-purple/80 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiSave} />
                <span>Save</span>
              </button>
            </div>
            {renderTabContent()}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;