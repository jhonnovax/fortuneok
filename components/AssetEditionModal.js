'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import ButtonSignin from '@/components/ButtonSignin';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import currencies from '@/public/currencies.json';
import Flag from './Flag';
import { validateAssetData, TRADING_CATEGORIES } from '@/services/assetService';
import CategorySelect from './CategorySelect';
const currenciesSuggestionList = currencies.map(currency => ({
  ...currency,
  value: currency.code
}));

// Dynamic imports for heavy components
const CurrencyInput = dynamic(() => import('react-currency-input-field'), {
  ssr: false,
  loading: () => <div className="input input-bordered w-full animate-pulse bg-base-200 h-12"></div>
});

const InputStockSuggestions = dynamic(() => import('./InputStockSuggestions'), {
  ssr: false,
  loading: () => <div className="input input-bordered w-full animate-pulse bg-base-200 h-12"></div>
});

const InputSuggestionList = dynamic(() => import('./InputSuggestionList'), {
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
  brokerName: '',
  symbol: '',
  currentValuation: {
    currency: '',
    amount: ''
  },
  shares: '',
  notes: ''
};

export default function AssetEditionModal({ isOpen, isSubmitting, submitError, asset, onClose, onSave }) {
  const closeButtonRef = useRef(null);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const hasInteractedRef = useRef(false);

  const showShares = TRADEABLE_CATEGORIES.includes(form.category);
  const showCurrentValuation = !TRADING_CATEGORIES.includes(form.category);

  const { data: session } = useSession();

  const validateForm = () => {
    const newErrors = validateAssetData(form);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate a single field
  const validateField = (fieldName, formData) => {
    const isTradingCategory = TRADING_CATEGORIES.includes(formData.category);
    const fieldErrors = {};

    switch (fieldName) {
      case 'date':
        if (!formData.date) fieldErrors.date = 'Date is required';
        break;
      case 'category':
        if (!formData.category) fieldErrors.category = 'Category is required';
        break;
      case 'brokerName':
        if (isTradingCategory && !formData.brokerName) fieldErrors.brokerName = 'Broker name is required';
        break;
      case 'description':
        if (!isTradingCategory && !formData.description) fieldErrors.description = 'Description is required';
        break;
      case 'symbol':
        if (isTradingCategory && !formData.symbol) fieldErrors.symbol = 'Symbol is required';
        break;
      case 'shares':
        if (isTradingCategory && !formData.shares) {
          fieldErrors.shares = 'Shares is required';
        } else if (isTradingCategory && isNaN(Number(formData.shares))) {
          fieldErrors.shares = 'Enter a valid number';
        }
        break;
      case 'currentValuationCurrency':
        if (!isTradingCategory && !formData.currentValuation?.currency) {
          fieldErrors.currentValuationCurrency = 'Currency is required';
        }
        break;
      case 'currentValuation':
        if (!isTradingCategory && !formData.currentValuation?.amount) {
          fieldErrors.currentValuation = 'Amount is required';
        } else if (!isTradingCategory && isNaN(Number(formData.currentValuation?.amount))) {
          fieldErrors.currentValuation = 'Enter a valid number';
        }
        break;
    }

    return fieldErrors;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    onSave(form);
  };

  // Helper function to update form and trigger validation for specific field
  const updateForm = (updates, fieldName) => {
    hasInteractedRef.current = true;
    setForm(prevForm => {
      const newForm = { ...prevForm, ...updates };

      // Validate only the changed field
      if (fieldName && hasInteractedRef.current) {
        const fieldErrors = validateField(fieldName, newForm);
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };

          // Map field names to their error keys
          const fieldToErrorKey = {
            'date': 'date',
            'category': 'category',
            'brokerName': 'brokerName',
            'description': 'description',
            'symbol': 'symbol',
            'shares': 'shares',
            'currentValuationCurrency': 'currentValuationCurrency',
            'currentValuation': 'currentValuation'
          };

          const errorKey = fieldToErrorKey[fieldName];

          // Update or clear error for the validated field
          if (errorKey) {
            if (fieldErrors[errorKey]) {
              // Set error if validation failed
              newErrors[errorKey] = fieldErrors[errorKey];
            } else {
              // Clear error if field is now valid
              delete newErrors[errorKey];
            }
          }

          // If category changed, clear errors for fields that are no longer relevant
          if (fieldName === 'category') {
            const isTradingCategory = TRADING_CATEGORIES.includes(newForm.category);
            if (isTradingCategory) {
              // Clear non-trading category errors
              delete newErrors.description;
              delete newErrors.currentValuationCurrency;
              delete newErrors.currentValuation;
            } else {
              // Clear trading category errors
              delete newErrors.brokerName;
              delete newErrors.symbol;
              delete newErrors.shares;
            }
          }

          return newErrors;
        });
      }

      return newForm;
    });
  };

  // Reset and populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      hasInteractedRef.current = false;
      closeButtonRef.current?.focus();

      if (asset) {
        setForm({
          ...INITIAL_FORM_STATE,
          id: asset.id,
          date: asset.date?.toISOString?.()?.split('T')?.[0] || '',
          category: asset.category,
          description: asset.description,
          brokerName: asset.brokerName,
          symbol: asset.symbol,
          shares: asset.shares,
          currentValuation: asset.currentValuation,
          notes: asset.notes
        });
      } else {
        setForm(INITIAL_FORM_STATE);
      }
    }
  }, [isOpen, asset]);

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

  // Helper function to render label with required asterisk
  const renderLabel = (text, required = true, error = false) => (
    <label className="label pt-0">
      <span className={`label-text ${error ? 'text-error' : ''}`}>
        {text} {error && <span className="text-error"> is required</span>} {required && <span className="text-error">*</span>}
      </span>
    </label>
  );

  return (
    createPortal(
      <dialog
        className={`modal modal-bottom sm:modal-middle ${isOpen ? 'modal-open' : ''}`}
      >
        <div
          className={`modal-box relative p-0 flex flex-col h-full max-h-screen rounded-tl-none rounded-tr-none sm:rounded-tl-xl sm:rounded-tr-xl sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:transition-all sm:duration-300 ${isOpen ? 'sm:animate-scale-in sm:opacity-100' : 'sm:opacity-0 sm:scale-95'
            }`}
        >

          <div className="flex justify-center items-center border-b border-base-content/20 p-4">
            {/* Heading */}
            <h3 className="font-bold text-lg">{form.id ? 'Edit Asset' : 'Add Asset'}</h3>

            {/* Close button */}
            <button
              ref={closeButtonRef}
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

          <form className="flex-1 overflow-y-auto" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
                {renderLabel('Date of investment', true, errors.date)}
                <input
                  type="date"
                  className={`input input-bordered w-full ${errors.date ? 'input-error' : ''}`}
                  value={form.date}
                  onChange={(e) => updateForm({ date: e.target.value }, 'date')}
                  onClick={(e) => {
                    if (e.target.showPicker) {
                      e.target.showPicker();
                    }
                  }}
                  disabled={isSubmitting}
                />
              </div>

              {/* Category */}
              <div className="form-control">
                {renderLabel('Category', true, errors.category)}
                <CategorySelect
                  value={form.category}
                  onChange={(value) => updateForm({ category: value }, 'category')}
                  disabled={isSubmitting}
                  error={errors.category}
                  placeholder="Select category"
                />
              </div>

              {/* Description or Broker name based on category */}
              {
                TRADING_CATEGORIES.includes(form.category) ? (
                  <div className="form-control">
                    {renderLabel('Broker Name', true, errors.brokerName)}
                    <input
                      type="text"
                      className={`input input-bordered w-full ${errors.brokerName ? 'input-error' : ''}`}
                      value={form.brokerName}
                      onChange={(e) => updateForm({ brokerName: e.target.value }, 'brokerName')}
                      placeholder="Enter broker name"
                      disabled={isSubmitting}
                    />
                  </div>
                ) : (
                  <div className="form-control">
                    {renderLabel('Description', true, errors.description)}
                    <input
                      type="text"
                      className={`input input-bordered w-full ${errors.description ? 'input-error' : ''}`}
                      value={form.description}
                      onChange={(e) => updateForm({ description: e.target.value }, 'description')}
                      placeholder={(() => {
                        switch (form.category) {
                          case 'real_estate':
                            return 'e.g. Apartment 10th Ave in New York';
                          case 'cars':
                            return 'e.g. Tesla Model 3';
                          case 'precious_metals':
                            return 'e.g. Gold Bar';
                          case 'other':
                            return 'e.g. Vintage Guitar';
                          case 'certificates_of_deposit':
                          case 'savings_account':
                          case 'checking_account':
                          case 'cash':
                            return 'e.g. Chase Bank Account';
                          case 'p2p_loans':
                            return 'e.g. Mintos Loan';
                          default:
                            return 'Enter asset description';
                        }
                      })()}
                      disabled={isSubmitting}
                    />
                  </div>
                )
              }

              {showCurrentValuation && (
                <>
                  {/* Purchase Price Currency */}
                  <div className="form-control">
                    {renderLabel('Currency', true, errors.currentValuationCurrency)}
                    <InputSuggestionList
                      disabled={isSubmitting}
                      error={errors.currentValuationCurrency}
                      placeholder="Select currency"
                      suggestionList={currenciesSuggestionList}
                      value={form.currentValuation?.currency}
                      customInputValueRenderer={(selectedValue) => {
                        const selectedSuggestion = currenciesSuggestionList.find(item => item.value === selectedValue);
                        return selectedSuggestion
                          ? `${selectedSuggestion.value} - ${selectedSuggestion.label}`
                          : selectedValue;
                      }}
                      customSuggestionItemRenderer={(suggestion) => (
                        <div className="w-full flex items-center gap-1 p-3 text-left" title={suggestion.label}>
                          {/* Flag with border */}
                          <div className="w-8 h-6 flex-shrink-0 overflow-hidden rounded flex items-center justify-center">
                            <Flag countryCode={suggestion.flag} size="lg" />
                          </div>
                          {/* Currency code in pill */}
                          <div className="text-sm pr-1 py-1 rounded">
                            {suggestion.value}
                          </div>
                          {/* Currency name */}
                          <span className="text-base-content text-ellipsis overflow-hidden whitespace-nowrap">{suggestion.label}</span>
                        </div>
                      )}
                      onSelect={(value) => updateForm({ currentValuation: { ...form.currentValuation, currency: value } }, 'currentValuationCurrency')}
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
                      onValueChange={(value) => updateForm({ currentValuation: { ...form.currentValuation, amount: value } }, 'currentValuation')}
                      disabled={isSubmitting}
                      allowNegativeValue={false}
                      decimalSeparator="."
                      prefix="$"
                    />
                  </div>
                </>
              )}

              {/* Symbol and Shares */}
              {showShares && (
                <>
                  <div className="form-control">
                    {renderLabel('Symbol', true, errors.symbol)}
                    <InputStockSuggestions
                      disabled={isSubmitting}
                      error={errors.symbol}
                      placeholder="Select symbol"
                      type={form.category}
                      value={form.symbol}
                      onSelect={(value) => updateForm({ symbol: value }, 'symbol')}
                    />
                  </div>
                  <div className="form-control">
                    {renderLabel('Shares', true, errors.shares)}
                    <CurrencyInput
                      id="shares-input"
                      name="shares"
                      placeholder="62.7345"
                      className={`input input-bordered w-full ${errors.shares ? 'input-error' : ''}`}
                      value={form.shares}
                      decimalsLimit={6}
                      onValueChange={(value) => updateForm({ shares: value }, 'shares')}
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
                  onChange={(e) => updateForm({ notes: e.target.value })}
                  placeholder="Add additional notes"
                  rows={3}
                  disabled={isSubmitting}
                ></textarea>
              </div>

              {/* button hidden to trigger the submit */}
              <button type="submit" className="hidden"></button>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="mt-auto flex justify-end gap-2 p-4 border-t border-base-content/20">
            <button
              type="button"
              className="btn btn-tertiary transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            {session
              ? <button
                type="button"
                className="btn btn-primary transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
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
      , document.body
    )
  );
} 