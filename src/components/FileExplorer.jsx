import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';

const {
  FiFolder, FiFolderOpen, FiFile, FiPlus, FiMoreHorizontal, FiTrash2,
  FiEdit2, FiCode, FiImage, FiFileText, FiSettings, FiCopy, FiMessageCircle,
  FiSave, FiInfo, FiX, FiPaperclip, FiUpload
} = FiIcons;

const FileExplorer = ({ onFileSelect, onFileDrag }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src', 'saved-files']));
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('jsx');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [savedFiles, setSavedFiles] = useState([]);
  const [showFileInfoTooltip, setShowFileInfoTooltip] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = React.useRef(null);
  
  const [fileTree, setFileTree] = useState([
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      path: 'src',
      children: [
        {
          id: 'components',
          name: 'components',
          type: 'folder',
          path: 'src/components',
          children: [
            { id: 'header', name: 'Header.jsx', type: 'file', path: 'src/components/Header.jsx' },
            { id: 'sidebar', name: 'Sidebar.jsx', type: 'file', path: 'src/components/Sidebar.jsx' },
          ]
        },
        {
          id: 'pages',
          name: 'pages',
          type: 'folder',
          path: 'src/pages',
          children: [
            { id: 'dashboard', name: 'Dashboard.jsx', type: 'file', path: 'src/pages/Dashboard.jsx' },
            { id: 'editor', name: 'Editor.jsx', type: 'file', path: 'src/pages/Editor.jsx' },
          ]
        },
        { id: 'app', name: 'App.jsx', type: 'file', path: 'src/App.jsx' },
        { id: 'main', name: 'main.jsx', type: 'file', path: 'src/main.jsx' },
      ]
    },
    {
      id: 'saved-files',
      name: 'saved-files',
      type: 'folder',
      path: 'saved-files',
      children: []
    },
    {
      id: 'public',
      name: 'public',
      type: 'folder',
      path: 'public',
      children: [
        { id: 'index', name: 'index.html', type: 'file', path: 'public/index.html' },
      ]
    },
    { id: 'package', name: 'package.json', type: 'file', path: 'package.json' },
    { id: 'readme', name: 'README.md', type: 'file', path: 'README.md' },
  ]);

  const [fileContents, setFileContents] = useState({
    'src/components/Header.jsx': `import React from 'react';\n\nconst Header = () => {\n  return <header>Header Component</header>;\n};\n\nexport default Header;`,
    'src/components/Sidebar.jsx': `import React from 'react';\n\nconst Sidebar = () => {\n  return <aside>Sidebar Component</aside>;\n};\n\nexport default Sidebar;`,
    'src/pages/Dashboard.jsx': `import React from 'react';\n\nconst Dashboard = () => {\n  return <div>Dashboard Page</div>;\n};\n\nexport default Dashboard;`,
    'src/pages/Editor.jsx': `import React from 'react';\n\nconst Editor = () => {\n  return <div>Editor Page</div>;\n};\n\nexport default Editor;`,
    'src/App.jsx': `import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>FluxCode App</h1>\n    </div>\n  );\n}\n\nexport default App;`,
    'src/main.jsx': `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`,
    'public/index.html': `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1.0">\n  <title>FluxCode App</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>`,
    'package.json': `{\n  "name": "fluxcode",\n  "version": "0.1.0",\n  "private": true,\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}`,
    'README.md': `# FluxCode Project\n\nThis is a sample project created with FluxCode.`
  });
  
  // Load saved files from localStorage on mount
  React.useEffect(() => {
    const savedFilesJson = localStorage.getItem('terminal-saved-files');
    if (savedFilesJson) {
      try {
        const loadedFiles = JSON.parse(savedFilesJson);
        setSavedFiles(loadedFiles);
        
        // Update the fileTree with saved files
        updateSavedFilesInTree(loadedFiles);
        
        // Update fileContents with saved files
        const updatedContents = { ...fileContents };
        loadedFiles.forEach(file => {
          updatedContents[`saved-files/${file.name}`] = file.content;
        });
        setFileContents(updatedContents);
        
        toast.success(`Loaded ${loadedFiles.length} saved file(s)`);
      } catch (error) {
        console.error('Error loading saved files:', error);
      }
    }
  }, []);
  
  // Update the file tree with saved files
  const updateSavedFilesInTree = (files) => {
    setFileTree(prevTree => {
      return prevTree.map(item => {
        if (item.id === 'saved-files') {
          return {
            ...item,
            children: files.map(file => ({
              id: `saved-${file.name}`,
              name: file.name,
              type: 'file',
              path: `saved-files/${file.name}`,
              timestamp: file.timestamp
            }))
          };
        }
        return item;
      });
    });
  };

  const fileTypes = [
    { value: 'jsx', label: 'React Component (.jsx)', icon: FiCode },
    { value: 'js', label: 'JavaScript (.js)', icon: FiCode },
    { value: 'ts', label: 'TypeScript (.ts)', icon: FiCode },
    { value: 'tsx', label: 'TypeScript React (.tsx)', icon: FiCode },
    { value: 'css', label: 'CSS Stylesheet (.css)', icon: FiFileText },
    { value: 'scss', label: 'SCSS Stylesheet (.scss)', icon: FiFileText },
    { value: 'html', label: 'HTML Document (.html)', icon: FiFileText },
    { value: 'json', label: 'JSON Data (.json)', icon: FiSettings },
    { value: 'md', label: 'Markdown (.md)', icon: FiFileText },
    { value: 'txt', label: 'Text File (.txt)', icon: FiFileText },
    { value: 'svg', label: 'SVG Image (.svg)', icon: FiImage },
  ];

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'jsx':
      case 'tsx':
      case 'js':
      case 'ts':
        return FiCode;
      case 'css':
      case 'scss':
      case 'html':
      case 'md':
      case 'txt':
      case 'json':
        return FiFileText;
      case 'svg':
      case 'png':
      case 'jpg':
      case 'jpeg':
        return FiImage;
      default:
        return FiFile;
    }
  };

  const toggleFolder = (folderName) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const handleAddNewFile = () => {
    setShowNewFileModal(true);
    setShowMoreOptions(false);
    setUploadedFile(null);
  };

  const createNewFile = (e) => {
    e.preventDefault();
    
    // If we have an uploaded file, use its content and name
    if (uploadedFile) {
      const { name, content } = uploadedFile;
      const filePath = `src/${name}`;
      
      const newFile = {
        id: Date.now().toString(),
        name: name,
        type: 'file',
        path: filePath
      };

      // Add new file to src folder by default
      const updatedFileTree = updateTreeStructure(fileTree, 'src', (folder) => ({
        ...folder,
        children: [...folder.children, newFile]
      }));
      
      setFileTree(updatedFileTree);
      
      // Add content for the new file
      setFileContents(prev => ({
        ...prev,
        [filePath]: content
      }));
      
      setNewFileName('');
      setUploadedFile(null);
      setShowNewFileModal(false);
      toast.success(`Created new file: ${name}`);
      return;
    }
    
    // Regular file creation
    if (!newFileName.trim()) {
      toast.error('Please enter a file name');
      return;
    }
    
    const fileName = `${newFileName}.${selectedFileType}`;
    const filePath = `src/${fileName}`;
    
    const newFile = {
      id: Date.now().toString(),
      name: fileName,
      type: 'file',
      path: filePath
    };

    // Add new file to src folder by default
    const updatedFileTree = updateTreeStructure(fileTree, 'src', (folder) => ({
      ...folder,
      children: [...folder.children, newFile]
    }));
    
    setFileTree(updatedFileTree);
    
    // Add empty content for the new file
    setFileContents(prev => ({
      ...prev,
      [filePath]: getTemplateForFileType(fileName)
    }));
    
    setNewFileName('');
    setShowNewFileModal(false);
    toast.success(`Created new file: ${fileName}`);
  };

  const getTemplateForFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'jsx':
        return `import React from 'react';\n\nconst ${fileName.split('.')[0]} = () => {\n  return <div>${fileName.split('.')[0]} Component</div>;\n};\n\nexport default ${fileName.split('.')[0]};`;
      case 'js':
        return `// ${fileName}\n\nfunction main() {\n  console.log('Hello from ${fileName}');\n}\n\nmain();`;
      case 'ts':
        return `// ${fileName}\n\nfunction main(): void {\n  console.log('Hello from ${fileName}');\n}\n\nmain();`;
      case 'tsx':
        return `import React from 'react';\n\ninterface ${fileName.split('.')[0]}Props {}\n\nconst ${fileName.split('.')[0]}: React.FC<${fileName.split('.')[0]}Props> = () => {\n  return <div>${fileName.split('.')[0]} Component</div>;\n};\n\nexport default ${fileName.split('.')[0]};`;
      case 'css':
      case 'scss':
        return `/* ${fileName} styles */\n\n.container {\n  padding: 1rem;\n}`;
      case 'html':
        return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1.0">\n  <title>${fileName}</title>\n</head>\n<body>\n  <h1>${fileName}</h1>\n</body>\n</html>`;
      case 'json':
        return `{\n  "name": "${fileName.split('.')[0]}",\n  "version": "1.0.0"\n}`;
      case 'md':
        return `# ${fileName.split('.')[0]}\n\nThis is a markdown file.`;
      default:
        return `// ${fileName}\n`;
    }
  };

  const updateTreeStructure = (tree, targetId, updateFn) => {
    return tree.map(item => {
      if (item.id === targetId) {
        return updateFn(item);
      }
      
      if (item.children) {
        return {
          ...item,
          children: updateTreeStructure(item.children, targetId, updateFn)
        };
      }
      
      return item;
    });
  };

  const findItemById = (tree, id) => {
    for (const item of tree) {
      if (item.id === id) return item;
      
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const removeItemFromTree = (tree, itemId) => {
    return tree.reduce((acc, item) => {
      if (item.id === itemId) {
        return acc; // Skip this item (remove it)
      }
      
      if (item.children) {
        return [...acc, {
          ...item,
          children: removeItemFromTree(item.children, itemId)
        }];
      }
      
      return [...acc, item];
    }, []);
  };

  const addItemToFolder = (tree, folderId, newItem) => {
    return tree.map(item => {
      if (item.id === folderId && item.type === 'folder') {
        return {
          ...item,
          children: [...item.children, newItem]
        };
      }
      
      if (item.children) {
        return {
          ...item,
          children: addItemToFolder(item.children, folderId, newItem)
        };
      }
      
      return item;
    });
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    
    // Add file content for terminal drag and drop
    if (item.type === 'file') {
      const fileContent = fileContents[item.path];
      if (fileContent) {
        e.dataTransfer.setData('application/json', JSON.stringify({
          filename: item.name,
          content: fileContent
        }));
      }
    }
    
    e.target.style.opacity = '0.5';
    
    // Show a toast message instructing the user how to use drag and drop
    toast.success(`Drag ${item.name} to Terminal or Chat to reference it`, { duration: 3000 });
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '';
    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, item) => {
    e.preventDefault();
    if (item.type === 'folder' && item.id !== draggedItem?.id) {
      setDropTarget(item.id);
    }
  };

  const handleDragLeave = (e) => {
    // Only clear drop target if we're leaving the folder completely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTarget(null);
    }
  };

  const handleDrop = (e, targetFolder) => {
    e.preventDefault();
    
    if (!draggedItem || targetFolder.type !== 'folder' || targetFolder.id === draggedItem.id) {
      return;
    }
    
    // Check if we're trying to drop a folder into itself or its children
    if (draggedItem.type === 'folder') {
      const draggedPath = draggedItem.path || draggedItem.name;
      const targetPath = targetFolder.path || targetFolder.name;
      
      if (targetPath.startsWith(draggedPath)) {
        toast.error('Cannot move folder into itself or its subfolder');
        return;
      }
    }
    
    // Calculate the new path
    const newPath = `${targetFolder.path}/${draggedItem.name}`;
    
    // Update the item's path
    const updatedItem = {
      ...draggedItem,
      path: newPath
    };
    
    // Remove item from its current location
    let updatedTree = removeItemFromTree(fileTree, draggedItem.id);
    
    // Add item to target folder
    updatedTree = addItemToFolder(updatedTree, targetFolder.id, updatedItem);
    
    // Update file contents with new path
    if (draggedItem.type === 'file') {
      const oldPath = draggedItem.path;
      const content = fileContents[oldPath];
      
      if (content) {
        setFileContents(prev => {
          const updated = { ...prev };
          delete updated[oldPath];
          updated[newPath] = content;
          return updated;
        });
      }
    }
    
    setFileTree(updatedTree);
    setDropTarget(null);
    toast.success(`Moved ${draggedItem.name} to ${targetFolder.name}`);
    
    // If we're moving a file to the saved-files folder, save it to localStorage
    if (targetFolder.id === 'saved-files' && draggedItem.type === 'file') {
      const newSavedFiles = [...savedFiles];
      const fileIndex = newSavedFiles.findIndex(f => f.name === draggedItem.name);
      
      if (fileIndex !== -1) {
        // Update existing file
        newSavedFiles[fileIndex] = {
          name: draggedItem.name,
          content: fileContents[draggedItem.path],
          timestamp: Date.now()
        };
      } else {
        // Add new file
        newSavedFiles.push({
          name: draggedItem.name,
          content: fileContents[draggedItem.path],
          timestamp: Date.now()
        });
      }
      
      setSavedFiles(newSavedFiles);
      localStorage.setItem('terminal-saved-files', JSON.stringify(newSavedFiles));
      toast.success(`File ${draggedItem.name} saved permanently`);
    }
  };

  // Handle file copy to clipboard
  const handleCopyFile = (e, item) => {
    e.stopPropagation();
    
    const content = fileContents[item.path];
    if (content) {
      navigator.clipboard.writeText(content)
        .then(() => {
          toast.success(`Copied ${item.name} content to clipboard`);
        })
        .catch(() => {
          toast.error('Failed to copy to clipboard');
        });
    } else {
      toast.error('File content not found');
    }
  };
  
  // Handle saving file to localStorage
  const handleSaveFile = (e, item) => {
    e.stopPropagation();
    
    const content = fileContents[item.path];
    if (content) {
      const newSavedFiles = [...savedFiles];
      const fileIndex = newSavedFiles.findIndex(f => f.name === item.name);
      
      if (fileIndex !== -1) {
        // Update existing file
        newSavedFiles[fileIndex] = {
          name: item.name,
          content: content,
          timestamp: Date.now()
        };
        toast.success(`Updated ${item.name} in saved files`);
      } else {
        // Add new file
        newSavedFiles.push({
          name: item.name,
          content: content,
          timestamp: Date.now()
        });
        toast.success(`Saved ${item.name} to saved files`);
      }
      
      setSavedFiles(newSavedFiles);
      localStorage.setItem('terminal-saved-files', JSON.stringify(newSavedFiles));
      
      // Update saved-files folder in tree
      updateSavedFilesInTree(newSavedFiles);
    } else {
      toast.error('File content not found');
    }
  };
  
  // Handle drag to chat
  const handleDragToChat = (e, item) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Find the chat element to drag to
    const chatElement = document.querySelector('.ai-chat-container') || document.querySelector('.chat-messages-scroll');
    
    if (chatElement) {
      // Highlight the chat container
      chatElement.classList.add('bg-vibe-purple/10');
      chatElement.classList.add('border-2');
      chatElement.classList.add('border-dashed');
      chatElement.classList.add('border-vibe-purple');
      
      // Remove highlighting after animation
      setTimeout(() => {
        chatElement.classList.remove('bg-vibe-purple/10');
        chatElement.classList.remove('border-2');
        chatElement.classList.remove('border-dashed');
        chatElement.classList.remove('border-vibe-purple');
      }, 2000);
      
      toast.success(`Drag ${item.name} to the chat to ask about it`);
    } else {
      // If chat element not found, provide instructions
      toast.info('Drag files to Terminal or Chat to reference them');
    }
  };

  // File upload handlers
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setUploadedFile({
        name: file.name,
        content: content
      });
      
      // Set the file name without extension for the input field
      const nameWithoutExt = file.name.split('.')[0];
      setNewFileName(nameWithoutExt);
      
      // Set the file type based on extension
      const extension = file.name.split('.').pop().toLowerCase();
      const validExtension = fileTypes.find(type => type.value === extension);
      if (validExtension) {
        setSelectedFileType(extension);
      }
      
      toast.success(`File "${file.name}" uploaded`);
    };
    
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    
    reader.readAsText(file);
  };

  // Handle drag and drop for file upload
  const handleModalDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleModalDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDraggingOver(false);
    }
  };

  const handleModalDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setUploadedFile({
        name: file.name,
        content: content
      });
      
      // Set the file name without extension for the input field
      const nameWithoutExt = file.name.split('.')[0];
      setNewFileName(nameWithoutExt);
      
      // Set the file type based on extension
      const extension = file.name.split('.').pop().toLowerCase();
      const validExtension = fileTypes.find(type => type.value === extension);
      if (validExtension) {
        setSelectedFileType(extension);
      }
      
      toast.success(`File "${file.name}" dropped`);
    };
    
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    
    reader.readAsText(file);
  };

  const renderFileTree = (items, depth = 0) => {
    return items.map((item, index) => (
      <motion.div
        key={`${item.id}-${depth}-${index}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, item)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, item)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, item)}
        className={`${dropTarget === item.id ? 'bg-vibe-purple/20 border border-vibe-purple/50 rounded' : ''}`}
      >
        {item.type === 'folder' ? (
          <>
            <div
              className="flex items-center space-x-2 py-1 px-2 hover:bg-dark-border rounded cursor-pointer transition-colors"
              style={{ paddingLeft: `${8 + depth * 16}px` }}
              onClick={() => toggleFolder(item.name)}
            >
              <SafeIcon
                icon={expandedFolders.has(item.name) ? FiFolderOpen : FiFolder}
                className={item.id === 'saved-files' ? "text-vibe-orange" : "text-vibe-orange"}
              />
              <span className="text-gray-300 text-sm select-none">
                {item.name}
                {item.id === 'saved-files' && item.children?.length > 0 && (
                  <span className="text-xs ml-2 text-vibe-purple">
                    ({item.children.length})
                  </span>
                )}
              </span>
              {item.id === 'saved-files' && (
                <button
                  className="text-xs text-gray-400 hover:text-vibe-purple"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFileInfoTooltip(!showFileInfoTooltip);
                  }}
                >
                  <SafeIcon icon={FiInfo} className="text-xs" />
                </button>
              )}
            </div>
            
            {expandedFolders.has(item.name) && item.children && (
              <div>
                {renderFileTree(item.children, depth + 1)}
              </div>
            )}
          </>
        ) : (
          <div
            className="flex items-center justify-between group py-1 px-2 hover:bg-dark-border rounded cursor-pointer transition-colors"
            style={{ paddingLeft: `${8 + depth * 16}px` }}
            onClick={() => onFileSelect(item.name, item.path, fileContents[item.path])}
          >
            <div className="flex items-center space-x-2">
              <SafeIcon icon={getFileIcon(item.name)} className="text-vibe-blue" />
              <span className="text-gray-300 text-sm select-none">{item.name}</span>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <button
                onClick={(e) => handleDragToChat(e, item)}
                className="p-0.5 text-gray-400 hover:text-vibe-purple transition-colors"
                title="Drag to chat"
              >
                <SafeIcon icon={FiMessageCircle} className="text-xs" />
              </button>
              <button
                onClick={(e) => handleSaveFile(e, item)}
                className="p-0.5 text-gray-400 hover:text-vibe-green transition-colors"
                title="Save file permanently"
              >
                <SafeIcon icon={FiSave} className="text-xs" />
              </button>
              <button
                onClick={(e) => handleCopyFile(e, item)}
                className="p-0.5 text-gray-400 hover:text-vibe-blue transition-colors"
                title="Copy file content"
              >
                <SafeIcon icon={FiCopy} className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    ));
  };

  return (
    <motion.div
      className="w-64 bg-dark-surface border-r border-dark-border"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 border-b border-dark-border relative">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white">Explorer</h3>
          <div className="flex space-x-1">
            <button
              onClick={handleAddNewFile}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Add new file"
            >
              <SafeIcon icon={FiPlus} className="text-sm" />
            </button>
            <button
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="More options"
            >
              <SafeIcon icon={FiMoreHorizontal} className="text-sm" />
            </button>
          </div>
        </div>
        
        {/* More Options Dropdown */}
        <AnimatePresence>
          {showMoreOptions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-4 top-12 w-48 bg-dark-bg border border-dark-border rounded-lg shadow-lg z-50 no-scrollbar"
            >
              <button
                onClick={() => {
                  toast.success('Files refreshed');
                  setShowMoreOptions(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-dark-border text-gray-300 text-sm flex items-center space-x-2"
              >
                <SafeIcon icon={FiEdit2} className="text-sm" />
                <span>Refresh Files</span>
              </button>
              
              <button
                onClick={() => {
                  // Create new folder functionality
                  const folderName = prompt('Enter folder name:');
                  if (folderName) {
                    const newFolder = {
                      id: Date.now().toString(),
                      name: folderName,
                      type: 'folder',
                      path: `src/${folderName}`,
                      children: []
                    };
                    
                    const updatedFileTree = updateTreeStructure(fileTree, 'src', (folder) => ({
                      ...folder,
                      children: [...folder.children, newFolder]
                    }));
                    
                    setFileTree(updatedFileTree);
                    toast.success(`Created folder: ${folderName}`);
                  }
                  setShowMoreOptions(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-dark-border text-gray-300 text-sm flex items-center space-x-2"
              >
                <SafeIcon icon={FiFolder} className="text-sm" />
                <span>New Folder</span>
              </button>
              
              <button
                onClick={() => {
                  toast('This action is disabled in demo mode', { icon: '🔒' });
                  setShowMoreOptions(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-dark-border text-gray-300 text-sm flex items-center space-x-2"
              >
                <SafeIcon icon={FiTrash2} className="text-sm" />
                <span>Clear Explorer</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* File Info Tooltip */}
        <AnimatePresence>
          {showFileInfoTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-4 top-12 w-56 bg-dark-bg border border-dark-border rounded-lg shadow-lg z-50 p-3"
            >
              <h4 className="text-sm font-medium text-white mb-2">
                Saved Files
              </h4>
              <p className="text-xs text-gray-400 mb-2">
                Files in this folder are permanently saved in your browser's local storage.
              </p>
              <p className="text-xs text-gray-400">
                Drag files here to save them, or use the <SafeIcon icon={FiSave} className="text-xs inline mx-1" /> button.
              </p>
              <button 
                onClick={() => setShowFileInfoTooltip(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
              >
                <SafeIcon icon={FiX} className="text-xs" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* New File Modal */}
        <AnimatePresence>
          {showNewFileModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-md"
                onDragOver={handleModalDragOver}
                onDragLeave={handleModalDragLeave}
                onDrop={handleModalDrop}
              >
                <h2 className="text-xl font-bold text-white mb-4">Create New File</h2>
                
                <form onSubmit={createNewFile}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      File Type
                    </label>
                    <select
                      value={selectedFileType}
                      onChange={(e) => setSelectedFileType(e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none text-white mb-3 no-scrollbar"
                      disabled={uploadedFile !== null}
                    >
                      {fileTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      File Name
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="Enter file name"
                        className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border rounded-l-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none text-white"
                        autoFocus
                        disabled={uploadedFile !== null}
                      />
                      <div className="px-3 py-2 bg-dark-border border border-l-0 border-dark-border rounded-r-lg text-gray-400 text-sm flex items-center">
                        .{selectedFileType}
                      </div>
                    </div>
                  </div>
                  
                  {/* File upload section */}
                  <div className={`mb-4 border-2 border-dashed p-6 rounded-lg text-center transition-all ${isDraggingOver ? 'border-vibe-purple bg-vibe-purple/10' : 'border-dark-border'} ${uploadedFile ? 'bg-vibe-green/10 border-vibe-green' : ''}`}>
                    {uploadedFile ? (
                      <div className="flex flex-col items-center space-y-2">
                        <SafeIcon icon={getFileIcon(uploadedFile.name)} className="text-2xl text-vibe-green" />
                        <p className="text-vibe-green">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-400">File ready to create</p>
                        <button 
                          type="button"
                          onClick={() => setUploadedFile(null)}
                          className="text-xs text-red-400 hover:underline mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <SafeIcon icon={FiUpload} className="text-2xl text-gray-400 mb-2 mx-auto" />
                        <p className="text-sm text-gray-300 mb-2">
                          Drag & drop a file here or
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1 bg-vibe-purple hover:bg-vibe-purple/80 text-white text-sm rounded transition-colors"
                        >
                          Browse files
                        </button>
                        <input 
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileInputChange}
                        />
                      </>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewFileModal(false);
                        setUploadedFile(null);
                      }}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-vibe-purple hover:bg-vibe-purple/80 text-white rounded-lg transition-colors"
                      disabled={!uploadedFile && !newFileName.trim()}
                    >
                      Create
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="p-2 overflow-auto h-full sidebar-scroll hover-show-scrollbar smooth-scroll">
        <div className="text-xs text-gray-500 mb-2 px-2 flex items-center">
          <SafeIcon icon={FiPaperclip} className="mr-1 text-xs" />
          <span>Drag files to terminal or chat to analyze</span>
        </div>
        {renderFileTree(fileTree)}
      </div>
    </motion.div>
  );
};

export default FileExplorer;