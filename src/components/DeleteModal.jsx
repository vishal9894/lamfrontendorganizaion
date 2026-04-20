import { AlertCircle, Loader, Trash2, X } from 'lucide-react';
import React from 'react';

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName = "",
  isLoading = false,
  confirmText = "Delete",
  cancelText = "Cancel",
  size = "md", // sm, md, lg
}) => {
  if (!isOpen) return null;

  // Size mappings
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300"
      onClick={handleBackdropClick}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300`}
        style={{ animation: 'slideIn 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Message */}
            <div className="text-gray-600">
              <p className="text-sm sm:text-base">{message}</p>
              {itemName && (
                <p className="mt-2 text-sm sm:text-base">
                  <span className="font-medium text-gray-800">Item: </span>
                  <span className="text-red-600 font-medium">"{itemName}"</span>
                </p>
              )}
            </div>

            {/* Warning Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-amber-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  This action is permanent and cannot be reversed. All associated data will be lost.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-500 rounded-xl hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>

     
    </div>
  );
};


export default DeleteModal;