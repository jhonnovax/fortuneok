'use client';

import { useState, useEffect } from 'react';
import { addTransaction } from '../services/investmentService';
import CurrencyInput from 'react-currency-input-field';
import CurrencyCombobox from './CurrencyCombobox';

const OPERATIONS = [
  { value: 'buy', label: 'Buy' },
  { value: 'sell', label: 'Sell' }
];

const INITIAL_FORM_STATE = {
  date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
  operation: 'buy',
  shares: '',
  currency: 'USD',
  price: '',
  notes: ''
};

export default function AddTransactionModal({ isOpen, onClose, onSave, investmentId, investmentName, investmentType }) {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM_STATE);
      setErrors({});
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.operation) newErrors.operation = 'Operation is required';
    if (!form.currency) newErrors.currency = 'Currency is required';
    if (!form.price) newErrors.price = 'Price is required';
    
    // Conditional required fields for tradeable assets
    const isTradeable = ['Stock', 'Bond', 'Crypto', 'ETF'].includes(investmentType);
    if (isTradeable && !form.shares) {
      newErrors.shares = 'Shares is required';
    }
    
    // Number validation
    if (form.shares && isNaN(Number(form.shares))) {
      newErrors.shares = 'Must be a valid number';
    }
    if (form.price && isNaN(Number(form.price))) {
      newErrors.price = 'Must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Prepare transaction data
      const transactionData = {
        date: new Date(form.date).toISOString(),
        operation: form.operation,
        currency: form.currency,
        shares: form.shares ? Number(form.shares) : null,
        pricePerUnit: Number(form.price),
        note: form.notes || ''
      };
      
      // Add the transaction to the investment
      await addTransaction(investmentId, transactionData);
      
      // Call the onSave callback with the form data
      if (onSave) {
        onSave(transactionData);
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
      setSubmitError('Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render label with required asterisk
  const renderLabel = (text, required = true) => (
    <label className="label">
      <span className="label-text">
        {text} {required && <span className="text-error">*</span>}
      </span>
    </label>
  );

  // Determine if shares field should be shown based on investment type
  const showShares = ['Stock', 'Bond', 'Crypto', 'ETF'].includes(investmentType);

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box max-w-2xl relative">
        {/* Close button */}
        <button 
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="font-bold text-lg mb-6">Add Transaction for {investmentName}</h3>
        
        {submitError && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{submitError}</span>
          </div>
        )}
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="form-control">
              {renderLabel('Date')}
              <input 
                type="date" 
                className={`input input-bordered w-full ${errors.date ? 'input-error' : ''}`}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                disabled={isSubmitting}
              />
              {errors.date && <span className="text-error text-sm mt-1">{errors.date}</span>}
            </div>

            {/* Operation */}
            <div className="form-control">
              {renderLabel('Operation')}
              <select 
                className={`select select-bordered w-full ${errors.operation ? 'select-error' : ''}`}
                value={form.operation}
                onChange={(e) => setForm({ ...form, operation: e.target.value })}
                disabled={isSubmitting}
              >
                {OPERATIONS.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
              {errors.operation && <span className="text-error text-sm mt-1">{errors.operation}</span>}
            </div>

            {/* Shares (for tradeable assets) */}
            {showShares && (
              <div className="form-control">
                {renderLabel('Shares/Units')}
                <CurrencyInput
                  id="shares-input"
                  name="shares"
                  placeholder="6.786"
                  className={`input input-bordered w-full ${errors.shares ? 'input-error' : ''}`}
                  value={form.shares}
                  decimalsLimit={6}
                  onValueChange={(value) => setForm({ ...form, shares: value })}
                  disabled={isSubmitting}
                  allowNegativeValue={false}
                  disableGroupSeparators={true}
                  decimalSeparator="."
                />
                {errors.shares && <span className="text-error text-sm mt-1">{errors.shares}</span>}
              </div>
            )}

            {/* Currency */}
            <div className="form-control">
              {renderLabel('Currency')}
              <CurrencyCombobox
                value={form.currency}
                onChange={(value) => setForm({ ...form, currency: value })}
                error={errors.currency}
                disabled={isSubmitting}
              />
            </div>

            {/* Price */}
            <div className="form-control">
              {renderLabel(showShares ? 'Price per Unit' : 'Amount')}
              <CurrencyInput
                id="price-input"
                name="price"
                placeholder="$245.76"
                className={`input input-bordered w-full ${errors.price ? 'input-error' : ''}`}
                value={form.price}
                decimalsLimit={2}
                onValueChange={(value) => setForm({ ...form, price: value })}
                disabled={isSubmitting}
                allowNegativeValue={false}
                decimalSeparator="."
              />
              {errors.price && <span className="text-error text-sm mt-1">{errors.price}</span>}
            </div>

            {/* Notes */}
            <div className="form-control md:col-span-2">
              {renderLabel('Notes', false)}
              <textarea 
                className="textarea textarea-bordered w-full"
                placeholder="Add any additional notes here..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </div>

          <div className="modal-action">
            <button 
              className="btn btn-ghost" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving...
                </>
              ) : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
} 