import React, { useState, useEffect, useRef } from 'react';
import { Venue } from '../types';
import { getAiAssistance } from '../services/geminiService';
import { CloseIcon, GeminiIcon } from '../icons';

interface AiAssistantModalProps {
  venue: Venue | null;
  onClose: () => void;
}

type Message = {
  text: string;
  sender: 'user' | 'ai' | 'loading';
};

const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ venue, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialMessage = venue
      ? `Hi! I'm your AI assistant. How can I help you with information about "${venue.name}"?`
      : 'Hello! Please select a restaurant from the table to start asking questions.';
    setMessages([{ text: initialMessage, sender: 'ai' }]);
  }, [venue]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
   useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);


  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !venue) return;

    const userMessage: Message = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage, { text: '...', sender: 'loading' }]);
    setInputValue('');
    setIsLoading(true);

    const aiResponseText = await getAiAssistance(inputValue, venue);
    const aiMessage: Message = { text: aiResponseText, sender: 'ai' };

    setMessages(prev => [...prev.slice(0, -1), aiMessage]);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end justify-end z-50 p-4 md:p-8" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md h-[70vh] flex flex-col transform transition-transform duration-300 ease-out animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
                <div className="text-blue-400">
                    <GeminiIcon />
                </div>
                <h2 className="text-lg font-bold text-white">AI Assistant</h2>
            </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-700 rounded-full">
            <CloseIcon />
          </button>
        </header>

        <main className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'loading' ? (
                 <div className="bg-gray-700 text-white p-3 rounded-lg max-w-xs animate-pulse">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                 </div>
              ) : (
                <div
                  className={`p-3 rounded-lg max-w-xs lg:max-w-sm whitespace-pre-wrap ${
                    msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={venue ? "Ask something..." : "Select a restaurant first"}
              disabled={isLoading || !venue}
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim() || !venue}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </footer>
      </div>
      <style>{`
        @keyframes slide-in {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-slide-in {
            animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AiAssistantModal;