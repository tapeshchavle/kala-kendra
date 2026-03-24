'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface InputBoxProps {
  onSend: (text: string) => void;
  onFileUpload: (files: FileList) => void;
  disabled?: boolean;
  placeholder?: string;
  acceptFileTypes?: string;
  multipleFiles?: boolean;
}

export default function InputBox({
  onSend,
  onFileUpload,
  disabled = false,
  placeholder = 'Type a message...',
  acceptFileTypes,
  multipleFiles = false,
}: InputBoxProps) {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
      // Reset so the same file can be re-selected
      e.target.value = '';
    }
  };

  return (
    <div className="border-t border-gray-200 bg-[#F0F0F0] px-3 py-2.5 sm:px-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* File attachment button */}
        {acceptFileTypes && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full text-gray-500 hover:text-emerald-600 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              key={`${acceptFileTypes}-${multipleFiles}`}
              ref={fileInputRef}
              type="file"
              accept={acceptFileTypes}
              multiple={multipleFiles}
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}

        {/* Text input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? 'Please wait...' : placeholder}
            className="w-full rounded-full bg-white border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          aria-label="Send message"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
