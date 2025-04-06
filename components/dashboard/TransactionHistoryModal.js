'use client';

import { useState, useEffect } from 'react';
import { getTransactions, deleteTransaction } from '../../services/investmentService';
import EditTransactionModal from './EditTransactionModal';

export default function TransactionHistoryModal({ isOpen, onClose, investmentId, investmentName, investmentType }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, transactionId: null });
  const [editModal, setEditModal] = useState({ 
    isOpen: false, 
    transaction: null 
  });

  useEffect(() => {
    if (isOpen && investmentId) {
      fetchTransactions();
    }

    // Add event listener for escape key
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);

    // Cleanup event listener
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, investmentId, onClose]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions(investmentId);
      // Sort transactions by date (newest first)
      const sortedTransactions = data.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setTransactions(sortedTransactions);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteConfirmation.transactionId) return;
    
    try {
      await deleteTransaction(investmentId, deleteConfirmation.transactionId);
      // Refresh the transactions list
      fetchTransactions();
      // Close the confirmation dialog
      setDeleteConfirmation({ isOpen: false, transactionId: null });
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      setError('Failed to delete transaction. Please try again later.');
    }
  };
  
  const handleEditTransaction = () => {
    // Refresh the transactions list
    fetchTransactions();
    // Close the edit modal
    setEditModal({ isOpen: false, transaction: null });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box max-w-4xl">
        <button 
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="font-bold text-lg mb-4">Transaction History: {investmentName}</h3>
        
        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-500">No transactions found for this investment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Operation</th>
                  <th>Shares</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const total = transaction.shares 
                    ? transaction.shares * transaction.pricePerUnit 
                    : transaction.pricePerUnit;
                  
                  return (
                    <tr key={transaction._id}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>
                        <span className={`badge ${transaction.operation === 'buy' ? 'badge-success' : 'badge-error'}`}>
                          {transaction.operation === 'buy' ? 'Buy' : 'Sell'}
                        </span>
                      </td>
                      <td>{transaction.shares || '-'}</td>
                      <td>{formatCurrency(transaction.pricePerUnit, transaction.currency)}</td>
                      <td>{formatCurrency(total, transaction.currency)}</td>
                      <td className="flex gap-2">
                        {/* Edit Button with Icon and Tooltip */}
                        <div className="tooltip tooltip-left" data-tip="Edit Transaction">
                          <button 
                            className="btn btn-ghost btn-xs"
                            onClick={() => setEditModal({ 
                              isOpen: true, 
                              transaction: transaction 
                            })}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Delete Button with Icon and Tooltip */}
                        <div className="tooltip tooltip-left" data-tip="Delete Transaction">
                          <button 
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => setDeleteConfirmation({ 
                              isOpen: true, 
                              transactionId: transaction.id 
                            })}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button 
            className="btn btn-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
      
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </form>

      {/* Delete Confirmation Dialog */}
      <dialog className={`modal ${deleteConfirmation.isOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete Transaction</h3>
          <p className="py-4">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>
          <div className="modal-action">
            <button 
              className="btn btn-ghost" 
              onClick={() => setDeleteConfirmation({ isOpen: false, transactionId: null })}
            >
              Cancel
            </button>
            <button 
              className="btn btn-error" 
              onClick={handleDeleteTransaction}
            >
              Delete
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={() => setDeleteConfirmation({ isOpen: false, transactionId: null })}>
          <button>close</button>
        </form>
      </dialog>
      
      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, transaction: null })}
        onSave={handleEditTransaction}
        investmentId={investmentId}
        transaction={editModal.transaction}
        investmentType={investmentType}
      />
    </dialog>
  );
} 