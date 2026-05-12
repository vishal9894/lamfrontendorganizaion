import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Backdrop,
  LinearProgress,
  keyframes,
  styled
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// Animated keyframes for LMS themed loader
// ============================================
const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const rotateBook = keyframes`
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
`;

const bounceDot = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-15px); }
`;

// ============================================
// Styled Components for LMS Loader
// ============================================
const BookLoaderWrapper = styled(Box)(({ theme }) => ({
  perspective: '1000px',
  '& .book-icon': {
    animation: `${rotateBook} 2s ease-in-out infinite`,
    transformStyle: 'preserve-3d',
  }
}));

const ShimmerText = styled(Typography)({
  background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1)',
  backgroundSize: '200% auto',
  animation: `${shimmer} 2s linear infinite`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  fontWeight: 700,
});

const PulseDot = styled(Box)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
  animation: `${bounceDot} 1.4s ease-in-out infinite`,
  '&:nth-of-type(1)': { animationDelay: '0s' },
  '&:nth-of-type(2)': { animationDelay: '0.2s' },
  '&:nth-of-type(3)': { animationDelay: '0.4s' },
}));

// Loading variants for different contexts
export const LoadingVariants = {
  FULL_PAGE: 'full_page',
  COMPONENT: 'component',
  BUTTON: 'button',
  TABLE: 'table',
  CARD: 'card',
  INLINE: 'inline',
  BACKDROP: 'backdrop',
  PROGRESS: 'progress',
  // LMS Specific variants
  COURSE_LOADING: 'course_loading',
  LESSON_LOADING: 'lesson_loading',
  CERTIFICATE_GENERATING: 'certificate_generating',
  QUIZ_SUBMITTING: 'quiz_submitting',
  VIDEO_BUFFERING: 'video_buffering'
};

// ============================================
// Main LMS Loading Component
// ============================================
const LoadingState = ({
  variant = LoadingVariants.COMPONENT,
  size = 'medium',
  message = 'Loading...',
  showBackdrop = false,
  sx = {},
  progress = 0,
  subMessage = '',
  lmsTheme = 'default' // 'default', 'dark', 'light'
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'medium': return 48;
      case 'large': return 64;
      default: return 48;
    }
  };

  const getThemeColors = () => {
    switch (lmsTheme) {
      case 'dark':
        return {
          primary: '#818cf8',
          secondary: '#c084fc',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f1f5f9',
          gradient: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)'
        };
      case 'light':
        return {
          primary: '#6366f1',
          secondary: '#a855f7',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1e293b',
          gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
        };
      default:
        return {
          primary: '#6366f1',
          secondary: '#a855f7',
          background: '#ffffff',
          surface: '#f1f5f9',
          text: '#1e293b',
          gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
        };
    }
  };

  const colors = getThemeColors();

  // ============================================
  // LMS Specific Loader Renderers
  // ============================================

  const renderCourseLoading = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        borderRadius: 4,
        background: colors.surface,
        ...sx
      }}
    >
      <BookLoaderWrapper>
        <Box
          className="book-icon"
          sx={{
            fontSize: getSize(),
            color: colors.primary,
            mb: 2
          }}
        >
          📚
        </Box>
      </BookLoaderWrapper>
      <ShimmerText variant="h6" sx={{ mb: 1 }}>
        {message || 'Loading Course Content...'}
      </ShimmerText>
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        {[0, 1, 2].map((i) => (
          <PulseDot key={i} />
        ))}
      </Box>
    </Box>
  );

  const renderLessonLoading = () => (
    <Box sx={{ width: '100%', ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <CircularProgress size={24} thickness={4} sx={{ color: colors.primary, mr: 2 }} />
        </motion.div>
        <Typography variant="body2" sx={{ color: colors.text }}>
          {message || 'Preparing lesson...'}
        </Typography>
      </Box>
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 2 }} />
      <Skeleton variant="text" height={32} width="70%" sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} width="90%" />
      <Skeleton variant="text" height={20} width="85%" />
    </Box>
  );

  const renderCertificateGenerating = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 5,
        background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15)`,
        borderRadius: 4,
        ...sx
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ fontSize: getSize() * 1.5, mb: 2 }}>🏆</Box>
      </motion.div>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: colors.text }}>
        {message || 'Generating Your Certificate...'}
      </Typography>
      <Box sx={{ width: '100%', maxWidth: 300, mt: 2 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: `${colors.primary}30`,
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: colors.gradient,
            }
          }}
        />
      </Box>
      <Typography variant="caption" sx={{ color: colors.text, opacity: 0.7, mt: 1 }}>
        {subMessage || `Please wait while we prepare your achievement...`}
      </Typography>
    </Box>
  );

  const renderQuizSubmitting = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        ...sx
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Box sx={{ fontSize: getSize(), mb: 2 }}>📝</Box>
      </motion.div>
      <CircularProgress size={getSize() * 0.75} sx={{ color: colors.primary, mb: 2 }} />
      <Typography variant="body1" sx={{ fontWeight: 500, color: colors.text }}>
        {message || 'Submitting Your Answers...'}
      </Typography>
      <Typography variant="caption" sx={{ color: colors.text, opacity: 0.6, mt: 1 }}>
        {subMessage || 'Please don\'t close this window'}
      </Typography>
    </Box>
  );

  const renderVideoBuffering = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...sx
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CircularProgress
          size={getSize()}
          thickness={2}
          sx={{ color: colors.primary, opacity: 0.3 }}
        />
        <CircularProgress
          size={getSize()}
          thickness={2}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            color: colors.primary,
            '& .MuiCircularProgress-circle': {
              strokeDasharray: '80px, 200px',
              strokeDashoffset: 0,
            }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: getSize() * 0.4
          }}
        >
          ▶️
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mt: 2, color: colors.text }}>
        {message || 'Buffering video...'}
      </Typography>
    </Box>
  );

  const renderFullPage = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        background: colors.background,
        ...sx
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <BookLoaderWrapper>
          <motion.div
            animate={{ rotateY: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: getSize() }}
          >
            📖
          </motion.div>
        </BookLoaderWrapper>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <ShimmerText variant="h4" sx={{ mt: 4, fontWeight: 700 }}>
          {message || 'Learning Management System'}
        </ShimmerText>
      </motion.div>

      {subMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Typography variant="body2" sx={{ mt: 2, color: colors.text, opacity: 0.7 }}>
            {subMessage}
          </Typography>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 200 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <Box sx={{ mt: 4 }}>
          <LinearProgress
            sx={{
              height: 4,
              borderRadius: 2,
              width: 200,
              bgcolor: `${colors.primary}30`,
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                background: colors.gradient,
              }
            }}
          />
        </Box>
      </motion.div>

      <Box sx={{ display: 'flex', gap: 1.5, mt: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: colors.gradient,
              }}
            />
          </motion.div>
        ))}
      </Box>
    </Box>
  );

  const renderComponent = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={3}
      sx={sx}
    >
      <CircularProgress size={getSize()} sx={{ color: colors.primary }} />
      {message && (
        <Typography variant="body2" sx={{ mt: 1, color: colors.text, opacity: 0.7 }}>
          {message}
        </Typography>
      )}
    </Box>
  );

  const renderTable = () => (
    <Box sx={{ width: '100%', ...sx }}>
      {[...Array(5)].map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            p: 2,
            borderBottom: `1px solid ${colors.surface}`,
            gap: 2
          }}
        >
          <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: `${colors.primary}20` }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ bgcolor: `${colors.primary}20` }} />
            <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: `${colors.primary}15` }} />
          </Box>
          <Skeleton variant="rounded" width={80} height={32} sx={{ bgcolor: `${colors.primary}20` }} />
        </Box>
      ))}
    </Box>
  );

  const renderCard = () => (
    <Box sx={{ p: 2, ...sx }}>
      <Skeleton
        variant="rectangular"
        height={180}
        sx={{
          borderRadius: 2,
          mb: 2,
          bgcolor: `${colors.primary}20`,
          animation: `${shimmer} 1.5s infinite`
        }}
      />
      <Skeleton variant="text" width="80%" height={28} sx={{ bgcolor: `${colors.primary}20`, mb: 1 }} />
      <Skeleton variant="text" width="90%" height={20} sx={{ bgcolor: `${colors.primary}15`, mb: 1 }} />
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <Skeleton variant="rounded" width={60} height={24} sx={{ bgcolor: `${colors.primary}20` }} />
        <Skeleton variant="rounded" width={80} height={24} sx={{ bgcolor: `${colors.primary}20` }} />
      </Box>
    </Box>
  );

  const renderBackdrop = () => (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        ...sx
      }}
      open={true}
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <CircularProgress size={getSize()} sx={{ color: colors.primary }} />
        </motion.div>
        {message && (
          <Typography sx={{ mt: 2, fontWeight: 500 }}>{message}</Typography>
        )}
      </Box>
    </Backdrop>
  );

  const renderProgress = () => (
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
            bgcolor: `${colors.primary}20`,
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: colors.gradient,
            }
          }}
        />
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 500, color: colors.text }}>
        {message} {progress > 0 && `(${Math.round(progress)}%)`}
      </Typography>
      {subMessage && (
        <Typography variant="caption" sx={{ color: colors.text, opacity: 0.6, mt: 1 }}>
          {subMessage}
        </Typography>
      )}
    </Box>
  );

  // Main render switch
  switch (variant) {
    case LoadingVariants.FULL_PAGE:
      return renderFullPage();
    case LoadingVariants.COURSE_LOADING:
      return renderCourseLoading();
    case LoadingVariants.LESSON_LOADING:
      return renderLessonLoading();
    case LoadingVariants.CERTIFICATE_GENERATING:
      return renderCertificateGenerating();
    case LoadingVariants.QUIZ_SUBMITTING:
      return renderQuizSubmitting();
    case LoadingVariants.VIDEO_BUFFERING:
      return renderVideoBuffering();
    case LoadingVariants.COMPONENT:
      return renderComponent();
    case LoadingVariants.TABLE:
      return renderTable();
    case LoadingVariants.CARD:
      return renderCard();
    case LoadingVariants.BACKDROP:
      return renderBackdrop();
    case LoadingVariants.PROGRESS:
      return renderProgress();
    case LoadingVariants.BUTTON:
      return (
        <Box display="flex" alignItems="center" gap={1} sx={sx}>
          <CircularProgress size={20} thickness={4} sx={{ color: colors.primary }} />
          <Typography variant="body2" sx={{ color: colors.text }}>
            {message || 'Loading...'}
          </Typography>
        </Box>
      );
    case LoadingVariants.INLINE:
      return (
        <Box display="inline-flex" alignItems="center" gap={1} sx={sx}>
          <CircularProgress size={16} thickness={4} sx={{ color: colors.primary }} />
          <Typography variant="caption" sx={{ color: colors.text, opacity: 0.7 }}>
            {message || 'Loading...'}
          </Typography>
        </Box>
      );
    default:
      return <CircularProgress size={getSize()} sx={{ color: colors.primary }} />;
  }
};

// ============================================
// Higher-order component for loading states
// ============================================
export const withLoadingState = (WrappedComponent, loadingOptions = {}) => {
  return function WithLoadingStateComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <LoadingState {...loadingOptions} />;
    }
    return <WrappedComponent {...props} />;
  };
};

// ============================================
// Hook for managing loading states
// ============================================
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [loadingMessage, setLoadingMessage] = React.useState('Loading...');
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const [loadingVariant, setLoadingVariant] = React.useState(LoadingVariants.COMPONENT);

  const startLoading = React.useCallback((message = 'Loading...', variant = LoadingVariants.COMPONENT) => {
    setLoadingMessage(message);
    setLoadingVariant(variant);
    setIsLoading(true);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
    setLoadingProgress(0);
  }, []);

  const updateProgress = React.useCallback((progress) => {
    setLoadingProgress(progress);
  }, []);

  const setLoading = React.useCallback((loading, message = 'Loading...', variant = LoadingVariants.COMPONENT) => {
    setLoadingMessage(message);
    setLoadingVariant(variant);
    setIsLoading(loading);
  }, []);

  return {
    isLoading,
    loadingMessage,
    loadingProgress,
    loadingVariant,
    startLoading,
    stopLoading,
    updateProgress,
    setLoading
  };
};

// ============================================
// Predefined LMS Loading Configurations
// ============================================
export const LoadingConfigs = {
  // LMS Specific Configs
  COURSE_LOADING: {
    variant: LoadingVariants.COURSE_LOADING,
    size: 'large',
    message: 'Loading course materials...',
    subMessage: 'Preparing your learning journey'
  },
  LESSON_LOADING: {
    variant: LoadingVariants.LESSON_LOADING,
    size: 'medium',
    message: 'Loading lesson content...',
    subMessage: 'Getting things ready for you'
  },
  QUIZ_SUBMITTING: {
    variant: LoadingVariants.QUIZ_SUBMITTING,
    size: 'large',
    message: 'Submitting your quiz...',
    subMessage: 'Please wait while we save your answers'
  },
  CERTIFICATE_GENERATING: {
    variant: LoadingVariants.CERTIFICATE_GENERATING,
    size: 'large',
    message: 'Generating certificate...',
    subMessage: 'Your achievement is being prepared'
  },
  VIDEO_BUFFERING: {
    variant: LoadingVariants.VIDEO_BUFFERING,
    size: 'medium',
    message: 'Loading video...'
  },
  PAGE_LOAD: {
    variant: LoadingVariants.FULL_PAGE,
    size: 'large',
    message: 'Welcome to Your Learning Portal',
    subMessage: 'Loading your personalized dashboard'
  },
  DATA_FETCHING: {
    variant: LoadingVariants.COMPONENT,
    size: 'medium',
    message: 'Fetching data...'
  },
  TABLE_LOADING: {
    variant: LoadingVariants.TABLE,
    message: 'Loading student records...'
  },
  CARD_LOADING: {
    variant: LoadingVariants.CARD,
    message: 'Loading courses...'
  },
  FILE_UPLOAD: {
    variant: LoadingVariants.BACKDROP,
    size: 'large',
    message: 'Uploading assignment...'
  }
};


export const LMSLoaders = {
  CourseLoader: (props) => <LoadingState variant={LoadingVariants.COURSE_LOADING} {...props} />,
  LessonLoader: (props) => <LoadingState variant={LoadingVariants.LESSON_LOADING} {...props} />,
  QuizLoader: (props) => <LoadingState variant={LoadingVariants.QUIZ_SUBMITTING} {...props} />,
  CertificateLoader: (props) => <LoadingState variant={LoadingVariants.CERTIFICATE_GENERATING} {...props} />,
  VideoLoader: (props) => <LoadingState variant={LoadingVariants.VIDEO_BUFFERING} {...props} />,
  FullPageLoader: (props) => <LoadingState variant={LoadingVariants.FULL_PAGE} {...props} />
};

export default LoadingState;