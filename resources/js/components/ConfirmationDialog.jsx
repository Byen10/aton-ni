import React from 'react';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-transparent">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="relative bg-white rounded-2xl max-w-md w-full mx-auto shadow-2xl shadow-blue-500/20 transform transition-all"
          onClick={(e) => e.stopPropagation()}>
          <div className="px-6 pt-5 pb-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-500">
                {message}
              </p>
            </div>
          </div>
          <div className="px-6 pb-6 flex gap-3 justify-center">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Yes, log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;