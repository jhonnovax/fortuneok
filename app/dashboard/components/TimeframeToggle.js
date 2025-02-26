'use client';

export default function TimeframeToggle({ selected, onSelect }) {
  const timeframes = [
    { label: '1M', value: '1month' },
    { label: '3M', value: '3months' },
    { label: '6M', value: '6months' },
    { label: '1Y', value: '1year' },
    { label: 'ALL', value: 'all' },
  ];

  return (
    <div className="bg-base-200 dark:bg-base-300 p-1 rounded-full flex flex-wrap justify-center sm:flex-nowrap">
      {timeframes.map((timeframe) => (
        <button
          key={timeframe.value}
          className={`px-3 sm:px-6 py-2 rounded-full transition-all text-sm sm:text-base ${
            selected === timeframe.value 
              ? 'bg-primary text-primary-content font-medium' 
              : 'text-base-content hover:bg-base-300 dark:hover:bg-base-200'
          }`}
          onClick={() => onSelect(timeframe.value)}
        >
          {timeframe.label}
        </button>
      ))}
    </div>
  );
} 