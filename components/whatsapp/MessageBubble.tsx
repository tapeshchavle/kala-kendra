'use client';

import { motion } from 'framer-motion';
import { Check, CheckCheck, FileText, Film, Image as ImageIcon } from 'lucide-react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'option' | 'file-preview' | 'typing';
  options?: string[];
  fileUrl?: string;
  fileName?: string;
  fileType?: 'image' | 'video' | 'document';
  stepInfo?: string;
}

interface MessageBubbleProps {
  message: Message;
  onOptionSelect?: (option: string) => void;
}

export default function MessageBubble({ message, onOptionSelect }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Typing indicator
  if (message.type === 'typing') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start mb-3 px-4"
      >
        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[80%]">
          <div className="flex items-center gap-1.5">
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 rounded-full bg-gray-400"
            />
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 rounded-full bg-gray-400"
            />
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 rounded-full bg-gray-400"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex mb-3 px-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`relative max-w-[80%] sm:max-w-[70%] px-3.5 py-2 shadow-sm ${
          isUser
            ? 'bg-[#DCF8C6] text-gray-800 rounded-2xl rounded-tr-sm'
            : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm'
        }`}
      >
        {/* Step indicator badge */}
        {message.stepInfo && (
          <div className="mb-1.5">
            <span className="inline-block text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              {message.stepInfo}
            </span>
          </div>
        )}

        {/* Text content */}
        {message.text && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
        )}

        {/* File preview */}
        {message.type === 'file-preview' && message.fileUrl && (
          <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
            {message.fileType === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={message.fileUrl}
                alt={message.fileName || 'Uploaded image'}
                className="w-full max-h-48 object-cover"
              />
            ) : message.fileType === 'video' ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50">
                <Film className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="text-xs text-gray-600 truncate">
                  {message.fileName || 'Video uploaded'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50">
                <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="text-xs text-gray-600 truncate">
                  {message.fileName || 'File uploaded'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Option buttons */}
        {message.type === 'option' && message.options && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {message.options.map((option) => (
              <button
                key={option}
                onClick={() => onOptionSelect?.(option)}
                className="px-4 py-1.5 text-sm font-medium rounded-full border-2 border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-500 hover:text-white transition-colors duration-200 active:scale-95"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp & read receipts */}
        <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-gray-400">{time}</span>
          {isUser && <CheckCheck className="h-3.5 w-3.5 text-blue-500" />}
        </div>
      </div>
    </motion.div>
  );
}
