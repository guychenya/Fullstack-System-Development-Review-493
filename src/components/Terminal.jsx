import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useLLMStore } from '../store/llmStore';
import toast from 'react-hot-toast';

const { FiTerminal, FiX, FiMinus, FiMaximize2, FiLoader, FiCode, FiCpu, FiBrain } = FiIcons;

const Terminal = ({ initialOutput = [], customOutput = [], onCommand }) => {
  const [commands, setCommands] = useState([
    ...(initialOutput.length > 0 ? initialOutput : [
      { type: 'output', content: 'Welcome to FluxCode Terminal! 🚀' },
      { type: 'output', content: 'Type "help" for available commands.' },
    ])
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
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
  const [currentFile, setCurrentFile] = useState('main.js');
  
  const terminalRef = useRef(null);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const { selectedModel, generateResponse } = useLLMStore();
  
  // Add custom output when it changes
  useEffect(() => {
    if (customOutput && customOutput.length > 0) {
      setCommands(prev => [...prev, ...customOutput]);
    }
  }, [customOutput]);

  // Scrollbar visibility effect
  useEffect(() => {
    const handleMouseEnter = () => setShowScrollbar(true);
    const handleMouseLeave = () => setShowScrollbar(false);
    
    const terminal = terminalRef.current;
    if (terminal) {
      terminal.addEventListener('mouseenter', handleMouseEnter);
      terminal.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      if (terminal) {
        terminal.removeEventListener('mouseenter', handleMouseEnter);
        terminal.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  // Auto-scroll to bottom when commands change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  // Handle command execution
  const executeCommand = async (cmd) => {
    // Skip empty commands
    if (!cmd.trim()) return;
    
    // Add command to history
    const newCommands = [...commands];
    newCommands.push({ type: 'input', content: `$ ${cmd}` });
    setCommands(newCommands);
    
    // Add to command history for up/down navigation
    setHistory(prev => [cmd, ...prev]);
    setHistoryIndex(-1);
    
    // Check if there's a custom handler for this command
    const customHandlerOutput = onCommand ? onCommand(cmd) : null;
    if (customHandlerOutput) {
      setCommands(prev => [...prev, ...customHandlerOutput]);
      return;
    }

    // Parse the command and arguments
    const args = cmd.trim().split(' ');
    const command = args[0].toLowerCase();
    
    switch (command) {
      case 'help':
        newCommands.push({ 
          type: 'output', 
          content: `Available commands:
  help                 Show this help message
  clear                Clear the terminal
  ls                   List files in the current directory
  cat <file>           Display file contents
  edit <file>          Edit a file (syntax: edit filename)
  analyze <file>       Analyze code in a file using AI
  improve <file>       Get suggestions to improve code
  explain <file>       Get an explanation of the code
  fix <file>           Get suggestions to fix issues in the code
  run <file>           Run the specified JavaScript file
  pwd                  Print working directory
  echo <message>       Display a message
  vibe                 Show current coding vibe
  npm <command>        Simulate npm commands
  git <command>        Simulate git commands` 
        });
        break;
        
      case 'clear':
        setCommands([]);
        return;
        
      case 'ls':
        newCommands.push({ 
          type: 'output', 
          content: Object.keys(files).join('  ') 
        });
        break;
        
      case 'cat':
        if (args.length < 2) {
          newCommands.push({ type: 'error', content: 'Usage: cat <filename>' });
        } else {
          const filename = args[1];
          if (files[filename]) {
            newCommands.push({ 
              type: 'output', 
              content: files[filename],
              isCode: true
            });
          } else {
            newCommands.push({ type: 'error', content: `File not found: ${filename}` });
          }
        }
        break;
        
      case 'edit':
        if (args.length < 2) {
          newCommands.push({ type: 'error', content: 'Usage: edit <filename>' });
        } else {
          const filename = args[1];
          if (files[filename]) {
            setCurrentFile(filename);
            newCommands.push({ 
              type: 'output', 
              content: `Opening ${filename} in editor...`
            });
            // This would trigger the parent component to show the editor with this file
            if (onCommand) {
              onCommand('openEditor', { filename, content: files[filename] });
            }
          } else {
            newCommands.push({ type: 'error', content: `File not found: ${filename}` });
          }
        }
        break;
      
      case 'analyze':
      case 'improve':
      case 'explain':
      case 'fix':
        if (args.length < 2) {
          newCommands.push({ type: 'error', content: `Usage: ${command} <filename>` });
        } else {
          const filename = args[1];
          if (files[filename]) {
            setIsProcessing(true);
            newCommands.push({ 
              type: 'output', 
              content: `Analyzing ${filename} using ${selectedModel}...`
            });
            setCommands([...newCommands]);
            
            try {
              // Construct prompt based on command type
              let prompt = '';
              switch(command) {
                case 'analyze':
                  prompt = `Analyze this code and provide insights:\n\n\`\`\`${filename}\n${files[filename]}\n\`\`\``;
                  break;
                case 'improve':
                  prompt = `Suggest improvements for this code:\n\n\`\`\`${filename}\n${files[filename]}\n\`\`\`\n\nProvide specific suggestions with code examples.`;
                  break;
                case 'explain':
                  prompt = `Explain this code in detail:\n\n\`\`\`${filename}\n${files[filename]}\n\`\`\`\n\nBreak down what each part does.`;
                  break;
                case 'fix':
                  prompt = `Identify and fix issues in this code:\n\n\`\`\`${filename}\n${files[filename]}\n\`\`\`\n\nProvide corrected code.`;
                  break;
              }
              
              // Send to LLM
              const response = await generateResponse(prompt);
              
              // Add response to commands
              setCommands(prev => [
                ...prev, 
                { type: 'ai-response', content: response }
              ]);
              
            } catch (error) {
              setCommands(prev => [
                ...prev, 
                { type: 'error', content: `AI processing error: ${error.message}` }
              ]);
            } finally {
              setIsProcessing(false);
            }
          } else {
            newCommands.push({ type: 'error', content: `File not found: ${filename}` });
          }
        }
        break;
        
      case 'run':
        if (args.length < 2) {
          newCommands.push({ type: 'output', content: 'Running current file...' });
          // Simulate running the current file
          setTimeout(() => {
            try {
              // Only allow running JavaScript files for safety
              if (currentFile.endsWith('.js')) {
                // Create a safe execution context
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
                
                const output = runInSandbox(`${files[currentFile]} //# sourceURL=${currentFile}`);
                
                if (output.logs && output.logs.length) {
                  output.logs.forEach(log => {
                    setCommands(prev => [...prev, { type: 'output', content: log }]);
                  });
                }
                
                if (output.result !== undefined) {
                  setCommands(prev => [...prev, { type: 'output', content: `=> ${output.result}` }]);
                }
                
                if (output.error) {
                  setCommands(prev => [...prev, { type: 'error', content: `Error: ${output.error}` }]);
                }
              } else {
                setCommands(prev => [...prev, { type: 'error', content: `Cannot run non-JavaScript file: ${currentFile}` }]);
              }
            } catch (error) {
              setCommands(prev => [...prev, { type: 'error', content: `Execution error: ${error.message}` }]);
            }
          }, 500);
        } else {
          const filename = args[1];
          if (files[filename]) {
            if (filename.endsWith('.js')) {
              newCommands.push({ type: 'output', content: `Running ${filename}...` });
              setCommands([...newCommands]);
              
              // Simulate running the file
              setTimeout(() => {
                try {
                  // Create a safe execution context
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
                  
                  const output = runInSandbox(`${files[filename]} //# sourceURL=${filename}`);
                  
                  if (output.logs && output.logs.length) {
                    output.logs.forEach(log => {
                      setCommands(prev => [...prev, { type: 'output', content: log }]);
                    });
                  }
                  
                  if (output.result !== undefined) {
                    setCommands(prev => [...prev, { type: 'output', content: `=> ${output.result}` }]);
                  }
                  
                  if (output.error) {
                    setCommands(prev => [...prev, { type: 'error', content: `Error: ${output.error}` }]);
                  }
                } catch (error) {
                  setCommands(prev => [...prev, { type: 'error', content: `Execution error: ${error.message}` }]);
                }
              }, 500);
            } else {
              newCommands.push({ type: 'error', content: `Cannot run non-JavaScript file: ${filename}` });
            }
          } else {
            newCommands.push({ type: 'error', content: `File not found: ${filename}` });
          }
        }
        break;
        
      case 'pwd':
        newCommands.push({ type: 'output', content: '/home/developer/fluxcode-project' });
        break;
        
      case 'vibe':
        newCommands.push({ type: 'output', content: '🎯 Current vibe: Focused | Productivity: 87%' });
        break;
        
      default:
        if (cmd.startsWith('echo ')) {
          newCommands.push({ type: 'output', content: cmd.substring(5) });
        } else if (cmd.startsWith('npm ')) {
          newCommands.push({ type: 'output', content: `Executing npm command: ${cmd.substring(4)}\nPackage operation completed successfully.` });
        } else if (cmd.startsWith('git ')) {
          newCommands.push({ type: 'output', content: `Executing git command: ${cmd.substring(4)}\nGit operation completed successfully.` });
        } else {
          newCommands.push({ type: 'error', content: `Command not found: ${command}` });
        }
    }
    
    setCommands(newCommands);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
      setCurrentCommand('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Navigate command history
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Navigate command history
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion for file names
      const args = currentCommand.trim().split(' ');
      if (args.length > 0 && ['cat', 'edit', 'analyze', 'improve', 'explain', 'fix', 'run'].includes(args[0].toLowerCase())) {
        // If we have a partial filename
        if (args.length > 1) {
          const partialName = args[1];
          // Find matching files
          const matches = Object.keys(files).filter(f => f.startsWith(partialName));
          if (matches.length === 1) {
            // Complete the filename
            args[1] = matches[0];
            setCurrentCommand(args.join(' '));
          } else if (matches.length > 1) {
            // Show possible completions
            setCommands(prev => [...prev, 
              { type: 'input', content: `$ ${currentCommand}` },
              { type: 'output', content: `Possible completions: ${matches.join('  ')}` }
            ]);
          }
        }
      }
    }
  };

  // Update file content (for editor integration)
  const updateFile = (filename, content) => {
    if (files[filename]) {
      setFiles(prev => ({
        ...prev,
        [filename]: content
      }));
      return true;
    }
    return false;
  };

  // Create a new file
  const createFile = (filename, content = '') => {
    setFiles(prev => ({
      ...prev,
      [filename]: content
    }));
    return true;
  };

  // Format the output with syntax highlighting for code
  const formatOutput = (content, isCode) => {
    if (!isCode) return content;
    
    // Very simple syntax highlighting
    return (
      <pre className="bg-dark-bg p-2 rounded overflow-x-auto">
        <code>{content}</code>
      </pre>
    );
  };

  return (
    <motion.div className="h-full bg-dark-bg border-t border-dark-border flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between bg-dark-surface px-4 py-2 border-b border-dark-border">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiTerminal} className="text-vibe-green" />
          <span className="text-sm font-medium text-white">Terminal</span>
          {isProcessing && (
            <div className="flex items-center space-x-2 text-vibe-purple">
              <SafeIcon icon={FiLoader} className="animate-spin" />
              <span className="text-xs">Processing...</span>
            </div>
          )}
        </div>
        <div className="flex space-x-1">
          <button className="p-1 text-gray-400 hover:text-white transition-colors">
            <SafeIcon icon={FiMinus} className="text-sm" />
          </button>
          <button className="p-1 text-gray-400 hover:text-white transition-colors">
            <SafeIcon icon={FiMaximize2} className="text-sm" />
          </button>
          <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
            <SafeIcon icon={FiX} className="text-sm" />
          </button>
        </div>
      </div>
      
      <div 
        ref={terminalRef} 
        className={`flex-1 p-4 font-mono text-sm overflow-y-auto smooth-scroll ${showScrollbar ? 'scrollbar-fade-in' : 'hover-show-scrollbar'}`}
      >
        {commands.map((cmd, index) => (
          <div 
            key={index} 
            className={`mb-1 ${
              cmd.type === 'input' 
                ? 'text-vibe-green' 
                : cmd.type === 'error' 
                  ? 'text-red-400' 
                  : cmd.type === 'ai-response'
                    ? 'text-vibe-purple border-l-2 border-vibe-purple pl-2 my-3'
                    : 'text-gray-300'
            }`}
          >
            {cmd.type === 'ai-response' && (
              <div className="flex items-center mb-1 text-xs text-gray-400">
                <SafeIcon icon={FiBrain} className="mr-1 text-vibe-purple" />
                <span>AI Assistant</span>
              </div>
            )}
            {cmd.isCode ? formatOutput(cmd.content, true) : cmd.content}
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex items-center text-vibe-purple my-2">
            <SafeIcon icon={FiLoader} className="mr-2 animate-spin" />
            <span>AI is analyzing your code...</span>
          </div>
        )}
        
        <div className="flex items-center text-vibe-green">
          <span>$ </span>
          <input
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyPress}
            className="bg-transparent outline-none flex-1 ml-1 text-white"
            autoFocus
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Terminal;