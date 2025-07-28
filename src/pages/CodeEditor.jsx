import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import CodeMirrorEditor from '../components/CodeMirrorEditor';
import FileExplorer from '../components/FileExplorer';
import Terminal from '../components/Terminal';
import toast from 'react-hot-toast';

const { 
  FiPlay, FiSave, FiSettings, FiMaximize2, FiShare2, 
  FiDownload, FiCopy, FiClipboard, FiRefreshCw, FiGitBranch,
  FiTerminal, FiCode, FiLayout, FiCpu
} = FiIcons;

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
  const [terminalHeight, setTerminalHeight] = useState('30%'); // Default height
  const [layout, setLayout] = useState('split-horizontal'); // split-horizontal, split-vertical, editor-only, terminal-only
  
  // File system simulation
  const [files, setFiles] = useState({
    'main.js': `// Welcome to FluxCode Editor
function greetDeveloper() {
  console.log("Hello, Developer! Ready to code with the perfect vibe?");
  
  const vibes = ['focused', 'creative', 'relaxed'];
  const currentVibe = vibes[Math.floor(Math.random() * vibes.length)];
  
  return \`Current vibe: \${currentVibe}\`;
}

greetDeveloper();`,
    'app.js': `import React from 'react';

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

  // Update code when activeFile changes
  useEffect(() => {
    if (files[activeFile]) {
      setCode(files[activeFile]);
    }
  }, [activeFile, files]);

  // Save changes to the file system
  useEffect(() => {
    if (activeFile && editorSettings.autoSave) {
      const updatedFiles = { ...files };
      updatedFiles[activeFile] = code;
      setFiles(updatedFiles);
    }
  }, [code, activeFile, editorSettings.autoSave]);

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
      const output = runInSandbox(` ${code} //# sourceURL=user-code.js `);
      
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
    // Update the file in our simulated file system
    const updatedFiles = { ...files };
    updatedFiles[activeFile] = code;
    setFiles(updatedFiles);
    
    toast.success(`File ${activeFile} saved successfully!`);
    
    // Also save to localStorage for persistence
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

  // Handle terminal command
  const handleTerminalCommand = (command, data) => {
    if (command === 'run' || command === 'node main.js') {
      runCode();
      return terminalOutput;
    } else if (command === 'openEditor' && data) {
      // Handle opening file in editor
      setActiveFile(data.filename);
      setCode(data.content);
      return null;
    }
    return null;
  };

  // Create a new file
  const createNewFile = (filename, content = '') => {
    if (!files[filename]) {
      const updatedFiles = { ...files };
      updatedFiles[filename] = content;
      setFiles(updatedFiles);
      setActiveFile(filename);
      setCode(content);
      toast.success(`Created new file: ${filename}`);
      return true;
    } else {
      toast.error(`File ${filename} already exists`);
      return false;
    }
  };

  // Toggle layout mode
  const toggleLayout = () => {
    const layouts = ['split-horizontal', 'split-vertical', 'editor-only', 'terminal-only'];
    const currentIndex = layouts.indexOf(layout);
    const nextIndex = (currentIndex + 1) % layouts.length;
    setLayout(layouts[nextIndex]);
    
    // If switching to terminal-only, make sure terminal is visible
    if (layouts[nextIndex] === 'terminal-only') {
      setShowTerminal(true);
    }
    
    toast.success(`Layout changed to ${layouts[nextIndex].replace('-', ' ')}`);
  };

  // Adjust terminal height
  const resizeTerminal = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = terminalRef.current.offsetHeight;
    
    const handleMouseMove = (moveEvent) => {
      const containerHeight = containerRef.current.offsetHeight;
      const newHeight = startHeight - (moveEvent.clientY - startY);
      const heightPercent = Math.min(Math.max((newHeight / containerHeight) * 100, 20), 80);
      setTerminalHeight(`${heightPercent}%`);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // References for resize functionality
  const terminalRef = React.useRef(null);
  const containerRef = React.useRef(null);

  // Render layout based on selected mode
  const renderLayout = () => {
    switch (layout) {
      case 'split-vertical':
        return (
          <div className="flex-1 flex h-full">
            <div className="w-1/2 flex flex-col border-r border-dark-border">
              <div className="flex-1 overflow-auto">
                <CodeMirrorEditor value={code} onChange={setCode} language="javascript" />
              </div>
            </div>
            <div className="w-1/2 flex flex-col">
              <Terminal 
                initialOutput={[
                  { type: 'output', content: 'Welcome to FluxCode Terminal! 🚀' },
                  { type: 'output', content: 'Type "help" to see available commands.' }
                ]} 
                customOutput={terminalOutput}
                onCommand={handleTerminalCommand}
              />
            </div>
          </div>
        );
        
      case 'editor-only':
        return (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto">
              <CodeMirrorEditor value={code} onChange={setCode} language="javascript" />
            </div>
          </div>
        );
        
      case 'terminal-only':
        return (
          <div className="flex-1 flex flex-col">
            <Terminal 
              initialOutput={[
                { type: 'output', content: 'Welcome to FluxCode Terminal! 🚀' },
                { type: 'output', content: 'Type "help" to see available commands.' }
              ]} 
              customOutput={terminalOutput}
              onCommand={handleTerminalCommand}
            />
          </div>
        );
        
      case 'split-horizontal':
      default:
        return (
          <div ref={containerRef} className="flex-1 flex flex-col">
            <div 
              className={`${showTerminal ? '' : 'flex-1'}`} 
              style={{ height: showTerminal ? `calc(100% - ${terminalHeight})` : '100%' }}
            >
              <CodeMirrorEditor value={code} onChange={setCode} language="javascript" />
            </div>
            
            {showTerminal && (
              <>
                <div 
                  className="h-1 bg-dark-border hover:bg-vibe-purple cursor-row-resize" 
                  onMouseDown={resizeTerminal}
                ></div>
                <div ref={terminalRef} style={{ height: terminalHeight }}>
                  <Terminal 
                    initialOutput={[
                      { type: 'output', content: 'Welcome to FluxCode Terminal! 🚀' },
                      { type: 'output', content: 'Type "help" to see available commands.' }
                    ]} 
                    customOutput={terminalOutput}
                    onCommand={handleTerminalCommand}
                  />
                </div>
              </>
            )}
          </div>
        );
    }
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
            className={`p-2 ${isRunning ? 'text-vibe-green animate-pulse' : 'text-gray-400 hover:text-vibe-green'} transition-colors relative group`}
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
            onClick={toggleLayout}
            className="p-2 text-gray-400 hover:text-vibe-green transition-colors relative group"
            title="Change layout"
          >
            <SafeIcon icon={FiLayout} className="text-lg" />
            <span className="absolute hidden group-hover:block -bottom-8 left-1/2 transform -translate-x-1/2 bg-dark-bg border border-dark-border px-2 py-1 rounded text-xs whitespace-nowrap">
              Change layout
            </span>
          </button>
          
          <button
            onClick={toggleSettings}
            className={`p-2 ${showSettings ? 'text-vibe-purple' : 'text-gray-400 hover:text-white'} transition-colors relative group`}
            title="Editor settings"
          >
            <SafeIcon icon={FiSettings} className="text-lg" />
            <span className="absolute hidden group-hover:block -bottom-8 left-1/2 transform -translate-x-1/2 bg-dark-bg border border-dark-border px-2 py-1 rounded text-xs whitespace-nowrap">
              Editor settings
            </span>
          </button>
          
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`p-2 ${layout === 'split-horizontal' ? 'text-gray-400 hover:text-white' : 'opacity-50 cursor-not-allowed'} transition-colors relative group`}
            title={showTerminal ? "Hide terminal" : "Show terminal"}
            disabled={layout !== 'split-horizontal'}
          >
            <SafeIcon icon={FiTerminal} className="text-lg" />
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
                        className={`flex-1 py-2 rounded ${editorSettings.tabSize === size ? 'bg-vibe-purple text-white' : 'bg-dark-bg text-gray-400 hover:bg-dark-border'}`}
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editorSettings.wordWrap ? 'bg-vibe-purple' : 'bg-gray-600'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editorSettings.wordWrap ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Auto Save
                  </label>
                  <button
                    onClick={() => updateSettings('autoSave', !editorSettings.autoSave)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editorSettings.autoSave ? 'bg-vibe-purple' : 'bg-gray-600'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editorSettings.autoSave ? 'translate-x-6' : 'translate-x-1'}`}
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
        {renderLayout()}
      </div>
    </div>
  );
};

export default CodeEditor;