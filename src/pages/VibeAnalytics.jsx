import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTrendingUp, FiClock, FiZap, FiTarget } = FiIcons;

const VibeAnalytics = () => {
  const vibeDistributionOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1A1A2E',
      borderColor: '#2D2D44',
      textStyle: { color: '#ffffff' }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#9CA3AF' }
    },
    series: [
      {
        name: 'Vibe Distribution',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 35, name: 'Focused', itemStyle: { color: '#3B82F6' } },
          { value: 25, name: 'Creative', itemStyle: { color: '#8B5CF6' } },
          { value: 20, name: 'Relaxed', itemStyle: { color: '#10B981' } },
          { value: 15, name: 'Energetic', itemStyle: { color: '#F59E0B' } },
          { value: 5, name: 'Collaborative', itemStyle: { color: '#EC4899' } },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  const productivityTrendOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1A1A2E',
      borderColor: '#2D2D44',
      textStyle: { color: '#ffffff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      axisLine: { lineStyle: { color: '#2D2D44' } },
      axisLabel: { color: '#9CA3AF' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#2D2D44' } },
      axisLabel: { color: '#9CA3AF' },
      splitLine: { lineStyle: { color: '#2D2D44' } }
    },
    series: [
      {
        name: 'Productivity',
        type: 'bar',
        data: [75, 82, 88, 91],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#8B5CF6' },
              { offset: 1, color: '#3B82F6' }
            ]
          }
        }
      }
    ]
  };

  const stats = [
    {
      title: 'Average Productivity',
      value: '84%',
      change: '+12%',
      icon: FiTrendingUp,
      color: 'text-vibe-green',
    },
    {
      title: 'Total Coding Time',
      value: '127h',
      change: '+8h',
      icon: FiClock,
      color: 'text-vibe-blue',
    },
    {
      title: 'Vibe Sessions',
      value: '42',
      change: '+5',
      icon: FiZap,
      color: 'text-vibe-purple',
    },
    {
      title: 'Goals Achieved',
      value: '18/20',
      change: '+3',
      icon: FiTarget,
      color: 'text-vibe-orange',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Vibe Analytics</h1>
        <p className="text-gray-400">Track your coding productivity and vibe patterns</p>
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
            <div className="flex items-center justify-between mb-4">
              <SafeIcon icon={stat.icon} className={`text-2xl ${stat.color}`} />
              <span className="text-sm text-vibe-green font-medium">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-dark-surface border border-dark-border rounded-xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Vibe Distribution</h3>
          <div className="h-80">
            <ReactECharts option={vibeDistributionOption} style={{ height: '100%' }} />
          </div>
        </motion.div>

        <motion.div
          className="bg-dark-surface border border-dark-border rounded-xl p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Productivity Trend</h3>
          <div className="h-80">
            <ReactECharts option={productivityTrendOption} style={{ height: '100%' }} />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="bg-dark-surface border border-dark-border rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { time: '2 hours ago', activity: 'Switched to Focused vibe', vibe: 'focused' },
            { time: '4 hours ago', activity: 'Completed React component', vibe: 'creative' },
            { time: '6 hours ago', activity: 'Started debugging session', vibe: 'focused' },
            { time: '1 day ago', activity: 'Team collaboration session', vibe: 'collaborative' },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between py-3 border-b border-dark-border last:border-b-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  item.vibe === 'focused' ? 'bg-vibe-blue' :
                  item.vibe === 'creative' ? 'bg-vibe-purple' :
                  item.vibe === 'collaborative' ? 'bg-vibe-pink' : 'bg-vibe-green'
                }`}></div>
                <span className="text-gray-300">{item.activity}</span>
              </div>
              <span className="text-gray-500 text-sm">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default VibeAnalytics;