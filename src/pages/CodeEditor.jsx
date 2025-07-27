import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import CodeMirrorEditor from '../components/CodeMirrorEditor';
import FileExplorer from '../components/FileExplorer';
import Terminal from '../components/Terminal';
import toast from 'react-hot-toast';

const { FiPlay, FiSave, FiSettings, FiMaximize2, FiShare2, FiDownload, FiCopy, FiClipboard, FiRefreshCw, FiGitBranch } = FiIcons;

const CodeEditor = () => {
  const [code, setCode] = useState(`// Welcome to FluxCode Editor
function greetDeveloper() {
  console.log("Hello, Developer! Ready to code with the perfect vibe?");
  
  const vibes = ['focused', 'creative', 'relaxed'];
  const currentVibe = vibes[Math.floor(Math.random() * vibes.length)];
  
  return \`Current vibe: \${currentVibe}\`;
}

greetDeveloper();`);

  const [activeFile, setActiveFile] = useState('main.js');
  const [showTerminal, setShowTerminal] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    autoSave: true
  });
  const [terminalOutput, setTerminalOutput] = useState([]);

  const runCode = () => {
    setIsRunning(true);
    setTerminalOutput([]);

    // Create a safe execution environment
    const runInSandbox = (codeStr) => {
      try {
        // Capture console.log output
        const logs = [];
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          logs.push(args.join(' '));
        };

        // Execute the code
        const result = new Function(codeStr)();

        // Restore original console.log
        console.log = originalConsoleLog;

        return {
          result: result !== undefined ? String(result) : undefined,
          logs
        };
      } catch (error) {
        return { error: error.message };
      }
    };

    setTimeout(() => {
      const output = runInSandbox(`
        ${code}
        //# sourceURL=user-code.js
      `);

      const newOutput = [];
      if (output.logs && output.logs.length) {
        output.logs.forEach(log => {
          newOutput.push({ type: 'output', content: log });
        });
      }

      if (output.result !== undefined) {
        newOutput.push({ type: 'output', content: `=> ${output.result}` });
      }

      if (output.error) {
        newOutput.push({ type: 'error', content: `Error: ${output.error}` });
      }

      setTerminalOutput(newOutput);
      setIsRunning(false);

      if (!output.error) {
        toast.success('Code executed successfully!');
      } else {
        toast.error('Execution failed!');
      }
    }, 700);
  };

  const saveCode = () => {
    // In a real app, this would save to a database or file system
    toast.success(`File ${activeFile} saved successfully!`);
    // Simulate saving to localStorage
    localStorage.setItem(`flux-code-${activeFile}`, code);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code)
      .then(() => toast.success('Code copied to clipboard!'))
      .catch(() => toast.error('Failed to copy code'));
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/javascript' });
    element.href = URL.createObjectURL(file);
    element.download = activeFile;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloading ${activeFile}`);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const updateSettings = (key, value) => {
    setEditorSettings({ ...editorSettings, [key]: value });
  };

  // Update terminal when running code
  const handleTerminalCommand = (command) => {
    if (command === 'run' || command === 'node main.js') {
      runCode();
      return terminalOutput;
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <motion.div
        className="flex items-center justify-between bg-dark-surface border-b border-dark-border px-4 py-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-4">
          <h2 className="font-semibold text-white">Code Editor</h2>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-vibe-purple/20 text-vibe-purple rounded-full text-sm">
              {activeFile}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`p-2 ${
              isRunning ? 'text-vibe-green animate-pulse' : 'text-gray-400 hover:text-vibe-green'
            } transition-colors relative group`}
            title="Run code"
          >
            <SafeIcon icon={isRunning ? FiRefreshCw : FiPlay} className="text-lg" />
            <span className="absolute hidden group-hover:block -bottom-8 left-1/2 transform -translate-x-1/2 bg-dark-bg border border-dark-border px-2 py-1 rounded text-xs whitespace-nowrap">
              Run code
            </span>
          </button>

          <button
            onClick={saveCode}
            className="p-2 text-gray-400 hover:text-vibe-blue transition-colors relative group"
            title="Save file"
          >
            <SafeIcon icon={FiSave} className="text-lg" />
            <span className="absolute hidden group-hover:block -bottom-8 left-1/2 transform -translate-x-1/2 bg-dark-bg border border-dark-border px-2 py-1 rounded text-xs whitespace-nowrap">
              Save file
            </span>
          </button>

          <button
            onClick={copyCode}
            className="p-2 text-gray-400 hover:text-vibe-purple transition-colors relative group"
            title="Copy to clipboard"
          >
            <SafeIcon icon={FiCopy} className="text-lg" />
            <span className="absolute hidden group-hover:block -bottom-8 left-1/2 transform -translate-x-1/2 bg-dark-bg border border-dark-border px-2 py-1 rounded text-xs whitespace-nowrap">
              Copy code
            </span>
          </button>

          <button
            onClick={downloadCode}
            className="p-2 text-gray-400 hover:text-vibe-orange transition-colors relative group"
            title="Download file"
          >
            <SafeIcon icon={FiDownload} className="text-lg" />
            <span className="absolute hidden group-hover:block -bottom-8 left-1/2 transform -translate-x-1/2 bg-dark-bg border border-dark-border px-2 py-1 rounded text-xs whitespace-nowrap">
              Download file
            </span>
          </button>

          <button
            onClick={toggleSettings}
            className={`p-2 ${
              showSettings ? 'text-vibe-purple' : 'text-gray-400 hover:text-white'
            } transition-colors relative group`}
            title="Editor settings"
          >
            <SafeIcon icon={FiSettings} className="text-lg" />
            <span className="absolute hidden group-hover:block -bottom-8 left-1/2 transform -translate-x-1/2 bg-dark-bg border border-dark-border px-2 py-1 rounded text-xs whitespace-nowrap">
              Editor settings
            </span>
          </button>

          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className="p-2 text-gray-400 hover:text-white transition-colors relative group"
            title={showTerminal ? "Hide terminal" : "Show terminal"}
          >
            <SafeIcon icon={FiMaximize2} className="text-lg" />
            <span className="absolute hidden group-hover:block -bottom-8 left-1/2 transform -translate-x-1/2 bg-dark-bg border border-dark-border px-2 py-1 rounded text-xs whitespace-nowrap">
              {showTerminal ? "Hide terminal" : "Show terminal"}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Editor Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={editorSettings.theme}
                    onChange={(e) => updateSettings('theme', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none text-white"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="aura">Aura</option>
                    <option value="github">GitHub</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Font Size
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="12"
                      max="20"
                      value={editorSettings.fontSize}
                      onChange={(e) => updateSettings('fontSize', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-dark-bg rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-2 text-white">{editorSettings.fontSize}px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tab Size
                  </label>
                  <div className="flex space-x-2">
                    {[2, 4, 8].map(size => (
                      <button
                        key={size}
                        onClick={() => updateSettings('tabSize', size)}
                        className={`flex-1 py-2 rounded ${
                          editorSettings.tabSize === size
                            ? 'bg-vibe-purple text-white'
                            : 'bg-dark-bg text-gray-400 hover:bg-dark-border'
                        }`}
                      >
                        {size} spaces
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Word Wrap
                  </label>
                  <button
                    onClick={() => updateSettings('wordWrap', !editorSettings.wordWrap)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editorSettings.wordWrap ? 'bg-vibe-purple' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editorSettings.wordWrap ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Auto Save
                  </label>
                  <button
                    onClick={() => updateSettings('autoSave', !editorSettings.autoSave)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editorSettings.autoSave ? 'bg-vibe-purple' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editorSettings.autoSave ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-vibe-purple hover:bg-vibe-purple/80 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        <FileExplorer onFileSelect={setActiveFile} />
        
        <motion.div
          className="flex-1 flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`${showTerminal ? 'h-3/5' : 'h-full'} border-b border-dark-border`}>
            <CodeMirrorEditor 
              value={code} 
              onChange={setCode} 
              language="javascript" 
            />
          </div>
          
          {showTerminal && (
            <motion.div
              className="h-2/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Terminal 
                initialOutput={[
                  { type: 'output', content: 'Welcome to FluxCode Terminal! 🚀' },
                  { type: 'output', content: 'Type "run" to execute your code.' }
                ]}
                customOutput={terminalOutput}
                onCommand={handleTerminalCommand}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CodeEditor;