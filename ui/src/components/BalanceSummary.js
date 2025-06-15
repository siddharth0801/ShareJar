import React from 'react';

function BalanceSummary({ balances, members }) { // Added members prop for potential future use
  if (!balances || balances.length === 0) {
    return <p className="text-center">Everyone is settled up, or no expenses have been added yet!</p>;
  }

  // Create a map for quick lookup of member names by their ID (if balances only provide IDs)
  // Assuming balances already provide names (as per previous API examples), this might not be strictly needed for display
  const memberMap = members.reduce((map, member) => {
    map[member.id] = member.name;
    return map;
  }, {});
  const getMemberName = (id) => memberMap[id] || `Unknown Member (${id.substring(0, 7)}...)`;

  return (
    <div className="balance-summary">
      {balances.map((balance, index) => (
        <p key={index} className="balance-item">
          <strong>{balance.from}</strong>
          <span className="balance-arrow"> &rarr; </span> {/* Arrow for visual flow */}
          <strong>{balance.to}</strong>
          <span className="amount">₹{balance.amount.toFixed(2)}</span>
        </p>
      ))}
    </div>
  );
}

export default BalanceSummary;