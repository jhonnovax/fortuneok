'use client';

import { useEffect } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';
import InputSuggestionList from './InputSuggestionList';
import currencies from '@/public/currencies.json';
const currenciesSuggestionList = currencies.map(currency => ({
  ...currency,
  value: currency.code
}));

export default function CurrencySelection({ isEditingCurrency, onEditingCurrency }) {

  const { preferredCurrency, setPreferredCurrency } = usePreferences();
  const preferredCurrencyDetails = currencies.find(item => item.code === preferredCurrency);

  function handleCurrencyChange(newCurrency) {
    if (newCurrency) {
      setPreferredCurrency(newCurrency);
      onEditingCurrency(false);
    }
  }

  // Handle Escape key to close the currency combobox
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === 'Escape' && isEditingCurrency) {
        onEditingCurrency(false);
      }
    }

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isEditingCurrency, onEditingCurrency]);

  // Render editing currency combobox mode
  if (isEditingCurrency) {
    return (
      <>
        <InputSuggestionList
          autoFocus
          className="inline-flex w-full 2xl:w-[400px] items-center"
          placeholder="Select currency"
          suggestionList={currenciesSuggestionList}
          customInputValueRenderer={(selectedValue) => {
            const selectedSuggestion = currenciesSuggestionList.find(item => item.value === selectedValue);
            return selectedSuggestion
              ? `${selectedSuggestion.flag} ${selectedSuggestion.value} - ${selectedSuggestion.label}`
              : selectedValue;
          }}
          customSuggestionItemRenderer={(suggestion) => (
            <div className="w-full flex items-center gap-1 p-3 text-left" title={suggestion.label}>
              {/* Flag with border */}
              <div className="w-8 h-6 flex-shrink-0 overflow-hidden rounded flex items-center justify-center">
                <span className="text-xl">{suggestion.flag}</span>
              </div>
              {/* Currency code in pill */}
              <div className="text-sm pr-1 py-1 rounded">
                {suggestion.value}
              </div>
              {/* Currency name */}
              <span className="text-base-content text-ellipsis overflow-hidden whitespace-nowrap">{suggestion.label}</span>
            </div>
          )}
          onBlur={() => onEditingCurrency(false)}
          onChange={handleCurrencyChange}
        />
        <button 
          className="btn btn-default btn-sm lg:btn-md ml-2" 
          title="Go back"
          onClick={() => onEditingCurrency(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 1024 1024">
            <path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"/>
            <path fill="currentColor" d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"/>
          </svg>
        </button>
      </>
    );
  }

  // Render currency selection button
  return (
    <button 
      className="btn btn-sm lg:btn-md gap-1"
      title="Edit currency"
      onClick={() => onEditingCurrency(true)}
    >
      {preferredCurrencyDetails?.flag} {preferredCurrency}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4 duration-200"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );

}