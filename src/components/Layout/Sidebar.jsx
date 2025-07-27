import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiCode, FiFolderOpen, FiBarChart3, FiSettings, FiZap } = FiIcons;

const menuItems = [
  { path: '/', icon: FiHome, label: 'Dashboard' },
  { path: '/editor', icon: FiCode, label: 'Code Editor' },
  { path: '/projects', icon: FiFolderOpen, label: 'Projects' },
  { path: '/analytics', icon: FiBarChart3, label: 'Analytics' },
  { path: '/settings', icon: FiSettings, label: 'Settings' },
];

const Sidebar = () => {
  return (
    <motion.div 
      className="w-64 bg-dark-surface border-r border-dark-border"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <SafeIcon icon={FiZap} className="text-2xl text-vibe-purple" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-vibe-purple to-vibe-blue bg-clip-text text-transparent">
            VibeCoding
          </h1>
        </div>
        
        <nav className="space-y-2 sidebar-scroll hover-show-scrollbar smooth-scroll overflow-y-auto max-h-[calc(100vh-150px)]">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-vibe-purple text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-dark-border'
                }`
              }
            >
              <SafeIcon icon={item.icon} className="text-lg" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;