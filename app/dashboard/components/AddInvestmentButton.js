'use client';

import React from 'react';

export default function AddInvestmentButton({ onClick }) {
  return (
    <button 
      className="btn btn-primary flex items-center gap-2"
      onClick={onClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      <span className="hidden md:block">Add Investment</span>
    </button>
  );
} 