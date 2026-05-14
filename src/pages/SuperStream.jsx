import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { handlecreateSuperStream } from '../api/allApi';

const SuperStream = () => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a super stream name');
      return;
    }

    setIsLoading(true);

    try {
      const response = await handlecreateSuperStream({ name });
      toast.success('Super Stream created successfully!');
      setName('');

      return response.data
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create super stream');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Decorative header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Create Super Stream
          </h2>
          <p className="text-gray-500 mt-2">Launch a new streaming experience</p>
        </div>

        {/* Main form card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input field with floating label effect */}
            <div className="relative group">
              <input
                type="text"
                id="streamName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 peer"
                placeholder=" "
                disabled={isLoading}
              />
              <label
                htmlFor="streamName"
                className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-500 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 peer-focus:bg-white"
              >
                Super Stream Name
              </label>
            </div>

            {/* Character counter */}
            {name && (
              <div className="text-right text-xs text-gray-400 -mt-4">
                {name.length} characters
              </div>
            )}

            {/* Submit button with loading animation */}
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
            >
              <span className={`inline-flex items-center gap-2 transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Super Stream
              </span>
              
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </button>

            {/* Help text */}
            <p className="text-center text-xs text-gray-400 mt-4">
              Choose a unique name for your super stream
            </p>
          </form>
        </div>

        {/* Recent streams section (optional - can be removed if not needed) */}
        <div className="mt-6 text-center">
          <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            View all super streams →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperStream;