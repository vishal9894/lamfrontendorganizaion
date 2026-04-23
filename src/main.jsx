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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
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
    </QueryClientProvider>
  </StrictMode>,
);
