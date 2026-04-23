import { createContext, useContext, useState } from "react";

// Create Context
const UseApiContext = createContext();

// Provider Component
export const UseApiProvider = ({ children }) => {
  const [testData, setTestData] = useState(null);

  return (
    <UseApiContext.Provider value={{ testData, setTestData }}>
      {children}
    </UseApiContext.Provider>
  );
};

// Custom Hook
export const useApi = () => {
  return useContext(UseApiContext);
};