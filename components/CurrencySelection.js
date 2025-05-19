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
      <ClickOutside className="inline-block w-[300px] max-w-full" onClick={() => handleEditingCurrency(false)}>
        <CurrencyCombobox
          autoFocus={true}
          value={currency}
          onChange={handleCurrencyChange}
        />
      </ClickOutside>
    );
  }

  return (
    <button 
      className="btn btn-default btn-sm"
      title="Edit currency"
      onClick={() => handleEditingCurrency(true)}
    >
      {currency}
    </button>
  );

}