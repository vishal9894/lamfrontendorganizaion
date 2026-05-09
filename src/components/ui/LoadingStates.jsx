import React from 'react';
import { Box, CircularProgress, Typography, Skeleton, Backdrop, LinearProgress } from '@mui/material';
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
  BACKDROP: 'backdrop',
  // Progress loading with percentage
  PROGRESS: 'progress'
};

// Main Loading Component
const LoadingState = ({
  variant = LoadingVariants.COMPONENT,
  size = 'medium',
  message = 'Loading...',
  showBackdrop = false,
  sx = {},
  progress = 0,
  subMessage = ''
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              ...sx
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <CircularProgress
                  size={getSize() * 1.5}
                  thickness={3}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.3)',
                  }}
                />
                <CircularProgress
                  size={getSize() * 1.5}
                  thickness={3}
                  sx={{
                    position: 'absolute',
                    color: '#fff',
                    animation: 'spin 2s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                />
              </Box>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Typography
                variant="h4"
                sx={{ mt: 4, color: '#fff', fontWeight: 600 }}
              >
                {message}
              </Typography>
              {subMessage && (
                <Typography
                  variant="body1"
                  sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.8)' }}
                >
                  {subMessage}
                </Typography>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Box sx={{ mt: 4, display: 'flex', gap: 1 }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#fff'
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </motion.div>
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
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CircularProgress color="inherit" size={getSize()} />
              </motion.div>
              {message && (
                <Typography sx={{ mt: 2 }}>
                  {message}
                </Typography>
              )}
            </Box>
          </Backdrop>
        );

      case LoadingVariants.PROGRESS:
        return (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={4}
            sx={sx}
          >
            <Box sx={{ width: '100%', maxWidth: 400, mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                  }
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {message} {progress > 0 && `(${Math.round(progress)}%)`}
            </Typography>
            {subMessage && (
              <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1 }}>
                {subMessage}
              </Typography>
            )}
          </Box>
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
