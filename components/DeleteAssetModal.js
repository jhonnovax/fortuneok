'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

// Dynamic import for ButtonSignin to reduce initial bundle size
const ButtonSignin = dynamic(() => import('@/components/ButtonSignin'), {
  ssr: false,
  loading: () => <div className="btn btn-primary">Sign In</div>
});

export default function DeleteAssetModal({ isOpen, onClose, onConfirm, assetSymbol }) {

  const { data: session } = useSession();

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
    <dialog className={`modal ${isOpen ? 'modal-open' : 'hidden'}`}>
      <div className="modal-box relative p-0">

        <div className="flex justify-center items-center border-b border-base-content/20 p-4">
          {/* Heading */}
          <h3 className="font-bold text-lg">Remove Asset</h3>

          {/* Close button */}
          <button 
            onClick={onClose}
            className="btn btn-sm btn-tertiary btn-circle ml-auto"
            title='Close'
          >
            ✕
          </button>
        </div>

        <p className="p-4 pb-2">
          Are you sure you want to remove {assetSymbol} from your portfolio? This action cannot be undone.
        </p>

        <div className="modal-action p-4 pt-0">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          {session && (
            <button 
              className="btn btn-error" 
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Remove Asset
            </button>
          )}
          {!session && <ButtonSignin extraStyle="btn-primary" />}
        </div>

      </div>

      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>

    </dialog>
  );
} 