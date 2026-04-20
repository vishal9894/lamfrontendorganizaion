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
      setName('');
      
       return response.data
    } catch (error) {
      console.error('Error creating super stream:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create super stream');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Create Super Stream
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter super stream name..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Super Stream'}
        </button>
      </form>
    </div>
  );
};

export default SuperStream;