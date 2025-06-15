import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useGroupData from '../hooks/useGroupData';
import AddExpenseForm from '../components/AddExpenseForm';
import ExpensesList from '../components/ExpensesList';
import BalanceSummary from '../components/BalanceSummary';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function GroupDetailsPage() {
  const { slug } = useParams();
  const {
    group,
    members,
    expenses,
    balances,
    isLoading,
    error,
    refreshGroupData,
  } = useGroupData(slug);

  if (isLoading) {
    return (
      <div className="card text-center" style={{ padding: '50px' }}>
        <LoadingSpinner />
        <p>Loading group data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center">
        <ErrorMessage message={error} />
        <p>
          Please ensure the group slug "<strong>{slug}</strong>" is valid.
        </p>
        <Link to="/" className="back-link mt-l">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
          Go back to create a new group
        </Link>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="card text-center">
        <ErrorMessage message="Group not found or an unexpected error occurred." />
        <Link to="/" className="back-link mt-l">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
          Go back to create a new group
        </Link>
      </div>
    );
  }

  return (
    <div className="group-details-page">
      <Link to="/" className="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
        Back to Create New Group
      </Link>
      <h1>{group.Name || 'Group Details'}</h1> {/* Use group.Name based on your API */}

      <div className="group-details-grid"> {/* Grid container for sections */}
        <div className="card">
          <h2>Add New Expense</h2>
          {members.length > 0 ? (
            <AddExpenseForm
              groupId={slug}
              members={members}
              onExpenseAdded={refreshGroupData}
            />
          ) : (
            <ErrorMessage message="No members found for this group. Cannot add expenses." />
          )}
        </div>

        <div className="card">
          <h2>Balances</h2>
          {balances.length > 0 ? (
            <BalanceSummary balances={balances} members={members} />
          ) : (
            <p className="text-center">No balances to display. Add some expenses!</p>
          )}
        </div>

        <div className="card">
          <h2>Expenses</h2>
          {expenses.length > 0 ? (
            <ExpensesList expenses={expenses} members={members} />
          ) : (
            <p className="text-center">No expenses added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupDetailsPage;