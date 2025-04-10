/**
 * Investment Service
 * Handles all API calls related to investments and their transactions
 */

// Get all investments for the current user
export const getInvestments = async () => {
  try {
    const response = await fetch('/api/investments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch investments');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching investments:', error);
    throw error;
  }
};

// Get a specific investment by ID
export const getInvestmentById = async (id) => {
  try {
    const response = await fetch(`/api/investments/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch investment');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching investment ${id}:`, error);
    throw error;
  }
};

// Create a new investment
export const createInvestment = async (investmentData) => {
  try {
    const response = await fetch('/api/investments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(investmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create investment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating investment:', error);
    throw error;
  }
};

// Update an existing investment
export const updateInvestment = async (id, investmentData) => {
  try {
    const response = await fetch(`/api/investments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(investmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update investment');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating investment ${id}:`, error);
    throw error;
  }
};

// Delete an investment
export const deleteInvestment = async (id) => {
  try {
    const response = await fetch(`/api/investments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete investment');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error deleting investment ${id}:`, error);
    throw error;
  }
};