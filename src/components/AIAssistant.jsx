import React from 'react';
import EnhancedAIAssistant from './EnhancedAIAssistant';

// Wrapper component for backward compatibility
const AIAssistant = (props) => {
  return <EnhancedAIAssistant {...props} />;
};

export default AIAssistant;