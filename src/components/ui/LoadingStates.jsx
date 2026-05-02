import React from 'react';
import { Box, CircularProgress, Typography, Skeleton, Backdrop } from '@mui/material';
import { motion } from 'framer-motion';

// Loading variants for different contexts
export const LoadingVariants = {
  // Full page loading
  FULL_PAGE: 'full_page',
  // Component loading
  COMPONENT: 'component',
  // Button loading
  BUTTON: 'button',
  // Table loading
  TABLE: 'table',
  // Card loading
  CARD: 'card',
  // Inline loading
  INLINE: 'inline',
  // Backdrop loading
  BACKDROP: 'backdrop'
};

// Main Loading Component
const LoadingState = ({ 
  variant = LoadingVariants.COMPONENT,
  size = 'medium',
  message = 'Loading...',
  showBackdrop = false,
  sx = {}
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'medium': return 40;
      case 'large': return 60;
      default: return 40;
    }
  };

  const renderLoadingContent = () => {
    switch (variant) {
      case LoadingVariants.FULL_PAGE:
        return (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              ...sx
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CircularProgress size={getSize()} thickness={4} />
            </motion.div>
            <Typography 
              variant="h6" 
              sx={{ mt: 2, color: 'text.secondary' }}
            >
              {message}
            </Typography>
          </Box>
        );

      case LoadingVariants.COMPONENT:
        return (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={3}
            sx={sx}
          >
            <CircularProgress size={getSize()} />
            {message && (
              <Typography 
                variant="body2" 
                sx={{ mt: 1, color: 'text.secondary' }}
              >
                {message}
              </Typography>
            )}
          </Box>
        );

      case LoadingVariants.BUTTON:
        return (
          <Box display="flex" alignItems="center" sx={sx}>
            <CircularProgress size={20} thickness={3} />
            {message && (
              <Typography variant="body2" sx={{ ml: 1 }}>
                {message}
              </Typography>
            )}
          </Box>
        );

      case LoadingVariants.TABLE:
        return (
          <Box sx={{ width: '100%', ...sx }}>
            {[...Array(5)].map((_, index) => (
              <Box key={index} sx={{ display: 'flex', p: 2, borderBottom: '1px solid #eee' }}>
                <Skeleton variant="text" width="20%" height={40} sx={{ mr: 2 }} />
                <Skeleton variant="text" width="30%" height={40} sx={{ mr: 2 }} />
                <Skeleton variant="text" width="25%" height={40} sx={{ mr: 2 }} />
                <Skeleton variant="text" width="15%" height={40} sx={{ mr: 2 }} />
                <Skeleton variant="rectangular" width={80} height={32} />
              </Box>
            ))}
          </Box>
        );

      case LoadingVariants.CARD:
        return (
          <Box sx={{ p: 2, ...sx }}>
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
        );

      case LoadingVariants.INLINE:
        return (
          <Box display="inline-flex" alignItems="center" sx={sx}>
            <CircularProgress size={16} thickness={3} />
            {message && (
              <Typography variant="caption" sx={{ ml: 1 }}>
                {message}
              </Typography>
            )}
          </Box>
        );

      case LoadingVariants.BACKDROP:
        return (
          <Backdrop
            sx={{ 
              color: '#fff', 
              zIndex: (theme) => theme.zIndex.drawer + 1,
              ...sx 
            }}
            open={true}
          >
            <Box display="flex" flexDirection="column" alignItems="center">
              <CircularProgress color="inherit" size={getSize()} />
              {message && (
                <Typography sx={{ mt: 2 }}>
                  {message}
                </Typography>
              )}
            </Box>
          </Backdrop>
        );

      default:
        return <CircularProgress size={getSize()} />;
    }
  };

  return renderLoadingContent();
};

// Higher-order component for loading states
export const withLoadingState = (WrappedComponent, loadingOptions = {}) => {
  return function WithLoadingStateComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <LoadingState {...loadingOptions} />;
    }
    return <WrappedComponent {...props} />;
  };
};

// Hook for managing loading states
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [loadingMessage, setLoadingMessage] = React.useState('Loading...');

  const startLoading = React.useCallback((message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoading = React.useCallback((loading, message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(loading);
  }, []);

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    setLoading
  };
};

// Predefined loading configurations
export const LoadingConfigs = {
  // Data fetching
  DATA_FETCHING: {
    variant: LoadingVariants.COMPONENT,
    size: 'medium',
    message: 'Fetching data...'
  },
  
  // Form submission
  FORM_SUBMISSION: {
    variant: LoadingVariants.BUTTON,
    size: 'small',
    message: 'Submitting...'
  },
  
  // File upload
  FILE_UPLOAD: {
    variant: LoadingVariants.BACKDROP,
    size: 'large',
    message: 'Uploading file...'
  },
  
  // Table loading
  TABLE_LOADING: {
    variant: LoadingVariants.TABLE,
    message: ''
  },
  
  // Card loading
  CARD_LOADING: {
    variant: LoadingVariants.CARD,
    message: ''
  },
  
  // Initial page load
  INITIAL_LOAD: {
    variant: LoadingVariants.FULL_PAGE,
    size: 'large',
    message: 'Loading application...'
  }
};

// Export default component
export default LoadingState;
