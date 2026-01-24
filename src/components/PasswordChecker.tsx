import React, { useState, useEffect } from 'react';

export default function PasswordChecker() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // The secret password from environment variable
  // Note: In a real application, never expose secrets to client-side code
  // This is intentionally insecure for educational purposes
  const SECRET_PASSWORD = import.meta.env.PUBLIC_SECRET_PASSWORD || 'HackathonWinner2026!';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Set checking state immediately - this should trigger re-render
    setStatus('checking');
    setMessage('Checking...');

    // Simulate a brief delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if the password matches
    if (input === SECRET_PASSWORD) {
      setStatus('success');
      setMessage('🎉 Access Granted! You found the secret password!');
    } else {
      setStatus('error');
      setMessage('❌ Access Denied. Incorrect password.');
    }
  };

  // Reset error state after 2 seconds
  useEffect(() => {
    if (status === 'error') {
      const timer = setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    // Reset status when user starts typing again
    if (status !== 'idle') {
      setStatus('idle');
      setMessage('');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-surface-elevated bg-surface';
    }
  };

  const getButtonColor = () => {
    switch (status) {
      case 'checking':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-primary hover:bg-primary-dark';
    }
  };

  return (
    <div className="my-8 p-6 border-2 border-surface-elevated rounded-lg bg-surface-elevated shadow-lg">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-heading mb-2">Password Checker</h3>
        <p className="text-body text-sm">
          Try to find the secret password and enter it below. Can you guess it?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter password here..."
            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 text-heading placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary ${getStatusColor()}`}
            disabled={status === 'checking'}
          />
          {status === 'checking' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!input.trim() || status === 'checking'}
          className={`w-full px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${getButtonColor()}`}
        >
          {status === 'checking' ? 'Checking...' : 'Check Password'}
        </button>
      </form>

      {(message || status === 'checking') && (
        <div
          className={`mt-4 p-4 rounded-lg transition-all duration-300 ${
            status === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-2 border-green-500'
              : status === 'error'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-2 border-red-500 animate-shake'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-2 border-blue-500'
          }`}
        >
          <p className="text-center font-medium">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="mt-4 text-center">
          <div className="animate-bounce inline-block text-4xl">🎊</div>
        </div>
      )}
    </div>
  );
}
