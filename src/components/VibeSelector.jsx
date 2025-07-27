import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useVibeStore } from '../store/vibeStore';
import toast from 'react-hot-toast';

const { FiZap, FiBrain, FiHeart, FiSun, FiUsers } = FiIcons;

const vibes = [
  {
    id: 'focused',
    name: 'Focused',
    icon: FiZap,
    color: 'vibe-blue',
    description: 'Deep work mode',
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: FiBrain,
    color: 'vibe-purple',
    description: 'Innovation time',
  },
  {
    id: 'relaxed',
    name: 'Relaxed',
    icon: FiHeart,
    color: 'vibe-green',
    description: 'Calm coding',
  },
  {
    id: 'energetic',
    name: 'Energetic',
    icon: FiSun,
    color: 'vibe-orange',
    description: 'High energy',
  },
  {
    id: 'collaborative',
    name: 'Collaborative',
    icon: FiUsers,
    color: 'vibe-pink',
    description: 'Team work',
  },
];

const VibeSelector = () => {
  const { currentVibe, setVibe } = useVibeStore();

  const handleVibeChange = (vibe) => {
    setVibe(vibe.id);
    toast.success(`Vibe set to ${vibe.name}! 🎯`);
  };

  return (
    <motion.div
      className="bg-dark-surface border border-dark-border rounded-xl p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-white mb-4">Select Your Vibe</h3>

      <div className="space-y-3">
        {vibes.map((vibe) => {
          const isActive = currentVibe === vibe.id;
          return (
            <motion.button
              key={vibe.id}
              onClick={() => handleVibeChange(vibe)}
              className={`w-full p-3 rounded-lg border transition-all duration-200 ${
                isActive 
                  ? `border-${vibe.color} bg-${vibe.color}/10` 
                  : 'border-dark-border hover:border-gray-600 hover:bg-dark-bg'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isActive ? `bg-${vibe.color}/20` : 'bg-dark-bg'}`}>
                  <SafeIcon
                    icon={vibe.icon}
                    className={`text-lg ${isActive ? `text-${vibe.color}` : 'text-gray-400'}`}
                  />
                </div>
                <div className="text-left">
                  <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {vibe.name}
                  </p>
                  <p className="text-sm text-gray-500">{vibe.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default VibeSelector;