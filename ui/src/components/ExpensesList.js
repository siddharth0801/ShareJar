import React from 'react';

function ExpensesList({ expenses, members }) {
  if (!expenses || expenses.length === 0) {
    return <p className="text-center">No expenses to display yet. Add some above!</p>;
  }

  const memberMap = members.reduce((map, member) => {
    map[member.id] = member.name;
    return map;
  }, {});

  const getMemberName = (id) => memberMap[id] || `Unknown Member (${id.substring(0, 7)}...)`; // Shorten UUID for unknown

  return (
    <div className="expenses-list">
      {expenses.map((expense) => (
        <div key={expense.ID} className="expense-item">
          <h3>{expense.Desc}</h3>
          <p>
            <strong>Paid By:</strong> {getMemberName(expense.PaidByID)}
          </p>
          <p>
            <strong>Paid For:</strong>{' '}
            {expense.Splits && expense.Splits.length > 0 ? (
              expense.Splits.map((split) => getMemberName(split.MemberID)).join(', ')
            ) : (
              'No one specified'
            )}
          </p>
          <p className="expense-amount">
            <strong>Amount:</strong> ₹{expense.Amount.toFixed(2)}
          </p>
          <p className="expense-date">
            <small>Added on: {new Date(expense.CreatedAt).toLocaleDateString()}</small>
          </p>
        </div>
      ))}
    </div>
  );
}

export default ExpensesList;