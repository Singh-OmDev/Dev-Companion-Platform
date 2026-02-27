const clerk = require('@clerk/clerk-sdk-node');

/**
 * Retrieves the user's personal GitHub OAuth token from Clerk.
 * If the user has not connected GitHub, it falls back to the server's GITHUB_TOKEN.
 * 
 * @param {string} clerkUserId - The user's Clerk ID (req.auth.userId)
 * @returns {Promise<string|null>} - The OAuth token
 */
const getGithubToken = async (clerkUserId) => {
    try {
        if (clerkUserId) {
            const response = await clerk.users.getUserOauthAccessToken(clerkUserId, 'oauth_github');
            // response is typically an array of objects: { provider, token, scopes, label }
            if (response && response.length > 0) {
                return response[0].token;
            }
        }
    } catch (err) {
        console.warn(`Could not fetch Clerk GitHub token for user ${clerkUserId}, falling back to server token.`);
    }

    // Fallback to the server's public PAT
    if (process.env.GITHUB_TOKEN) {
        return process.env.GITHUB_TOKEN;
    }

    return null;
};

module.exports = { getGithubToken };
