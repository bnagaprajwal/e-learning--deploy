import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatbotWidget: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const gemRef = useRef<GoogleGenerativeAI | null>(null);

  // Initialize Gemini AI
  useEffect(() => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY as string | undefined;
      if (apiKey && apiKey.trim() !== '') {
        gemRef.current = new GoogleGenerativeAI(apiKey);
      }
    } catch (error) {
      console.warn('Failed to initialize Gemini AI for chatbot:', error);
    }
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      if (!gemRef.current) {
        throw new Error('AI service is not available. Please configure your Google Cloud API key.');
      }

      const model = gemRef.current.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
        },
      });

      const prompt = `You are a helpful AI assistant for a learning platform. Provide clear, concise, and helpful responses. Be friendly and professional.

User question: "${userMessage.text}"

Provide a helpful response:`;

      const result = await model.generateContent(prompt);
      const response = result.response.text().trim();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error?.message || 'Sorry, I encountered an error. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            isDarkMode
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
              : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
          }`}
          aria-label="Open chatbot"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          className={`fixed bottom-6 right-6 z-50 w-96 h-[600px] rounded-2xl shadow-2xl flex flex-col border transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-4 py-3 rounded-t-2xl ${
              isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-white" />
              <span className="font-semibold text-white">AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-black/20 transition-colors text-white"
              aria-label="Close chatbot"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${
              isDarkMode ? 'dark-scrollbar' : ''
            }`}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  >
                    <Bot size={16} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-200'
                        : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                </div>
                {message.sender === 'user' && (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  >
                    <User size={16} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  <Bot size={16} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className={`border-t p-4 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="flex gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className={`flex-1 resize-none rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                } border`}
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className={`px-4 py-2 rounded-lg transition-all ${
                  !inputText.trim() || isLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                } ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-[#1A202C] hover:bg-[#2D3748] text-white'
                }`}
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
