'use client';

import { useState, useEffect } from 'react';
import { ASSET_CATEGORIES } from '@/services/assetService';
import { useSession } from 'next-auth/react';
import ButtonSignin from '@/components/ButtonSignin';
import dynamic from 'next/dynamic';

// Dynamic imports for heavy components
const CurrencyInput = dynamic(() => import('react-currency-input-field'), {
  ssr: false,
  loading: () => <div className="input input-bordered w-full animate-pulse bg-base-200 h-12"></div>
});

const SymbolCombobox = dynamic(() => import('./SymbolCombobox'), {
  ssr: false,
  loading: () => <div className="input input-bordered w-full animate-pulse bg-base-200 h-12"></div>
});

const CurrencyCombobox = dynamic(() => import('./CurrencyCombobox'), {
  ssr: false,
  loading: () => <div className="input input-bordered w-full animate-pulse bg-base-200 h-12"></div>
});

const TRADEABLE_CATEGORIES = [
  'stocks', 'bonds', 'cryptocurrencies', 'etf_funds', 'option', 'futures'
];

const DEPOSIT_CATEGORIES = [
  'certificates_of_deposit', 'savings_account', 'cash'
];

const INITIAL_FORM_STATE = {
  date: '',
  category: '',
  description: '',
  symbol: '',
  currentValuation: {
    currency: '',
    amount: ''
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

export default function AssetEditionModal({ isOpen, isSubmitting, submitError, asset, onClose, onSave }) {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  const showShares = TRADEABLE_CATEGORIES.includes(form.category);
  const showSymbol = TRADING_CATEGORIES.includes(form.category);
  const showDescription = !TRADING_CATEGORIES.includes(form.category);
  const showCurrentValuation = !TRADING_CATEGORIES.includes(form.category);

  const { data: session } = useSession();

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.description) newErrors.description = 'Description is required';
    if (showSymbol && !form.symbol) newErrors.symbol = 'Symbol is required';
    if (showShares && !form.shares) newErrors.shares = 'Shares is required';
    if (showCurrentValuation && !form.currentValuation?.currency) newErrors.currentValuationCurrency = 'Currency is required';
    if (showCurrentValuation && !form.currentValuation?.amount) newErrors.currentValuation = 'Amount is required';
    
    if (showShares && isNaN(Number(form.shares))) {
      newErrors.shares = 'Enter a valid number';
    }
    
    if (showCurrentValuation && isNaN(Number(form.currentValuation.amount))) {
      newErrors.currentValuation = 'Enter a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    onSave(form);
  };


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
      setForm(prevForm => ({
        ...prevForm,
        id: asset.id,
        date: asset.date?.toISOString?.()?.split('T')?.[0] || '',
        category: asset.category,
        description: asset.description,
        symbol: asset.symbol,
        shares: asset.shares,
        currentValuation: asset.currentValuation,
        notes: asset.notes
      }));
    }
  }, [asset]);

  // Helper function to render label with required asterisk
  const renderLabel = (text, required = true, error = false) => (
    <label className="label pt-0">
      <span className={`label-text ${error ? 'text-error' : ''}`}>
        {text} {error && <span className="text-error"> is required</span>} {required && <span className="text-error">*</span>}
      </span>
    </label>
  );

  return (
    <dialog className={`modal modal-bottom sm:modal-middle ${isOpen ? 'modal-open' : 'hidden'}`}>
      <div className="modal-box relative p-0 flex flex-col sm:max-w-2xl">

        <div className="flex justify-center items-center border-b border-base-content/20 p-4">
          {/* Heading */}
          <h3 className="font-bold text-lg">{form.id ? 'Edit Asset' : 'Add Asset'}</h3>
          
          {/* Close button */}
          <button 
            className="btn btn-sm btn-tertiary btn-circle ml-auto"
            onClick={onClose}
            disabled={isSubmitting}
            title="Close Modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="flex-1 overflow-y-auto" onSubmit={(e) => e.preventDefault()}>
            {/* Error message */}
            {submitError && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{submitError}</span>
              </div>
            )}
            
            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {/* Date */}
              <div className="form-control md:col-span-2">
                {renderLabel('Date', true, errors.date)}
                <input 
                  type="date"
                  className={`input input-bordered w-full ${errors.date ? 'input-error' : ''}`}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              {/* Category */}
              <div className="form-control">
                {renderLabel('Category', true, errors.category)}
                <select 
                  className={`select select-bordered w-full ${errors.category ? 'select-error' : ''}`}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Select category"
                  disabled={isSubmitting}
                >
                  <option disabled value="">Select category</option>
                  {ASSET_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Description or Symbol based on category */}
              {showDescription ? (
                <div className="form-control">
                  {renderLabel('Description', true, errors.description)}
                  <input 
                    type="text"
                    className={`input input-bordered w-full ${errors.description ? 'input-error' : ''}`}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Enter asset description"
                    disabled={isSubmitting}
                  />
                </div>
              ) : (
                <div className="form-control">
                  {renderLabel('Symbol', true, errors.symbol)}
                  <SymbolCombobox
                    value={form.symbol}
                    onChange={(selection) => setForm({ ...form, symbol: selection.symbol, description: selection.description })}
                    type={form.category}
                    placeholder="Search for a symbol"
                    error={errors.symbol}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {showCurrentValuation && (
                <>
                  {/* Purchase Price Currency */}
                  <div className="form-control">
                    {renderLabel('Currency', true, errors.currentValuationCurrency)}
                    <CurrencyCombobox
                      value={form.currentValuation?.currency}
                      onChange={(value) => setForm({ ...form, currentValuation: { ...form.currentValuation, currency: value } })}
                      error={errors.currentValuationCurrency}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Purchase Price */}
                  <div className="form-control">
                    {renderLabel(DEPOSIT_CATEGORIES.includes(form.category) ? 'Deposit Amount' : 'Valuation Price', true, errors.currentValuation)}
                    <CurrencyInput
                      id="price-input"
                      name="price"
                      placeholder="$15.550"
                      className={`input input-bordered w-full ${errors.currentValuation ? 'input-error' : ''}`}
                      value={form.currentValuation?.amount}
                      decimalsLimit={2}
                      onValueChange={(value) => setForm({ ...form, currentValuation: { ...form.currentValuation, amount: value } })}
                      disabled={isSubmitting}
                      allowNegativeValue={false}
                      decimalSeparator="."
                      prefix="$"
                    />
                  </div>
                </>
              )}

              {/* Shares */}
              {showShares && (
                  <>
                    <div className="form-control md:col-span-2">
                      {renderLabel('Shares', true, errors.shares)}
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
                    </div>
                  </>
              )}

              {/* Notes */}
              <div className="form-control md:col-span-2">
                {renderLabel('Notes', false, false)}
                <textarea 
                  className="textarea textarea-bordered w-full textarea-lg"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Add additional notes"
                  rows={3}
                  disabled={isSubmitting}
                ></textarea>
              </div>
            </div>   
        </form>

        {/* Action Buttons */}
        <div className="mt-auto flex justify-end gap-4 p-4 border-t border-base-content/20">
          <button 
            type="button" 
            className="btn btn-tertiary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          {session 
            ? <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    {form.id ? 'Updating...' : 'Adding...'}
                  </>
                ) : form.id ? 'Update' : 'Add'}
              </button>
            : <ButtonSignin extraStyle="btn-primary" />
          }
        </div>

      </div>

    </dialog>
  );
} 