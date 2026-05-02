import { createRoot } from "react-dom/client";
import "./index.css";
import { store } from "./redux/store.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import { UseApiProvider } from "./context/AppState.jsx";
import { QueryDevTools } from "./utils/reactQueryDevtools";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Create a client with optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'online',
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
      networkMode: 'online',
    },
  },
  logger: {
    log: () => { },
    warn: console.warn,
    error: process.env.NODE_ENV === 'development' ? console.error : () => { },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <UseApiProvider>
            <Provider store={store}>
              <App />
              <ToastContainer
                position="top-right"
                autoClose={2500}
                hideProgressBar={true}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                toastClassName="custom-toast"
                bodyClassName="custom-toast-body"
              />
            </Provider>
          </UseApiProvider>
        </BrowserRouter>
        <QueryDevTools />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
