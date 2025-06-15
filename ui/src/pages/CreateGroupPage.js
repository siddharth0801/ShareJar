import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../api';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

function CreateGroupPage() {
  const [groupName, setGroupName] = useState('');
  const [currentMemberName, setCurrentMemberName] = useState('');
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAddMember = (e) => {
    e.preventDefault();
    const trimmedName = currentMemberName.trim();
    if (trimmedName && !members.includes(trimmedName)) {
      setMembers([...members, trimmedName]);
      setCurrentMemberName('');
      setError(null);
    } else if (trimmedName === '') {
      setError('Member name cannot be empty.');
    } else if (members.includes(trimmedName)) {
      setError(`"${trimmedName}" is already added.`);
    }
  };

  const handleRemoveMember = (memberToRemove) => {
    setMembers(members.filter(member => member !== memberToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!groupName.trim()) {
      setError('Please provide a group name.');
      setIsLoading(false);
      return;
    }
    if (members.length === 0) {
      setError('Please add at least one member to the group.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await createGroup(groupName, members);
      console.log('Group created:', response);
      if (response && response.slug) {
        navigate(`/group/${response.slug}`);
      } else {
        setError('Group created successfully, but no slug was returned. Cannot navigate.');
      }
    } catch (err) {
      setError(err.message || 'Failed to create group.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>Create a New ShareJar Group</h1>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit}>
        <label htmlFor="groupName">Group Name:</label>
        <input
          type="text"
          id="groupName"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="e.g., Weekend Trip, Flat Rent"
          required
        />

        <label htmlFor="newMemberName">Add Members:</label>
        <div className="member-input-group">
          <input
            type="text"
            id="newMemberName"
            value={currentMemberName}
            onChange={(e) => setCurrentMemberName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddMember(e);
              }
            }}
            placeholder="e.g., Alice"
          />
          <button type="button" onClick={handleAddMember} className="button-secondary">
            Add
          </button>
        </div>

        {members.length > 0 && (
          <div className="members-list-container card">
            <h3>Added Members:</h3>
            <ul className="members-list">
              {members.map((member, index) => (
                <li key={index} className="member-item">
                  <span>{member}</span>
                  <button type="button" onClick={() => handleRemoveMember(member)} className="remove-member-btn button-danger">
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" disabled={isLoading} className="mt-l">
          {isLoading ? <LoadingSpinner /> : 'Create Group'}
        </button>
      </form>
    </div>
  );
}

export default CreateGroupPage;