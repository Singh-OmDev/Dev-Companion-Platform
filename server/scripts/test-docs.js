require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testGenerateDocs() {
    console.log("Starting docs generation test...");

    // Create a mock token for the auth middleware
    const payload = {
        user: {
            id: 'mock_user_id'
        }
    };

    // Use the JWT secret from your env, or a fallback if not present
    const secret = process.env.JWT_SECRET || 'your_temporary_secret_key';
    const mockToken = jwt.sign(payload, secret, { expiresIn: '1h' });

    try {
        console.log("Sending request to local API...");
        // Assuming your server runs on port 5000
        const response = await axios.post('http://localhost:5000/api/ai/generate-docs', {
            owner: 'Singh-OmDev', // Use your GitHub username
            repo: 'Dev-Companion-Platform', // Test on this repo
            branch: 'main',
            path: 'server/routes' // Test generating docs for the routes folder
        }, {
            headers: {
                'x-auth-token': mockToken,
                'Content-Type': 'application/json'
            }
        });

        console.log("\n✅ Success! Generated Documentation:\n");
        console.log("============================================\n");
        console.log(response.data.markdown);
        console.log("\n============================================");

    } catch (error) {
        console.error("❌ Request Failed:", error.response?.data || error.message);
    }
}

testGenerateDocs();
