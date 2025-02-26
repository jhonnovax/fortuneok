'use client';

export default function DeleteAssetModal({ isOpen, onClose, onConfirm, assetSymbol }) {
  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
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