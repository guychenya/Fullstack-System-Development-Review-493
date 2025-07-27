import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useVibeStore } from '../store/vibeStore';
import { useProjectStore } from '../store/projectStore';
import VibeSelector from '../components/VibeSelector';
import QuickStats from '../components/QuickStats';
import RecentProjects from '../components/RecentProjects';
import ProductivityChart from '../components/ProductivityChart';

const { FiCode, FiTrendingUp, FiZap, FiTarget } = FiIcons;

const Dashboard = () => {
  const { currentVibe, productivity } = useVibeStore();
  const { projects } = useProjectStore();

  const stats = [
    {
      title: 'Active Projects',
      value: projects.length,
      icon: FiCode,
      color: 'text-vibe-blue',
      bgColor: 'bg-vibe-blue/10',
    },
    {
      title: 'Productivity Score',
      value: `${productivity}%`,
      icon: FiTrendingUp,
      color: 'text-vibe-green',
      bgColor: 'bg-vibe-green/10',
    },
    {
      title: 'Current Vibe',
      value: currentVibe,
      icon: FiZap,
      color: 'text-vibe-purple',
      bgColor: 'bg-vibe-purple/10',
    },
    {
      title: 'Goals Completed',
      value: '12/15',
      icon: FiTarget,
      color: 'text-vibe-orange',
      bgColor: 'bg-vibe-orange/10',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, Developer! 👋
        </h1>
        <p className="text-gray-400">
          Ready to code with the perfect vibe? Let's make today productive!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="bg-dark-surface border border-dark-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <SafeIcon icon={stat.icon} className={`text-xl ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProductivityChart />
          <RecentProjects />
        </div>
        <div className="space-y-6">
          <VibeSelector />
          <QuickStats />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;