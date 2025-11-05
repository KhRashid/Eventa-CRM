import React from 'react';
import { GeminiIcon } from '../icons';

interface AiAssistantButtonProps {
  onClick: () => void;
}

const AiAssistantButton: React.FC<AiAssistantButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-transform duration-200 ease-in-out z-40"
      aria-label="Open AI Assistant"
    >
      <GeminiIcon />
    </button>
  );
};

export default AiAssistantButton;