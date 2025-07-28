import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useLLMStore } from '../store/llmStore';
import toast from 'react-hot-toast';

const {
  FiTerminal, FiX, FiMinus, FiMaximize2, FiLoader, FiCode,
  FiCpu, FiBrain, FiFile, FiFolder, FiUpload, FiPaperclip, 
  FiHash, FiAtSign, FiInfo
} = FiIcons;

const Terminal = ({ initialOutput = [], customOutput = [], onCommand, fileSystem }) => {
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
  const [files, setFiles] = useState(fileSystem || {
    'main.js': `// Welcome to FluxCode Editor function greetDeveloper() {console.log("Hello,Developer! Ready to code with the perfect vibe?");const vibes=['focused','creative','relaxed'];const currentVibe=vibes[Math.floor(Math.random() * vibes.length)];return \`Current vibe: \${currentVibe}\`;} greetDeveloper();`,
    'app.js': `import React from 'react';function App() {return ( <div className="app"> <h1>FluxCode App</h1> <p>Edit this file to get started!</p> </div> );}export default App;`,
    'utils.js': `// Utility functionsexport function formatDate(date) {return new Date(date).toLocaleDateString();}export function calculateSum(numbers) {return numbers.reduce((sum,num)=> sum + num,0);}export function generateId() {return Math.random().toString(36).substr(2,9);}`
  });
  const [currentFile, setCurrentFile] = useState('main.js');

  // File reference and suggestion system
  const [showFileSuggestions, setShowFileSuggestions] = useState(false);
  const [fileSuggestions, setFileSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [atSignIndex, setAtSignIndex] = useState(-1);
  const [inputRect, setInputRect] = useState(null);

  // Drag and drop files
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState([]);
  const [savedFiles, setSavedFiles] = useState([]);

  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const [showScrollbar, setShowScrollbar] = useState(false);

  const { selectedModel, generateResponse } = useLLMStore();

  // Listen for file registry updates from FileExplorer
  useEffect(() => {
    const handleFileRegistryUpdated = (event) => {
      const { fileNames, filePaths, fileContents } = event.detail;
      setFiles(prev => ({ ...prev, ...fileContents }));
    };

    document.addEventListener('fileRegistryUpdated', handleFileRegistryUpdated);
    
    return () => {
      document.removeEventListener('fileRegistryUpdated', handleFileRegistryUpdated);
    };
  }, []);

  // Listen for filesUpdated event from FileExplorer
  useEffect(() => {
    const handleFilesUpdated = (event) => {
      const { files: updatedFiles } = event.detail;
      setFiles(prev => ({ ...prev, ...updatedFiles }));
    };

    document.addEventListener('filesUpdated', handleFilesUpdated);
    
    return () => {
      document.removeEventListener('filesUpdated', handleFilesUpdated);
    };
  }, []);

  // Load saved files from localStorage on mount
  useEffect(() => {
    const savedFilesJson = localStorage.getItem('terminal-saved-files');
    if (savedFilesJson) {
      try {
        const loadedFiles = JSON.parse(savedFilesJson);
        setSavedFiles(loadedFiles);

        // Also update the files state with saved files
        const updatedFiles = { ...files };
        loadedFiles.forEach(file => {
          updatedFiles[file.name] = file.content;
        });
        setFiles(updatedFiles);

        setCommands(prev => [
          ...prev,
          { type: 'info', content: `📚 Loaded ${loadedFiles.length} saved file(s). Use "@" to reference them or type "ls" to list all files.` }
        ]);
      } catch (error) {
        console.error('Error loading saved files:', error);
      }
    }
  }, []);

  // Add custom output when it changes
  useEffect(() => {
    if (customOutput && customOutput.length > 0) {
      setCommands(prev => [...prev, ...customOutput]);
    }
  }, [customOutput]);

  // Update files when fileSystem changes
  useEffect(() => {
    if (fileSystem && Object.keys(fileSystem).length > 0) {
      setFiles(fileSystem);
    }
  }, [fileSystem]);

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

  // Update input rectangle for positioning the dropdown
  useEffect(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setInputRect(rect);
    }
  }, [currentCommand, showFileSuggestions]);

  // Get all available files for suggestions
  const getAllAvailableFiles = () => {
    // First check if we have a global file registry from FileExplorer
    if (window.fileRegistry && window.fileRegistry.fileNames) {
      return window.fileRegistry.fileNames;
    }
    
    // Fall back to local files
    return Object.keys(files);
  };

  // File suggestion system
  useEffect(() => {
    if (currentCommand.includes('@') && inputRef.current) {
      const atIndex = currentCommand.lastIndexOf('@');
      if (atIndex !== -1) {
        const textAfterAt = currentCommand.slice(atIndex + 1);
        
        // Only show suggestions if we're typing right after the @ symbol
        if (cursorPosition > atIndex && !textAfterAt.includes(' ')) {
          setAtSignIndex(atIndex);
          
          // Get all available files including from file explorer
          const availableFiles = getAllAvailableFiles();
          
          // Filter file suggestions based on text after @
          const suggestions = availableFiles.filter(file => 
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
  }, [currentCommand, cursorPosition, files]);

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

    // Process file references in command (replace @filename with file content)
    let processedCommand = cmd;
    let fileRefs = [];
    const atMatches = [...cmd.matchAll(/@(\w+\.\w+)/g)];
    if (atMatches.length > 0) {
      atMatches.forEach(match => {
        const filename = match[1];
        if (files[filename]) {
          fileRefs.push({ filename, content: files[filename] });
          // For display purposes, we keep the @filename in the command
          // But we'll use the file references when processing
        }
      });
    }

    // Parse the command and arguments
    const args = cmd.trim().split(' ');
    const command = args[0].toLowerCase();

    switch (command) {
      case 'help':
        newCommands.push({
          type: 'output',
          content: `Available commands:
help             Show this help message
clear            Clear the terminal
ls               List files in the current directory
cat <file>       Display file contents
edit <file>      Edit a file (syntax: edit filename)
analyze <file>   Analyze code in a file using AI
improve <file>   Get suggestions to improve code
explain <file>   Get an explanation of the code
fix <file>       Get suggestions to fix issues in the code
run <file>       Run the specified JavaScript file
pwd              Print working directory
echo <message>   Display a message
vibe             Show current coding vibe
save <file>      Save a file to local storage for persistence
files            List all saved files in local storage
delete <file>    Delete a file from local storage
npm <command>    Simulate npm commands
git <command>    Simulate git commands

Special Features:
@filename        Reference a file in your command (e.g., "analyze @main.js")
Drag & Drop      Drag files from the file explorer to analyze them`
        });
        break;

      case 'clear':
        setCommands([]);
        return;

      case 'ls':
        newCommands.push({
          type: 'output',
          content: Object.keys(files).join(' ')
        });
        break;

      case 'files':
        if (savedFiles.length === 0) {
          newCommands.push({
            type: 'output',
            content: 'No saved files in local storage.'
          });
        } else {
          newCommands.push({
            type: 'output',
            content: 'Saved files in local storage:\n' + savedFiles.map(file => `- ${file.name} (${new Date(file.timestamp).toLocaleString()})`).join('\n')
          });
        }
        break;

      case 'save':
        if (args.length < 2) {
          newCommands.push({
            type: 'error',
            content: 'Usage: save <filename>'
          });
        } else {
          const filename = args[1];
          if (files[filename]) {
            // Check if file already exists in saved files
            const fileIndex = savedFiles.findIndex(f => f.name === filename);
            const newSavedFiles = [...savedFiles];
            
            if (fileIndex !== -1) {
              // Update existing file
              newSavedFiles[fileIndex] = {
                name: filename,
                content: files[filename],
                timestamp: Date.now()
              };
              newCommands.push({
                type: 'output',
                content: `File ${filename} updated in local storage.`
              });
            } else {
              // Add new file
              newSavedFiles.push({
                name: filename,
                content: files[filename],
                timestamp: Date.now()
              });
              newCommands.push({
                type: 'output',
                content: `File ${filename} saved to local storage.`
              });
            }
            
            setSavedFiles(newSavedFiles);
            localStorage.setItem('terminal-saved-files', JSON.stringify(newSavedFiles));
            toast.success(`File ${filename} saved successfully!`);
          } else {
            newCommands.push({
              type: 'error',
              content: `File not found: ${filename}`
            });
          }
        }
        break;

      case 'delete':
        if (args.length < 2) {
          newCommands.push({
            type: 'error',
            content: 'Usage: delete <filename>'
          });
        } else {
          const filename = args[1];
          const fileIndex = savedFiles.findIndex(f => f.name === filename);
          
          if (fileIndex !== -1) {
            const newSavedFiles = savedFiles.filter((_, i) => i !== fileIndex);
            setSavedFiles(newSavedFiles);
            localStorage.setItem('terminal-saved-files', JSON.stringify(newSavedFiles));
            newCommands.push({
              type: 'output',
              content: `File ${filename} deleted from local storage.`
            });
            toast.success(`File ${filename} deleted successfully!`);
          } else {
            newCommands.push({
              type: 'error',
              content: `File not found in saved files: ${filename}`
            });
          }
        }
        break;

      case 'cat':
        if (args.length < 2) {
          newCommands.push({
            type: 'error',
            content: 'Usage: cat <filename>'
          });
        } else {
          const filename = args[1];
          if (files[filename]) {
            newCommands.push({
              type: 'output',
              content: files[filename],
              isCode: true
            });
          } else {
            newCommands.push({
              type: 'error',
              content: `File not found: ${filename}`
            });
          }
        }
        break;

      case 'edit':
        if (args.length < 2) {
          newCommands.push({
            type: 'error',
            content: 'Usage: edit <filename>'
          });
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
            newCommands.push({
              type: 'error',
              content: `File not found: ${filename}`
            });
          }
        }
        break;

      case 'analyze':
      case 'improve':
      case 'explain':
      case 'fix':
        // Check for file references or dropped files
        let filename, fileContent;
        if (args.length < 2 && fileRefs.length === 0 && droppedFiles.length === 0) {
          newCommands.push({
            type: 'error',
            content: `Usage: ${command} <filename> or ${command} @filename`
          });
          break;
        }

        // Priority: 1. Explicit filename arg, 2. File references, 3. Dropped files
        if (args.length >= 2) {
          filename = args[1].replace('@', ''); // Remove @ if present
          fileContent = files[filename];
        } else if (fileRefs.length > 0) {
          filename = fileRefs[0].filename;
          fileContent = fileRefs[0].content;
        } else if (droppedFiles.length > 0) {
          filename = droppedFiles[0].name;
          fileContent = droppedFiles[0].content;
        }

        if (fileContent) {
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
                prompt = `Analyze this code and provide insights:\n\n\`\`\`${filename}\n${fileContent}\n\`\`\``;
                break;
              case 'improve':
                prompt = `Suggest improvements for this code:\n\n\`\`\`${filename}\n${fileContent}\n\`\`\`\n\nProvide specific suggestions with code examples.`;
                break;
              case 'explain':
                prompt = `Explain this code in detail:\n\n\`\`\`${filename}\n${fileContent}\n\`\`\`\n\nBreak down what each part does.`;
                break;
              case 'fix':
                prompt = `Identify and fix issues in this code:\n\n\`\`\`${filename}\n${fileContent}\n\`\`\`\n\nProvide corrected code.`;
                break;
            }

            // Process multiple file references if available
            if (fileRefs.length > 1) {
              prompt += '\n\nAdditional context from referenced files:\n';
              for (let i = 1; i < fileRefs.length; i++) {
                prompt += `\n\`\`\`${fileRefs[i].filename}\n${fileRefs[i].content}\n\`\`\``;
              }
            }

            // Send to LLM
            const response = await generateResponse(prompt);

            // Add response to commands
            setCommands(prev => [
              ...prev,
              { type: 'ai-response', content: response }
            ]);

            // Clear dropped files after processing
            setDroppedFiles([]);
          } catch (error) {
            setCommands(prev => [
              ...prev,
              { type: 'error', content: `AI processing error: ${error.message}` }
            ]);
          } finally {
            setIsProcessing(false);
          }
        } else {
          newCommands.push({
            type: 'error',
            content: `File not found: ${filename}`
          });
        }
        break;

      case 'run':
        if (args.length < 2) {
          newCommands.push({
            type: 'output',
            content: 'Running current file...'
          });

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
          const filename = args[1].replace('@', ''); // Remove @ if present
          if (files[filename]) {
            if (filename.endsWith('.js')) {
              newCommands.push({
                type: 'output',
                content: `Running ${filename}...`
              });
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
              newCommands.push({
                type: 'error',
                content: `Cannot run non-JavaScript file: ${filename}`
              });
            }
          } else {
            newCommands.push({
              type: 'error',
              content: `File not found: ${filename}`
            });
          }
        }
        break;

      case 'pwd':
        newCommands.push({
          type: 'output',
          content: '/home/developer/fluxcode-project'
        });
        break;

      case 'vibe':
        newCommands.push({
          type: 'output',
          content: '🎯 Current vibe: Focused | Productivity: 87%'
        });
        break;

      default:
        if (cmd.startsWith('echo ')) {
          newCommands.push({
            type: 'output',
            content: cmd.substring(5)
          });
        } else if (cmd.startsWith('npm ')) {
          newCommands.push({
            type: 'output',
            content: `Executing npm command: ${cmd.substring(4)}\nPackage operation completed successfully.`
          });
        } else if (cmd.startsWith('git ')) {
          newCommands.push({
            type: 'output',
            content: `Executing git command: ${cmd.substring(4)}\nGit operation completed successfully.`
          });
        } else if (cmd.startsWith('analyze @') || cmd.startsWith('explain @') || cmd.startsWith('improve @') || cmd.startsWith('fix @')) {
          // This is a fallback case for file references that weren't caught above
          // It should be handled by the previous switch cases
        } else {
          newCommands.push({
            type: 'error',
            content: `Command not found: ${command}`
          });
        }
    }

    setCommands(newCommands);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (showFileSuggestions && fileSuggestions.length > 0) {
        // If suggestions are shown, select the first one
        handleFileSelect(fileSuggestions[0]);
      } else {
        executeCommand(currentCommand);
        setCurrentCommand('');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showFileSuggestions) {
        // Navigate file suggestions
        // Implementation would go here
      } else {
        // Navigate command history
        if (history.length > 0) {
          const newIndex = Math.min(historyIndex + 1, history.length - 1);
          setHistoryIndex(newIndex);
          setCurrentCommand(history[newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showFileSuggestions) {
        // Navigate file suggestions
        // Implementation would go here
      } else {
        // Navigate command history
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setCurrentCommand(history[newIndex]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (showFileSuggestions && fileSuggestions.length > 0) {
        // Complete with the first suggestion
        handleFileSelect(fileSuggestions[0]);
      } else {
        // Simple tab completion for file names
        const args = currentCommand.trim().split(' ');
        if (args.length > 0 && ['cat', 'edit', 'analyze', 'improve', 'explain', 'fix', 'run', 'save', 'delete'].includes(args[0].toLowerCase())) {
          // If we have a partial filename
          if (args.length > 1) {
            const partialName = args[1];
            
            // Get all available files
            const availableFiles = getAllAvailableFiles();
            
            // Find matching files
            const matches = availableFiles.filter(f => f.startsWith(partialName));
            
            if (matches.length === 1) {
              // Complete the filename
              args[1] = matches[0];
              setCurrentCommand(args.join(' '));
            } else if (matches.length > 1) {
              // Show possible completions
              setCommands(prev => [
                ...prev,
                { type: 'input', content: `$ ${currentCommand}` },
                { type: 'output', content: `Possible completions: ${matches.join(' ')}` }
              ]);
            }
          }
        }
      }
    } else if (e.key === 'Escape') {
      // Hide suggestions on escape
      setShowFileSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    setCurrentCommand(e.target.value);
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart);
    }
  };

  // Handle file selection from suggestions
  const handleFileSelect = (filename) => {
    if (!filename) return;

    // Replace the text after @ with the selected filename
    const beforeAt = currentCommand.substring(0, atSignIndex + 1);
    const afterAt = currentCommand.substring(atSignIndex + 1);
    const afterAtNextSpace = afterAt.indexOf(' ') > -1 ? afterAt.indexOf(' ') : afterAt.length;
    const newCommand = beforeAt + filename + afterAt.substring(afterAtNextSpace);
    
    setCurrentCommand(newCommand);
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
    // In a real implementation, we would read the file data
    // Here we'll simulate it with a mock file
    // Check if this is coming from our file explorer
    const fileData = e.dataTransfer.getData('application/json');
    if (fileData) {
      try {
        const parsedData = JSON.parse(fileData);
        if (parsedData.filename && parsedData.content) {
          setDroppedFiles([{
            name: parsedData.filename,
            content: parsedData.content
          }]);

          // Auto-suggest a command with the dropped file
          setCurrentCommand(`analyze ${parsedData.filename}`);

          // Show notification about the dropped file
          setCommands(prev => [
            ...prev,
            { 
              type: 'info', 
              content: `📎 File "${parsedData.filename}" dropped. Type a command to analyze it or press Enter to run "analyze ${parsedData.filename}"` 
            }
          ]);

          // Add to files state automatically
          setFiles(prev => ({
            ...prev,
            [parsedData.filename]: parsedData.content
          }));

          // Show toast notification
          toast.success(`File "${parsedData.filename}" added and ready to use. Type "save ${parsedData.filename}" to save it permanently.`);
        }
      } catch (error) {
        console.error('Error parsing dropped file data:', error);
      }
    }
  };

  // Update file content (for editor integration)
  const updateFile = (filename, content) => {
    if (files[filename]) {
      setFiles(prev => ({ ...prev, [filename]: content }));
      return true;
    }
    return false;
  };

  // Create a new file
  const createFile = (filename, content = '') => {
    setFiles(prev => ({ ...prev, [filename]: content }));
    
    // Show notification
    setCommands(prev => [
      ...prev,
      { type: 'info', content: `📄 File "${filename}" created. Type "save ${filename}" to save it permanently.` }
    ]);
    
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

  // Calculate position for file suggestions dropdown
  const getDropdownPosition = () => {
    if (!inputRect) return {};
    
    // Position above the input field
    return {
      bottom: '100%',
      left: 0,
      marginBottom: '8px',
      maxHeight: '200px'
    };
  };

  return (
    <motion.div 
      className={`h-full bg-dark-bg border-t border-dark-border flex flex-col ${isDraggingOver ? 'border-2 border-dashed border-vibe-purple bg-vibe-purple/10' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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

          {droppedFiles.length > 0 && (
            <div className="flex items-center space-x-2 text-vibe-blue">
              <SafeIcon icon={FiPaperclip} className="text-xs" />
              <span className="text-xs">{droppedFiles[0].name}</span>
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
            className={`mb-1 ${cmd.type === 'input' ? 'text-vibe-green' : 
                                cmd.type === 'error' ? 'text-red-400' : 
                                cmd.type === 'ai-response' ? 'text-vibe-purple border-l-2 border-vibe-purple pl-2 my-3' :
                                cmd.type === 'info' ? 'text-vibe-blue border-l-2 border-vibe-blue pl-2 my-1' :
                                'text-gray-300'}`}
          >
            {cmd.type === 'ai-response' && (
              <div className="flex items-center mb-1 text-xs text-gray-400">
                <SafeIcon icon={FiBrain} className="mr-1 text-vibe-purple" />
                <span>AI Assistant</span>
              </div>
            )}
            
            {cmd.type === 'info' && (
              <div className="flex items-center mb-1 text-xs text-vibe-blue">
                <SafeIcon icon={FiInfo} className="mr-1" />
                <span>Info</span>
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

        {isDraggingOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-bg/80 pointer-events-none">
            <div className="p-4 bg-vibe-purple/20 border-2 border-dashed border-vibe-purple rounded-lg flex flex-col items-center">
              <SafeIcon icon={FiUpload} className="text-4xl text-vibe-purple mb-2" />
              <span className="text-vibe-purple font-medium">Drop file to analyze</span>
            </div>
          </div>
        )}

        <div className="flex items-center text-vibe-green">
          <span>$ </span>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={currentCommand}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              onClick={() => inputRef.current && setCursorPosition(inputRef.current.selectionStart)}
              className="bg-transparent outline-none flex-1 ml-1 text-white w-full"
              autoFocus
            />

            {/* File suggestions dropdown - positioned ABOVE input */}
            <AnimatePresence>
              {showFileSuggestions && (
                <motion.div
                  className="absolute bg-dark-bg border border-dark-border rounded-md shadow-lg z-50 w-64 overflow-y-auto"
                  style={getDropdownPosition()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-1 max-h-40 overflow-y-auto">
                    {fileSuggestions.map((file, idx) => (
                      <button
                        key={file}
                        onClick={() => handleFileSelect(file)}
                        className={`w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-dark-border`}
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

        {/* File storage info */}
        {savedFiles.length > 0 && (
          <div className="mt-3 border-t border-dark-border pt-3 text-xs text-gray-400 flex items-center">
            <SafeIcon icon={FiFolder} className="text-vibe-orange mr-1" />
            <span>{savedFiles.length} file(s) in storage. Type "files" to list them.</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Terminal;