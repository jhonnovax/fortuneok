'use client';

import { useEffect } from 'react';

export default function DeleteAssetModal({ isOpen, onClose, onConfirm, assetSymbol }) {
  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box relative">
        {/* Add close button */}
        <button 
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          title='Close'
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">Remove Asset</h3>
        <p className="py-4">
          Are you sure you want to remove {assetSymbol} from your portfolio? This action cannot be undone.
        </p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-error" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Remove Asset
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
} 