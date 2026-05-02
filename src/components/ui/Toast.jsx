import { useEffect } from "react";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const toastStyles = {
    success: "bg-green-50 text-green-800 border-l-4 border-green-500",
    error: "bg-red-50 text-red-800 border-l-4 border-red-500",
    info: "bg-blue-50 text-blue-800 border-l-4 border-blue-500",
  };

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
  };

  return (
    <div
      className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slideDown
      ${toastStyles[type] || toastStyles.info}`}
    >
      <span className="text-xl">{icons[type] || icons.info}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        ✕
      </button>
    </div>
  );
};

export default Toast;
