import { toast } from 'react-toastify';

export const useApiError = () => {
  const handleError = (error, customMessage = null) => {
    const message = customMessage || error?.response?.data?.message || error?.message || 'An error occurred';
    
    // Log error for debugging
    console.error('API Error:', error);
    
    // Show user-friendly toast
    toast.error(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    
    return message;
  };

  const handleSuccess = (message = 'Operation successful') => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 2500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleWarning = (message) => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleInfo = (message) => {
    toast.info(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
};
