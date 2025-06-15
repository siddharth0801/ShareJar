import { useState, useEffect, useCallback } from 'react';
import { getGroupDetails, getExpensesByGroup, getGroupBalances, getMemberDetails } from '../api';

/**
 * Custom hook to fetch and manage all data for a specific group.
 * @param {string} groupSlug - The unique slug of the group.
 * @returns {Object} An object containing group data, loading states, and error states.
 */
function useGroupData(groupSlug) {
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]); // Array of { id: string, name: string }
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);

  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false); // Can load separately
  const [isLoadingBalances, setIsLoadingBalances] = useState(false); // Can load separately

  const [errorGroup, setErrorGroup] = useState(null);
  const [errorExpenses, setErrorExpenses] = useState(null);
  const [errorBalances, setErrorBalances] = useState(null);

  // --- Data Fetching Functions ---

  const fetchGroupAndMembers = useCallback(async () => {
    if (!groupSlug) return;
    setIsLoadingGroup(true);
    setErrorGroup(null);
    try {
      const groupData = await getGroupDetails(groupSlug);
      setGroup(groupData);

      // Assuming groupData contains a 'members' array with { ID: "uuid", Name: "string" }
      // If not, we might need an extra API call per member using getMemberDetails
      // For now, let's assume the groupDetails response directly provides member IDs and names.
      // Adjust this based on your actual /group/:slug API response structure.
      // Example structure expected: { slug: "...", name: "...", members: [{ID: "uuid1", Name: "Alice"}, {ID: "uuid2", Name: "Bob"}] }
      if (groupData && groupData.members && Array.isArray(groupData.members)) {
        setMembers(groupData.members.map(m => ({ id: m.ID, name: m.Name })));
      } else {
        // Fallback: If groupData.members is not available, we might need to fetch individual members
        // This scenario is less efficient but ensures robust behavior.
        // For simplicity, we'll assume groupData.members is provided and log a warning if not.
        console.warn("Group details response did not contain a 'members' array with ID and Name. Adjust useGroupData hook if your API differs.");
        setMembers([]); // Initialize empty if not found
      }

    } catch (err) {
      setErrorGroup(err.message || 'Failed to load group details or members.');
      setGroup(null);
      setMembers([]);
    } finally {
      setIsLoadingGroup(false);
    }
  }, [groupSlug]);

  const fetchExpenses = useCallback(async () => {
    if (!groupSlug) return;
    setIsLoadingExpenses(true);
    setErrorExpenses(null);
    try {
      const expensesData = await getExpensesByGroup(groupSlug);
      setExpenses(expensesData);
    } catch (err) {
      setErrorExpenses(err.message || 'Failed to load expenses.');
      setExpenses([]);
    } finally {
      setIsLoadingExpenses(false);
    }
  }, [groupSlug]);

  const fetchBalances = useCallback(async () => {
    if (!groupSlug) return;
    setIsLoadingBalances(true);
    setErrorBalances(null);
    try {
      const balancesData = await getGroupBalances(groupSlug);
      setBalances(balancesData);
    } catch (err) {
      setErrorBalances(err.message || 'Failed to load balances.');
      setBalances([]);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [groupSlug]);

  // --- Initial Data Load ---
  useEffect(() => {
    fetchGroupAndMembers();
    fetchExpenses();
    fetchBalances();
  }, [groupSlug, fetchGroupAndMembers, fetchExpenses, fetchBalances]);

  // --- Refresh Function ---
  // This function can be passed down to child components (e.g., AddExpenseForm)
  // to trigger a re-fetch of expenses and balances after an action.
  const refreshGroupData = useCallback(() => {
    fetchExpenses();
    fetchBalances();
  }, [fetchExpenses, fetchBalances]);

  return {
    group,
    members,
    expenses,
    balances,
    isLoading: isLoadingGroup || isLoadingExpenses || isLoadingBalances, // General loading state
    isLoadingGroup,
    isLoadingExpenses,
    isLoadingBalances,
    error: errorGroup || errorExpenses || errorBalances, // General error state
    errorGroup,
    errorExpenses,
    errorBalances,
    refreshGroupData,
  };
}

export default useGroupData;