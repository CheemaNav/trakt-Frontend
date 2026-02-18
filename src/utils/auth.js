/**
 * Get the Authorization header with Bearer token
 * Handles cases where token might already have "Bearer " prefix
 * @returns {Object} Header object with Authorization
 */
export const getAuthHeader = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return {};
    }

    // Remove "Bearer " if it exists to avoid double prefix
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();

    return {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
    };
};

/**
 * Get the raw token (without Bearer prefix)
 */
export const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return token.replace(/^Bearer\s+/i, '').trim();
};
