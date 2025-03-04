'use client';

import { useState, useEffect } from 'react';
import { getInvestmentById, updateInvestment } from '../services/investmentService';

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

// Map API categories to UI categories
const REVERSE_CATEGORY_MAPPING = {
  'Stock': 'stocks',
  'Bond': 'bonds',
  'Crypto': 'cryptocurrencies',
  'ETF': 'etf_funds',
  'Real Estate': 'real_estate',
  'Cash': 'cash',
  'Other': 'other_custom_assets'
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

const TRADING_CATEGORIES = [
  'stocks', 'bonds', 'cryptocurrencies', 'etf_funds', 'option', 'futures'
];

const INITIAL_FORM_STATE = {
  category: '',
  description: '',
  symbol: '',
  annualInterestRate: ''
};

export default function EditAssetModal({ isOpen, onClose, onSave, investmentId }) {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch investment data when modal opens
  useEffect(() => {
    if (isOpen && investmentId) {
      fetchInvestmentData();
    }
  }, [isOpen, investmentId]);

  const fetchInvestmentData = async () => {
    try {
      setIsLoading(true);
      const investment = await getInvestmentById(investmentId);
      
      // Map API category to UI category
      const uiCategory = REVERSE_CATEGORY_MAPPING[investment.category] || 'other_custom_assets';
      
      setForm({
        category: uiCategory,
        description: investment.description || '',
        symbol: investment.symbol || '',
        annualInterestRate: investment.annualInterestRate ? investment.annualInterestRate.toString() : ''
      });
      
      setErrors({});
      setSubmitError(null);
    } catch (err) {
      console.error('Failed to fetch investment data:', err);
      setSubmitError('Failed to load investment data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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
    
    // Conditional required fields
    if (showDescription && !form.description) {
      newErrors.description = 'Description is required';
    }
    
    if (showSymbol && !form.symbol) {
      newErrors.symbol = 'Symbol is required';
    }
    
    // Number validation
    if (form.annualInterestRate && isNaN(Number(form.annualInterestRate))) {
      newErrors.annualInterestRate = 'Must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
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
      
      // Update the investment
      await updateInvestment(investmentId, investmentData);
      
      // Call the onSave callback with the form data
      if (onSave) {
        onSave(investmentData);
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error updating investment:', error);
      setSubmitError('Failed to update investment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          disabled={isSubmitting || isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="font-bold text-lg mb-6">Edit Investment</h3>
        
        {submitError && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{submitError}</span>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4">
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

              {/* Symbol (for tradeable assets) */}
              {showSymbol && (
                <div className="form-control">
                  {renderLabel('Symbol')}
                  <input 
                    type="text" 
                    className={`input input-bordered w-full ${errors.symbol ? 'input-error' : ''}`}
                    placeholder="e.g. AAPL, BTC, etc."
                    value={form.symbol}
                    onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                    disabled={isSubmitting}
                  />
                  {errors.symbol && <span className="text-error text-sm mt-1">{errors.symbol}</span>}
                </div>
              )}

              {/* Description (for non-tradeable assets) */}
              {showDescription && (
                <div className="form-control">
                  {renderLabel('Description')}
                  <input 
                    type="text" 
                    className={`input input-bordered w-full ${errors.description ? 'input-error' : ''}`}
                    placeholder="e.g. Apartment in New York, Gold bars, etc."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    disabled={isSubmitting}
                  />
                  {errors.description && <span className="text-error text-sm mt-1">{errors.description}</span>}
                </div>
              )}

              {/* Annual Interest Rate (for interest-bearing assets) */}
              {!hideInterestRate && (
                <div className="form-control">
                  {renderLabel('Annual Interest Rate (%)', false)}
                  <input 
                    type="text" 
                    className={`input input-bordered w-full ${errors.annualInterestRate ? 'input-error' : ''}`}
                    placeholder="e.g. 2.5"
                    value={form.annualInterestRate}
                    onChange={(e) => setForm({ ...form, annualInterestRate: e.target.value })}
                    disabled={isSubmitting}
                  />
                  {errors.annualInterestRate && <span className="text-error text-sm mt-1">{errors.annualInterestRate}</span>}
                </div>
              )}
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
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
} 