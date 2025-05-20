import { useState } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';
import CurrencyCombobox from './CurrencyCombobox';
import ClickOutside from './ClickOutside';

export default function CurrencySelection({ onEditingCurrency }) {

  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const { currency, setCurrency } = usePreferences();

  function handleEditingCurrency(value) {
    setIsEditingCurrency(value);
    onEditingCurrency(value);
  }

  function handleCurrencyChange(value) {
    if (value) {
      setCurrency(value);
      setIsEditingCurrency(false);
      onEditingCurrency(false);
    }
  }

  if (isEditingCurrency) {
    return (
      <ClickOutside className="inline-flex w-[300px] max-w-full items-center" onClick={() => handleEditingCurrency(false)}>
        <CurrencyCombobox
          autoFocus={true}
          value={currency}
          onChange={handleCurrencyChange}
        />
        <button 
          className="btn btn-default btn-sm border-base-content/20 ml-2" 
          title="Go back"
          onClick={() => handleEditingCurrency(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 1024 1024">
            <path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"/>
            <path fill="currentColor" d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"/>
          </svg>
        </button>
      </ClickOutside>
    );
  }

  return (
    <button 
      className="btn btn-default btn-sm gap-1 border-base-content/20"
      title="Edit currency"
      onClick={() => handleEditingCurrency(true)}
    >
      {currency}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4 duration-200 opacity-50"
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