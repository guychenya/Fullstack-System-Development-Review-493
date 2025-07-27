import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFolder, FiClock, FiGitBranch, FiArrowRight } = FiIcons;

const RecentProjects = () => {
  const navigate = useNavigate();
  
  const projects = [
    {
      id: 1,
      name: 'E-commerce Dashboard',
      language: 'React',
      lastModified: '2 hours ago',
      status: 'active',
      progress: 75,
    },
    {
      id: 2,
      name: 'API Gateway Service',
      language: 'Node.js',
      lastModified: '1 day ago',
      status: 'completed',
      progress: 100,
    },
    {
      id: 3,
      name: 'Mobile App UI',
      language: 'React Native',
      lastModified: '3 days ago',
      status: 'paused',
      progress: 45,
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-vibe-green bg-vibe-green/10',
      completed: 'text-vibe-blue bg-vibe-blue/10',
      paused: 'text-vibe-orange bg-vibe-orange/10',
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10';
  };

  return (
    <motion.div
      className="bg-dark-surface border border-dark-border rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
        <button 
          onClick={() => navigate('/projects')}
          className="text-vibe-purple hover:text-vibe-blue transition-colors"
        >
          <SafeIcon icon={FiArrowRight} className="text-lg" />
        </button>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            className="bg-dark-bg border border-dark-border rounded-lg p-4 hover:border-gray-600 transition-all cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/editor')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiFolder} className="text-vibe-purple" />
                <div>
                  <h4 className="font-medium text-white">{project.name}</h4>
                  <p className="text-sm text-gray-400">{project.language}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <SafeIcon icon={FiClock} />
                <span>{project.lastModified}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-dark-border rounded-full h-2">
                  <div 
                    className="bg-vibe-purple h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-400">{project.progress}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentProjects;