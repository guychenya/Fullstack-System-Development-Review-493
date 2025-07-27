import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTerminal, FiX, FiMinus, FiMaximize2 } = FiIcons;

const Terminal = ({ initialOutput = [], customOutput = [], onCommand }) => {
  const [commands, setCommands] = useState([
    ...(initialOutput.length > 0
      ? initialOutput
      : [
          { type: 'output', content: 'Welcome to VibeCoding Terminal! 🚀' },
          { type: 'output', content: 'Type "help" for available commands.' },
        ])
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const terminalRef = useRef(null);
  const [showScrollbar, setShowScrollbar] = useState(false);

  useEffect(() => {
    if (customOutput && customOutput.length > 0) {
      setCommands(prev => [...prev, ...customOutput]);
    }
  }, [customOutput]);

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

  const executeCommand = (cmd) => {
    const newCommands = [...commands];
    newCommands.push({ type: 'input', content: `$ ${cmd}` });

    // Check if there's a custom handler for this command
    const customHandlerOutput = onCommand ? onCommand(cmd) : null;
    if (customHandlerOutput) {
      setCommands([...newCommands, ...customHandlerOutput]);
      return;
    }

    switch (cmd.toLowerCase().trim()) {
      case 'help':
        newCommands.push({
          type: 'output',
          content: 'Available commands: help, clear, ls, pwd, echo, vibe, npm, git, run'
        });
        break;
      case 'clear':
        setCommands([]);
        return;
      case 'ls':
        newCommands.push({
          type: 'output',
          content: 'src/ public/ package.json README.md node_modules/ .gitignore'
        });
        break;
      case 'pwd':
        newCommands.push({
          type: 'output',
          content: '/home/developer/vibe-coding-project'
        });
        break;
      case 'vibe':
        newCommands.push({
          type: 'output',
          content: '🎯 Current vibe: Focused | Productivity: 87%'
        });
        break;
      case 'run':
        newCommands.push({ type: 'output', content: 'Running code...' });
        break;
      case 'npm start':
      case 'npm run dev':
        newCommands.push({
          type: 'output',
          content:
            '🚀 Starting development server...\n> vibe-coding-tool@1.0.0 dev\n> vite\n\n VITE v5.4.2 ready in 180 ms\n\n ➜ Local: http://localhost:5173/\n ➜ Network: use --host to expose'
        });
        break;
      case 'git status':
        newCommands.push({
          type: 'output',
          content:
            'On branch main\nYour branch is up to date with \'origin/main\'.\n\nChanges not staged for commit:\n modified: src/store/vibeStore.js\n\nno changes added to commit'
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
        } else {
          newCommands.push({
            type: 'output',
            content: `Command not found: ${cmd}`
          });
        }
    }

    setCommands(newCommands);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  return (
    <motion.div
      className="h-full bg-dark-bg border-t border-dark-border flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between bg-dark-surface px-4 py-2 border-b border-dark-border">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiTerminal} className="text-vibe-green" />
          <span className="text-sm font-medium text-white">Terminal</span>
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
                : 'text-gray-300'
            }`}
          >
            {cmd.content}
          </div>
        ))}
        <div className="flex items-center text-vibe-green">
          <span>$ </span>
          <input
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-transparent outline-none flex-1 ml-1 text-white"
            autoFocus
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Terminal;