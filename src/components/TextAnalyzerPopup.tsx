import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useTextAnalyzerStore } from '../store/textAnalyzerStore';
import { GoogleGenerativeAI } from '@google/generative-ai';

const TextAnalyzerPopup: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { isEnabled: isTextAnalyzerEnabled } = useTextAnalyzerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [simplified, setSimplified] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const popupRef = useRef<HTMLDivElement>(null);
  const gemRef = useRef<GoogleGenerativeAI | null>(null);

  // Initialize Gemini AI
  useEffect(() => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY as string | undefined;
      if (apiKey && apiKey.trim() !== '') {
        gemRef.current = new GoogleGenerativeAI(apiKey);
      }
    } catch (error) {
      console.warn('Failed to initialize Gemini AI for text analysis:', error);
    }
  }, []);

  // Detect text selection
  useEffect(() => {
    // Don't listen for text selection if text analyzer is disabled
    if (!isTextAnalyzerEnabled) {
      return;
    }

    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const text = selection.toString().trim();
        // Only show popup if text is substantial (more than 10 characters)
        if (text.length > 10) {
          setSelectedText(text);
          if (!isOpen) {
            setIsOpen(true);
            setExplanation('');
            setSimplified('');
            setError('');
          }
        }
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);

    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('keyup', handleTextSelection);
    };
  }, [isOpen, isTextAnalyzerEnabled]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        // Don't close if user is selecting text
        const selection = window.getSelection();
        if (!selection || selection.toString().trim().length === 0) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const analyzeText = async (text: string, mode: 'explain' | 'simplify' = 'explain') => {
    if (!gemRef.current) {
      setError('AI service is not available. Please configure your Google Cloud API key.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const model = gemRef.current.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
        }
      });

      const prompt = mode === 'explain'
        ? `Explain this text in 1-2 short sentences. Be direct and simple.

Text: "${text.substring(0, 5000)}${text.length > 5000 ? '...' : ''}"

Give a brief, straightforward explanation.`
        : `Make this text simpler and shorter. Use easy words.

Text: "${text.substring(0, 5000)}${text.length > 5000 ? '...' : ''}"

Provide a simple, short version.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text().trim();

      if (mode === 'explain') {
        setExplanation(response);
      } else {
        setSimplified(response);
      }
    } catch (err: any) {
      console.error('Text analysis error:', err);
      setError(err?.message || 'Failed to analyze text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = () => {
    if (selectedText.trim()) {
      analyzeText(selectedText, 'explain');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedText('');
    setExplanation('');
    setSimplified('');
    setError('');
  };

  // Close popup if text analyzer is disabled
  useEffect(() => {
    if (!isTextAnalyzerEnabled && isOpen) {
      handleClose();
    }
  }, [isTextAnalyzerEnabled]);

  // Auto-analyze when text is selected and popup opens
  useEffect(() => {
    if (isOpen && selectedText && !explanation && !loading && isTextAnalyzerEnabled) {
      handleExplain();
    }
  }, [isOpen, selectedText, isTextAnalyzerEnabled]);

  // Don't render if disabled or not open
  if (!isTextAnalyzerEnabled || !isOpen) return null;

  // Calculate popup position (near selection)
  const getPopupPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX,
      };
    }
    return {
      top: window.innerHeight / 2,
      left: window.innerWidth / 2,
    };
  };

  const position = getPopupPosition();

  return (
    <div
      ref={popupRef}
      className="fixed z-[70] w-[420px] rounded-2xl overflow-hidden border shadow-2xl"
      style={{
        top: `${Math.min(position.top, window.innerHeight - 200)}px`,
        left: `${Math.min(position.left, window.innerWidth - 440)}px`,
        backgroundColor: isDarkMode ? '#111827' : '#ffffff',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      }}
    >
      {/* Content - Only Output Text */}
      <div className="p-4">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="animate-spin text-blue-500" size={20} />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
            {error}
          </p>
        )}

        {/* Explanation Output */}
        {explanation && !loading && (
          <p className={`text-sm leading-relaxed ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            {explanation}
          </p>
        )}

        {/* Simplified Text Output */}
        {simplified && !loading && (
          <p className={`text-sm leading-relaxed ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}>
            {simplified}
          </p>
        )}
      </div>
    </div>
  );
};

export default TextAnalyzerPopup;


