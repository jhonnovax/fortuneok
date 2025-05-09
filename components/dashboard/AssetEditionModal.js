'use client';

import { useState, useEffect } from 'react';
import CurrencyInput from 'react-currency-input-field';
import SymbolCombobox from './SymbolCombobox';
import CurrencyCombobox from './CurrencyCombobox';

const CATEGORIES = [
  { value: 'real_estate', label: '🏠 Real Estate' },
  { value: 'certificates_of_deposit', label: '🏦 Certificates of deposit' },
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
  { value: 'other', label: '🔷 Other custom assets' }
];

const TRADEABLE_CATEGORIES = [
  'stocks', 'bonds', 'cryptocurrencies', 'etf_funds', 'option', 'futures'
];

const INITIAL_FORM_STATE = {
  date: '',
  category: '',
  description: '',
  symbol: '',
  purchaseInformation: {
    currency: '',
    price: ''
  },
  currentValuation: {
    currency: '',
    price: ''
  },
  shares: '',
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

const VALUABLE_CATEGORIES = [
  'real_estate',
  'certificates_of_deposit',
  'savings_account',
  'precious_metals',
  'cash',
  'other'
];

export default function AssetEditionModal({ isOpen, isSubmitting, submitError, asset, onClose, onSave }) {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.purchaseInformation.currency) newErrors.purchasePriceCurrency = 'Currency is required';
    if (!form.purchaseInformation.price) newErrors.purchasePrice = 'Price is required';
    
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
    
    if (form.purchasePrice && isNaN(Number(form.purchasePrice))) {
      newErrors.purchasePrice = 'Must be a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    onSave(form);
  };

  const showShares = TRADEABLE_CATEGORIES.includes(form.category);
  const showSymbol = TRADING_CATEGORIES.includes(form.category);
  const showDescription = !TRADING_CATEGORIES.includes(form.category);
  const showCurrentValuation = VALUABLE_CATEGORIES.includes(form.category);


  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM_STATE);
      setErrors({});
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

  // Set form values when asset is provided
  useEffect(() => {
    if (asset) {
      console.log('asset', asset);
      setForm(prevForm => ({
        ...prevForm,
        category: asset.category,
        description: asset.description,
        symbol: asset.symbol,
        /* date: asset.date, */
        currency: asset.currency,
        shares: asset.shares,
        pricePerUnit: asset.pricePerUnit,
        currentPrice: asset.currentPrice,
        notes: asset.notes
      }));
    }
  }, [asset]);

  // Helper function to render label with required asterisk
  const renderLabel = (text, required = true, srOnly = false) => (
    <label className={`label ${srOnly ? 'sr-only' : ''}`}>
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

        <h3 className="font-bold text-lg mb-6">Add Investment</h3>
        
        {submitError && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{submitError}</span>
          </div>
        )}
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="form-control md:col-span-2">
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
                <SymbolCombobox
                  value={form.symbol}
                  onChange={(value) => setForm({ ...form, symbol: value })}
                  type={form.category}
                  placeholder="Search for a symbol..."
                  error={errors.symbol}
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div className='divider md:col-span-2'>
              Purchase Information
            </div>

            {/* Purchase Price Currency */}
            <div className="form-control">
              {renderLabel('Currency')}
              <CurrencyCombobox
                value={form.purchaseInformation.currency}
                onChange={(value) => setForm({ ...form, purchaseInformation: { ...form.purchaseInformation, currency: value } })}
                error={errors.purchasePriceCurrency}
                disabled={isSubmitting}
              />
            </div>

            {/* Purchase Price */}
            <div className="form-control">
              {renderLabel('Purchase Price')}
              <CurrencyInput
                id="price-input"
                name="price"
                placeholder="$15.550"
                className={`input input-bordered w-full ${errors.purchasePrice ? 'input-error' : ''}`}
                value={form.purchaseInformation.price}
                decimalsLimit={2}
                onValueChange={(value) => setForm({ ...form, purchaseInformation: { ...form.purchaseInformation, price: value } })}
                disabled={isSubmitting}
                allowNegativeValue={false}
                decimalSeparator="."
                prefix="$"
              />
              {errors.purchasePrice && <span className="text-error text-sm mt-1">{errors.purchasePrice}</span>}
            </div>

            {showCurrentValuation && (
              <>
                <div className='divider md:col-span-2'>
                  Current Valuation
                </div>

              {/* Current Price Currency */}
              <div className="form-control">
                {renderLabel('Currency')}
                <CurrencyCombobox
                  value={form.currentValuation.currency}
                  onChange={(currency) => setForm({ ...form, currentValuation: { ...form.currentValuation, currency } })}
                  error={errors.currentPriceCurrency}
                  disabled={isSubmitting}
                />
                {errors.currentPriceCurrency && <span className="text-error text-sm mt-1">{errors.currentPriceCurrency}</span>}
              </div>

              {/* Current Price */}
              <div className="form-control">
                {renderLabel('Current Price')}
                <CurrencyInput
                  id="price-input"
                  name="price"
                  placeholder="$22,650"
                  className={`input input-bordered w-full ${errors.currentPrice ? 'input-error' : ''}`}
                  value={form.currentValuation.price}
                  decimalsLimit={2}
                  onValueChange={(value) => setForm({ ...form, currentValuation: { ...form.currentValuation, price: value } })}
                  disabled={isSubmitting}
                  allowNegativeValue={false}
                  decimalSeparator="."
                  prefix="$"
                />
                  {errors.currentPrice && <span className="text-error text-sm mt-1">{errors.currentPrice}</span>}
                </div>
              </>
            )}

            {/* Shares */}
            {showShares && (
                <>
                  <div className='divider md:col-span-2'>
                    Shares
                  </div>
                  <div className="form-control md:col-span-2">
                    {renderLabel('Shares', true, true)}
                    <CurrencyInput
                      id="shares-input"
                      name="shares"
                      placeholder="62.7345"
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
                </>
            )}

            <div className='divider md:col-span-2'>
              Notes
            </div>


            {/* Notes */}
            <div className="form-control md:col-span-2">
              {renderLabel('Notes', false, true)}
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
              className="btn btn-primary"
              onClick={handleSubmit}
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