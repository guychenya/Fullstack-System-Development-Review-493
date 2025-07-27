import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AIAssistant from '../AIAssistant';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMessageCircle, FiMaximize2, FiMinimize2, FiX } = FiIcons;

const UnifiedLayout = ({ children }) => {
  const [chatMode, setChatMode] = useState('overlay'); // 'overlay', 'split', 'fullscreen'
  const [chatVisible, setChatVisible] = useState(false);
  const [splitRatio, setSplitRatio] = useState(0.4); // 40% chat, 60% content
  const [isDragging, setIsDragging] = useState(false);
  const [chatConnected, setChatConnected] = useState(false);
  const location = useLocation();

  // Mock connection status - in real app, this would come from LLM store
  useEffect(() => {
    // Simulate connection check
    const checkConnection = () => {
      // This would check actual LLM connection status
      setChatConnected(Math.random() > 0.3); // 70% chance of being connected
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10s
    
    return () => clearInterval(interval);
  }, []);

  // Handle resize drag
  const handleMouseDown = (e) => {
    if (chatMode !== 'split') return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || chatMode !== 'split') return;
    
    const newRatio = 1 - (e.clientX / window.innerWidth);
    setSplitRatio(Math.max(0.2, Math.min(0.8, newRatio)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Chat toggle with mode cycling
  const toggleChat = () => {
    if (!chatVisible) {
      setChatVisible(true);
      setChatMode('overlay');
    } else {
      // Cycle through modes: overlay -> split -> fullscreen -> closed
      switch (chatMode) {
        case 'overlay':
          setChatMode('split');
          break;
        case 'split':
          setChatMode('fullscreen');
          break;
        case 'fullscreen':
          setChatVisible(false);
          setChatMode('overlay');
          break;
        default:
          setChatVisible(false);
      }
    }
  };

  const closeChat = () => {
    setChatVisible(false);
    setChatMode('overlay');
  };

  // Render chat button with connection indicator
  const renderChatButton = () => (
    <motion.button
      className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-40 text-white relative ${
        chatConnected ? 'bg-vibe-purple' : 'bg-gray-600'
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleChat}
    >
      <SafeIcon icon={FiMessageCircle} className="text-xl" />
      
      {/* Connection indicator */}
      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
        chatConnected ? 'bg-vibe-green animate-pulse' : 'bg-red-500'
      }`}>
        {chatConnected && (
          <motion.div
            className="w-full h-full rounded-full bg-vibe-green"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      
      {/* Mode indicator */}
      {chatVisible && (
        <div className="absolute -bottom-1 -left-1 px-1 py-0.5 bg-dark-surface border border-dark-border rounded text-xs">
          {chatMode === 'split' && 'Split'}
          {chatMode === 'fullscreen' && 'Full'}
          {chatMode === 'overlay' && 'Over'}
        </div>
      )}
    </motion.button>
  );

  // Render based on chat mode
  const renderLayout = () => {
    switch (chatMode) {
      case 'fullscreen':
        return (
          <div className="flex h-screen bg-dark-bg">
            <AnimatePresence>
              {chatVisible && (
                <motion.div
                  className="w-full h-full relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Fullscreen chat header */}
                  <div className="absolute top-4 left-4 z-50 flex items-center space-x-2">
                    <button
                      onClick={() => setChatMode('split')}
                      className="p-2 bg-dark-surface border border-dark-border rounded-lg text-gray-400 hover:text-white transition-colors"
                      title="Split view"
                    >
                      <SafeIcon icon={FiMinimize2} />
                    </button>
                    <button
                      onClick={closeChat}
                      className="p-2 bg-dark-surface border border-dark-border rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                      title="Close chat"
                    >
                      <SafeIcon icon={FiX} />
                    </button>
                  </div>
                  
                  <AIAssistant 
                    mode="fullscreen" 
                    onClose={closeChat}
                    onModeChange={setChatMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'split':
        return (
          <div className="flex h-screen bg-dark-bg">
            <Sidebar />
            
            {/* Main content area */}
            <div 
              className="flex flex-col overflow-hidden transition-all duration-300"
              style={{ width: `${(1 - splitRatio) * 100}%` }}
            >
              <Header />
              <motion.main 
                className="flex-1 overflow-auto p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.main>
            </div>

            {/* Resize handle */}
            <div
              className="w-1 bg-dark-border hover:bg-vibe-purple cursor-col-resize transition-colors"
              onMouseDown={handleMouseDown}
            />

            {/* Chat area */}
            <AnimatePresence>
              {chatVisible && (
                <motion.div
                  className="flex flex-col bg-dark-surface border-l border-dark-border"
                  style={{ width: `${splitRatio * 100}%` }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${splitRatio * 100}%`, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Chat header */}
                  <div className="flex items-center justify-between p-4 border-b border-dark-border">
                    <h3 className="font-medium text-white">AI Assistant</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setChatMode('fullscreen')}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="Fullscreen"
                      >
                        <SafeIcon icon={FiMaximize2} />
                      </button>
                      <button
                        onClick={closeChat}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Close"
                      >
                        <SafeIcon icon={FiX} />
                      </button>
                    </div>
                  </div>
                  
                  <AIAssistant 
                    mode="split" 
                    onClose={closeChat}
                    onModeChange={setChatMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      default: // overlay mode
        return (
          <div className="flex h-screen bg-dark-bg">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <motion.main
                className="flex-1 overflow-auto p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.main>
            </div>
            
            {/* Overlay chat */}
            <AnimatePresence>
              {chatVisible && (
                <motion.div
                  className="fixed bottom-24 right-6 w-96 h-[600px] z-30"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <AIAssistant 
                    mode="overlay" 
                    onClose={closeChat}
                    onModeChange={setChatMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
    }
  };

  return (
    <>
      {renderLayout()}
      {!chatVisible && renderChatButton()}
    </>
  );
};

export default UnifiedLayout;