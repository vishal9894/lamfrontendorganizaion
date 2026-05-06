import OptimizedDataTable from '../components/OptimizedDataTable';
import { useState, useEffect } from "react";
import { PAGINATION_CONFIG } from "../utils/pagination";

const OptimizedViewStream = () => {
  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'streamUrl',
      label: 'Stream URL',
      render: (value) => (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
          {value}
        </a>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {value}
        </span>
      )
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Stream Management</h1>
      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <p className="text-gray-600">Stream management is currently disabled due to missing API hooks.</p>
      </div>
    </div>
  );
};

export default OptimizedViewStream;
