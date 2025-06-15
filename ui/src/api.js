const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    // Check if the response has content before parsing JSON
    const text = await response.text();
    return text ? JSON.parse(text) : {};

  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Creates a new group.
 * @param {string} name - The name of the group.
 * @param {string[]} members - An array of member names.
 * @returns {Promise<Object>} - The created group object (should contain group_id/slug and member details).
 */
export const createGroup = (name, members) => {
  return apiRequest('/group', {
    method: 'POST',
    body: JSON.stringify({ name, members }),
  });
};

/**
 * Gets group details by slug. This is crucial for getting member IDs.
 * @param {string} slug - The unique slug of the group.
 * @returns {Promise<Object>} - The group details, including members and their IDs.
 */
export const getGroupDetails = (slug) => {
  return apiRequest(`/group/${slug}`);
};

/**
 * Creates a new expense.
 * @param {Object} expenseData - Expense details (amount, desc, group_slug, paid_by_id, paid_for_ids).
 * @returns {Promise<Object>} - The created expense object.
 */
export const createExpense = (expenseData) => {
  return apiRequest('/expense', {
    method: 'POST',
    body: JSON.stringify(expenseData),
  });
};

/**
 * Gets all expenses for a specific group.
 * @param {string} slug - The unique slug of the group.
 * @returns {Promise<Object[]>} - An array of expense objects.
 */
export const getExpensesByGroup = (slug) => {
  return apiRequest(`/expense/${slug}`);
};

/**
 * Gets the balances for a specific group.
 * @param {string} slug - The unique slug of the group.
 * @returns {Promise<Object[]>} - An array of balance objects (from, to, amount).
 */
export const getGroupBalances = (slug) => {
  return apiRequest(`/group/${slug}/balance`);
};

/**
 * Gets member details by group and member ID. (Potentially used for mapping, but we hope getGroupDetails provides this)
 * @param {string} groupID - The ID/slug of the group.
 * @param {string} memberID - The ID of the member.
 * @returns {Promise<Object>} - The member object.
 */
export const getMemberDetails = (groupID, memberID) => {
  return apiRequest(`/member/${groupID}/${memberID}`);
};