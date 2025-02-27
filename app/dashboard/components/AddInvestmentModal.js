'use client';

import { useState, useEffect } from 'react';
import { createInvestment, addTransaction } from '../services/investmentService';

// Map UI categories to API categories
const CATEGORY_MAPPING = {
  'stocks': 'Stock',
  'bonds': 'Bond',
  'cryptocurrencies': 'Crypto',
  'etf_funds': 'ETF',
  'real_estate': 'Real Estate',
  'cash': 'Cash',
  'savings_account': 'Cash',
  'precious_metals': 'Other',
  'p2p_loans': 'Other',
  'option': 'Other',
  'futures': 'Other',
  'other_custom_assets': 'Other'
};

const CATEGORIES = [
  { value: 'real_estate', label: '🏠 Real Estate' },
  { value: 'savings_account', label: '🏦 Savings account' },
  { value: 'precious_metals', label: '👑 Precious metals' },
  { value: 'cash', label: '💵 Cash' },
  { value: 'p2p_loans', label: '🤝 P2P loans' },
  { value: 'stocks', label: '📈 Stocks' },
  { value: 'bonds', label: '📈 Bonds' },
  { value: 'cryptocurrencies', label: '📈 Cryptocurrencies' },
  { value: 'etf_funds', label: '📈 ETF / Funds' },
  { value: 'option', label: '📈 Option' },
  { value: 'futures', label: '📈 Futures' },
  { value: 'other_custom_assets', label: '🔷 Other custom assets' }
];

const TRADEABLE_CATEGORIES = [
  'stocks', 'bonds', 'cryptocurrencies', 'etf_funds', 'option', 'futures'
];

const INITIAL_FORM_STATE = {
  category: '',
  description: '',
  date: '',
  operation: '',
  symbol: '',
  shares: '',
  currency: '',
  price: '',
  annualInterestRate: '',
  notes: ''
};

const TRADING_CATEGORIES = [
  'stocks', 
  'bonds', 
  'cryptocurrencies', 
  'etf_funds', 
  'option', 
  'futures'
];

export default function AddInvestmentModal({ isOpen, onClose, onSave }) {
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
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.operation) newErrors.operation = 'Operation is required';
    if (!form.currency) newErrors.currency = 'Currency is required';
    if (!form.price) newErrors.price = 'Price is required';
    
    // Conditional required fields
    if (showDescription && !form.description) {
      newErrors.description = 'Description is required';
    }
    
    if (showSymbol && !form.symbol) {
      newErrors.symbol = 'Symbol is required';
    }
    
    if (showShares && !form.shares) {
      newErrors.shares = 'Shares is required';
    }
    
    // Number validation
    if (form.shares && isNaN(Number(form.shares))) {
      newErrors.shares = 'Must be a valid number';
    }
    if (form.price && isNaN(Number(form.price))) {
      newErrors.price = 'Must be a valid number';
    }
    if (form.annualInterestRate && isNaN(Number(form.annualInterestRate))) {
      newErrors.annualInterestRate = 'Must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (saveAndAdd = false) => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Map UI category to API category
      const apiCategory = CATEGORY_MAPPING[form.category] || 'Other';
      
      // Prepare investment data
      const investmentData = {
        category: apiCategory,
        description: form.description || form.symbol,
        symbol: form.symbol || null,
        annualInterestRate: form.annualInterestRate ? Number(form.annualInterestRate) : 0
      };
      
      // Create the investment
      const newInvestment = await createInvestment(investmentData);
      
      // Prepare transaction data
      const transactionData = {
        date: new Date(form.date).toISOString(),
        operation: form.operation,
        currency: form.currency,
        shares: showShares ? Number(form.shares) : null,
        pricePerUnit: Number(form.price),
        note: form.notes || ''
      };
      
      // Add the transaction to the investment
      await addTransaction(newInvestment.id, transactionData);
      
      // Call the onSave callback with the form data
      if (onSave) {
        onSave({
          ...investmentData,
          transaction: transactionData
        }, saveAndAdd);
      }
      
      // Close the modal if not saving and adding another
      if (!saveAndAdd) {
        onClose();
      } else {
        // Reset form for adding another transaction
        setForm({
          ...INITIAL_FORM_STATE,
          category: form.category, // Keep the same category
          description: form.description, // Keep the same description
          symbol: form.symbol, // Keep the same symbol
          annualInterestRate: form.annualInterestRate // Keep the same interest rate
        });
      }
    } catch (error) {
      console.error('Error saving investment:', error);
      setSubmitError('Failed to save investment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showShares = TRADEABLE_CATEGORIES.includes(form.category);
  const showSymbol = TRADING_CATEGORIES.includes(form.category);
  const showDescription = !TRADING_CATEGORIES.includes(form.category);
  const hideInterestRate = TRADING_CATEGORIES.includes(form.category);

  // Helper function to render label with required asterisk
  const renderLabel = (text, required = true) => (
    <label className="label">
      <span className="label-text">
        {text} {required && <span className="text-error">*</span>}
      </span>
    </label>
  );

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

        <h3 className="font-bold text-lg mb-6">Add Transaction</h3>
        
        {submitError && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{submitError}</span>
          </div>
        )}
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="form-control">
              {renderLabel('Category')}
              <select 
                className={`select select-bordered w-full ${errors.category ? 'select-error' : ''}`}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                disabled={isSubmitting}
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <span className="text-error text-sm mt-1">{errors.category}</span>}
            </div>

            {/* Description or Symbol based on category */}
            {showDescription ? (
              <div className="form-control">
                {renderLabel('Description')}
                <input 
                  type="text"
                  className={`input input-bordered w-full ${errors.description ? 'input-error' : ''}`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter description"
                  disabled={isSubmitting}
                />
                {errors.description && <span className="text-error text-sm mt-1">{errors.description}</span>}
              </div>
            ) : (
              <div className="form-control">
                {renderLabel('Symbol')}
                <input 
                  type="text"
                  className={`input input-bordered w-full ${errors.symbol ? 'input-error' : ''}`}
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                  placeholder="Enter symbol"
                  disabled={isSubmitting}
                />
                {errors.symbol && <span className="text-error text-sm mt-1">{errors.symbol}</span>}
              </div>
            )}

            {/* Date - Moved before Operation */}
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
                <option value="">Select...</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="dividend">Dividend</option>
                <option value="interest">Interest</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
              {errors.operation && <span className="text-error text-sm mt-1">{errors.operation}</span>}
            </div>

            {/* Currency */}
            <div className="form-control">
              {renderLabel('Currency')}
              <select 
                className={`select select-bordered w-full ${errors.currency ? 'select-error' : ''}`}
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                disabled={isSubmitting}
              >
                <option value="">Select...</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              {errors.currency && <span className="text-error text-sm mt-1">{errors.currency}</span>}
            </div>

            {/* Price */}
            <div className="form-control">
              {renderLabel('Price')}
              <input 
                type="number"
                step="any"
                className={`input input-bordered w-full ${errors.price ? 'input-error' : ''}`}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                disabled={isSubmitting}
              />
              {errors.price && <span className="text-error text-sm mt-1">{errors.price}</span>}
            </div>

            {/* Shares */}
            {showShares && (
              <div className="form-control">
                {renderLabel('Shares')}
                <input 
                  type="number"
                  step="any"
                  className={`input input-bordered w-full ${errors.shares ? 'input-error' : ''}`}
                  value={form.shares}
                  onChange={(e) => setForm({ ...form, shares: e.target.value })}
                  disabled={isSubmitting}
                />
                {errors.shares && <span className="text-error text-sm mt-1">{errors.shares}</span>}
              </div>
            )}

            {/* Annual Interest Rate */}
            {!hideInterestRate && (
              <div className="form-control">
                {renderLabel('Annual Interest Rate (%)', false)}
                <input 
                  type="number"
                  step="any"
                  className={`input input-bordered w-full ${errors.annualInterestRate ? 'input-error' : ''}`}
                  value={form.annualInterestRate}
                  onChange={(e) => setForm({ ...form, annualInterestRate: e.target.value })}
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
                {errors.annualInterestRate && <span className="text-error text-sm mt-1">{errors.annualInterestRate}</span>}
              </div>
            )}

            {/* Notes */}
            <div className="form-control md:col-span-2">
              {renderLabel('Notes', false)}
              <textarea 
                className="textarea textarea-bordered w-full"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Add any additional notes here..."
                rows={3}
                disabled={isSubmitting}
              ></textarea>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-outline btn-primary"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving...
                </>
              ) : 'Save & Add Another'}
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving...
                </>
              ) : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
} 