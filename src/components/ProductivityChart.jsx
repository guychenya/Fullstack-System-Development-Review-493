import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';

const ProductivityChart = () => {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1A1A2E',
      borderColor: '#2D2D44',
      textStyle: {
        color: '#ffffff'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLine: {
        lineStyle: {
          color: '#2D2D44'
        }
      },
      axisLabel: {
        color: '#9CA3AF'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#2D2D44'
        }
      },
      axisLabel: {
        color: '#9CA3AF'
      },
      splitLine: {
        lineStyle: {
          color: '#2D2D44'
        }
      }
    },
    series: [
      {
        name: 'Productivity',
        type: 'line',
        smooth: true,
        data: [65, 78, 82, 91, 85, 88, 92],
        lineStyle: {
          color: '#8B5CF6',
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(139, 92, 246, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(139, 92, 246, 0.05)'
              }
            ]
          }
        },
        itemStyle: {
          color: '#8B5CF6'
        }
      }
    ]
  };

  return (
    <motion.div
      className="bg-dark-surface border border-dark-border rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-white mb-4">Weekly Productivity</h3>
      <div className="h-64">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </motion.div>
  );
};

export default ProductivityChart;