import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiCode, FiCoffee, FiTrendingUp } = FiIcons;

const QuickStats = () => {
  const stats = [
    {
      label: 'Coding Time Today',
      value: '4h 32m',
      icon: FiClock,
      color: 'text-vibe-blue',
    },
    {
      label: 'Lines of Code',
      value: '1,247',
      icon: FiCode,
      color: 'text-vibe-green',
    },
    {
      label: 'Coffee Breaks',
      value: '3',
      icon: FiCoffee,
      color: 'text-vibe-orange',
    },
    {
      label: 'Productivity',
      value: '+12%',
      icon: FiTrendingUp,
      color: 'text-vibe-purple',
    },
  ];

  return (
    <motion.div
      className="bg-dark-surface border border-dark-border rounded-xl p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-white mb-4">Today's Stats</h3>
      
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <SafeIcon icon={stat.icon} className={`text-lg ${stat.color}`} />
              <span className="text-gray-300">{stat.label}</span>
            </div>
            <span className="font-semibold text-white">{stat.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickStats;