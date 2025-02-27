'use client';

import { useState, useEffect } from 'react';

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

const INTEREST_RATE_CATEGORIES = [
  'real_estate', 'savings_account', 'p2p_loans'
];

const SYMBOL_CATEGORIES = [
  'stocks', 
  'bonds', 
  'cryptocurrencies', 
  'etf_funds', 
  'option', 
  'futures'
];

const DESCRIPTION_CATEGORIES = [
  'real_estate',
  'savings_account',
  'precious_metals',
  'cash',
  'p2p_loans',
  'other_custom_assets'
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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM_STATE);
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.description) newErrors.description = 'Description is required';
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.operation) newErrors.operation = 'Operation is required';
    if (!form.symbol) newErrors.symbol = 'Symbol is required';
    if (!form.shares) newErrors.shares = 'Shares is required';
    if (!form.currency) newErrors.currency = 'Currency is required';
    if (!form.price) newErrors.price = 'Price is required';
    
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

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(form);
      onClose();
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
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-6">Add Transaction</h3>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="form-control">
              {renderLabel('Category')}
              <select 
                className={`select select-bordered w-full ${errors.category ? 'select-error' : ''}`}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
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
              >
                <option value="">Select...</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
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
                />
                {errors.shares && <span className="text-error text-sm mt-1">{errors.shares}</span>}
              </div>
            )}

            {/* Annual Interest Rate (shown for non-trading categories) */}
            {!hideInterestRate && (
              <div className="form-control">
                {renderLabel('Annual Interest Rate (%)')}
                <input 
                  type="number"
                  step="any"
                  className={`input input-bordered w-full ${errors.annualInterestRate ? 'input-error' : ''}`}
                  value={form.annualInterestRate}
                  onChange={(e) => setForm({ ...form, annualInterestRate: e.target.value })}
                />
                {errors.annualInterestRate && <span className="text-error text-sm mt-1">{errors.annualInterestRate}</span>}
              </div>
            )}
          </div>

          {/* Notes - Full width */}
          <div className="form-control">
            {renderLabel('Notes', false)}
            <textarea 
              className="textarea textarea-bordered h-24"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            ></textarea>
          </div>
        </form>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>
    </dialog>
  );
} 