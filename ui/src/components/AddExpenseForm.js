import React, { useState, useEffect } from 'react';
import { createExpense } from '../api';
import MemberSelect from './MemberSelect';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

/**
 * Form for adding a new expense to a group.
 * @param {string} groupId - The slug/ID of the current group.
 * @param {Array<Object>} members - Array of member objects [{ id: 'uuid', name: 'Name' }].
 * @param {function} onExpenseAdded - Callback to run after successful expense creation (e.g., to refresh data).
 */
function AddExpenseForm({ groupId, members, onExpenseAdded }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidById, setPaidById] = useState(''); // Stores member ID
  const [paidForIds, setPaidForIds] = useState([]); // Stores array of member IDs
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Set all members as paid_for by default when component mounts or members change
  useEffect(() => {
    if (members && members.length > 0) {
      setPaidForIds(members.map(m => m.id));
      // Optionally, set the first member as default 'paid by'
      if (!paidById) {
          setPaidById(members[0].id);
      }
    }
  }, [members]); // Re-run if members list changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.');
      setIsLoading(false);
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description for the expense.');
      setIsLoading(false);
      return;
    }
    if (!paidById) {
      setError('Please select who paid for the expense.');
      setIsLoading(false);
      return;
    }
    if (paidForIds.length === 0) {
      setError('Please select at least one person for whom the expense was paid.');
      setIsLoading(false);
      return;
    }

    const expenseData = {
      amount: parseFloat(amount), // Ensure amount is a number
      desc: description.trim(),
      group_slug: groupId,
      paid_by_id: paidById,
      paid_for_ids: paidForIds,
    };

    try {
      await createExpense(expenseData);
      setSuccessMessage('Expense added successfully!');
      // Clear the form after successful submission
      setAmount('');
      setDescription('');
      // Keep paidById and paidForIds as they were, or reset to defaults if preferred
      // setPaidById(members[0]?.id || '');
      // setPaidForIds(members.map(m => m.id));

      // Trigger data refresh in the parent component (GroupDetailsPage)
      if (onExpenseAdded) {
        onExpenseAdded();
      }
    } catch (err) {
      setError(err.message || 'Failed to add expense.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-expense-form">
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <ErrorMessage message={error} />}

      <label htmlFor="amount">Amount:</label>
      <input
        type="number"
        id="amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="e.g., 500"
        min="0.01"
        step="0.01"
        required
      />

      <label htmlFor="description">Description:</label>
      <input
        type="text"
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g., Lunch, Groceries"
        required
      />

      <MemberSelect
        label="Paid By"
        members={members}
        value={paidById}
        onChange={setPaidById}
        multiple={false}
        name="paidBy"
      />

      <MemberSelect
        label="Paid For"
        members={members}
        value={paidForIds}
        onChange={setPaidForIds}
        multiple={true}
        name="paidFor"
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? <LoadingSpinner /> : 'Add Expense'}
      </button>
    </form>
  );
}

export default AddExpenseForm;