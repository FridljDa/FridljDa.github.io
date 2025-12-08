import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div
      className={`max-w-[85%] rounded-2xl p-3 px-4 text-sm leading-relaxed ${
        message.role === 'user'
          ? 'bg-blue-600 text-white rounded-br-none'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
      }`}
    >
      <ReactMarkdown>{message.content}</ReactMarkdown>
    </div>
  );
}

