import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useProjectStore } from '../store/projectStore';
import toast from 'react-hot-toast';

const { FiPlus, FiFolder, FiGitBranch, FiClock, FiTrash2, FiEdit3, FiStar } = FiIcons;

const ProjectManager = () => {
  const { projects, createProject, deleteProject } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    template: 'react',
    visibility: 'private'
  });

  const handleCreateProject = () => {
    if (!newProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    createProject({
      ...newProject,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'active'
    });
    toast.success('Project created successfully!');
    setShowCreateModal(false);
    setNewProject({
      name: '',
      description: '',
      template: 'react',
      visibility: 'private'
    });
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description,
      template: project.template,
      visibility: project.visibility || 'private',
      status: project.status || 'active'
    });
    setShowEditModal(true);
  };

  const saveEditedProject = () => {
    if (!newProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    // In a real app, you would update the project in the store
    toast.success('Project updated successfully!');
    setShowEditModal(false);
    setEditingProject(null);
    setNewProject({
      name: '',
      description: '',
      template: 'react',
      visibility: 'private'
    });
  };

  const handleDeleteProject = (projectId, projectName) => {
    // Check if this is a mock project (has id 1, 2, or 3)
    if (projectId === 1 || projectId === 2 || projectId === 3) {
      // For mock projects, just show a success message
      toast.success(`Project "${projectName}" deleted`);
    } else {
      // For real projects, delete from the store
      deleteProject(projectId);
      toast.success(`Project "${projectName}" deleted`);
    }
  };

  const projectTemplates = [
    { id: 'react', name: 'React App', description: 'Modern React application' },
    { id: 'vue', name: 'Vue.js', description: 'Progressive Vue.js app' },
    { id: 'node', name: 'Node.js', description: 'Backend API service' },
    { id: 'python', name: 'Python', description: 'Python application' },
    { id: 'vanilla', name: 'Vanilla JS', description: 'Plain HTML/CSS/JS' },
  ];

  // Mock projects are separate from store projects
  const mockProjects = [
    {
      id: 1,
      name: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution',
      template: 'react',
      status: 'active',
      lastModified: '2 hours ago',
      starred: true,
    },
    {
      id: 2,
      name: 'Task Management API',
      description: 'RESTful API for task management',
      template: 'node',
      status: 'completed',
      lastModified: '1 day ago',
      starred: false,
    },
    {
      id: 3,
      name: 'Portfolio Website',
      description: 'Personal portfolio showcase',
      template: 'vanilla',
      status: 'paused',
      lastModified: '3 days ago',
      starred: true,
    },
  ];

  const allProjects = [...projects, ...mockProjects];

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-vibe-green bg-vibe-green/10',
      completed: 'text-vibe-blue bg-vibe-blue/10',
      paused: 'text-vibe-orange bg-vibe-orange/10',
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-1">Manage your coding projects</p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-vibe-purple hover:bg-vibe-purple/80 text-white px-4 py-2 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SafeIcon icon={FiPlus} />
          <span>New Project</span>
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allProjects.map((project, index) => (
          <motion.div
            key={project.id}
            className="bg-dark-surface border border-dark-border rounded-xl p-6 hover:border-vibe-purple/50 transition-all cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiFolder} className="text-2xl text-vibe-blue" />
                <div>
                  <h3 className="font-semibold text-white">{project.name}</h3>
                  <p className="text-sm text-gray-400">{project.template}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {project.starred && (
                  <SafeIcon icon={FiStar} className="text-vibe-orange" />
                )}
                <button
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProject(project);
                  }}
                >
                  <SafeIcon icon={FiEdit3} />
                </button>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">
              {project.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <SafeIcon icon={FiClock} />
                <span>{project.lastModified}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <button
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id, project.name);
                  }}
                >
                  <SafeIcon icon={FiTrash2} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none"
                  placeholder="Project description"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Template
                </label>
                <select
                  value={newProject.template}
                  onChange={(e) => setNewProject({ ...newProject, template: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none"
                >
                  {projectTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-vibe-purple hover:bg-vibe-purple/80 text-white rounded-lg transition-colors"
              >
                Create Project
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-dark-surface border border-dark-border rounded-xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Edit Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none"
                  placeholder="Project description"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Template
                </label>
                <select
                  value={newProject.template}
                  onChange={(e) => setNewProject({ ...newProject, template: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none"
                >
                  {projectTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-vibe-purple focus:border-transparent outline-none"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedProject}
                className="px-4 py-2 bg-vibe-purple hover:bg-vibe-purple/80 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectManager;