import React from 'react';

/**
 * Reusable component for selecting members.
 * Can be used as a single select dropdown or multi-select checkboxes.
 * @param {Object[]} members - Array of member objects [{ id: 'uuid', name: 'Name' }]
 * @param {string} label - Label for the input field/group.
 * @param {string | string[]} value - The currently selected value(s) (member ID or array of IDs).
 * @param {function} onChange - Callback when selection changes (receives new value or array of values).
 * @param {boolean} multiple - If true, renders checkboxes; otherwise, a select dropdown.
 * @param {string} [name=""] - Optional name attribute for input elements.
 */
function MemberSelect({ members, label, value, onChange, multiple, name = "" }) {
  if (!members || members.length === 0) {
    return <p>No members available for selection.</p>;
  }

  const handleCheckboxChange = (e) => {
    const memberId = e.target.value;
    const isChecked = e.target.checked;
    let newSelection = Array.isArray(value) ? [...value] : [];

    if (isChecked) {
      newSelection.push(memberId);
    } else {
      newSelection = newSelection.filter(id => id !== memberId);
    }
    onChange(newSelection);
  };

  const handleSelectChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="member-select-container">
      <label>{label}:</label>
      {multiple ? (
        <div className="flex-container" style={{ marginBottom: '15px' }}>
          {members.map(member => (
            <div key={member.id} style={{ marginRight: '15px' }}>
              <input
                type="checkbox"
                id={`${name}-${member.id}`}
                name={name}
                value={member.id}
                checked={Array.isArray(value) && value.includes(member.id)}
                onChange={handleCheckboxChange}
              />
              <label htmlFor={`${name}-${member.id}`} style={{ display: 'inline', marginLeft: '5px', fontWeight: 'normal' }}>
                {member.name}
              </label>
            </div>
          ))}
        </div>
      ) : (
        <select value={value} onChange={handleSelectChange} id={name || label.toLowerCase().replace(/\s/g, '-')}>
          <option value="">-- Select --</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default MemberSelect;