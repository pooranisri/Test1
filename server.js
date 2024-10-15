// server.js (Node.js Backend)
const express = require('express');
const session = require('express-session'); // For session management
const Keycloak = require('keycloak-connect'); // Keycloak adapter
const fetch = require('node-fetch'); // For making HTTP requests
const { Shopify } = require('@shopify/shopify-api');

const app = express();
const memoryStore = new session.MemoryStore(); // Use a proper session store in production

// App Configuration (store securely, e.g., environment variables)
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET_KEY = process.env.SHOPIFY_API_SECRET_KEY;
const SHOPIFY_APP_URL = process.env.SHOPIFY_APP_URL; // Your app's URL
const KEYCLOAK_CONFIG = { /* Your Keycloak configuration */ };

const keycloak = new Keycloak({ store: memoryStore }, KEYCLOAK_CONFIG);

app.use(session({
  secret: 'your-secret-key', // Replace with a strong secret
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));
app.use(keycloak.middleware());
app.use(express.json()); // To support JSON-encoded bodies

// Database setup (e.g., using MongoDB)
// ... (Your database connection and model definitions)

// Routes

app.get('/apps/sso/login', keycloak.protect(), (req, res) => {
  // Redirect to Shopify OAuth flow
  const shop = req.query.shop; // Get shop from query parameters
  const redirectUri = `${SHOPIFY_APP_URL}/apps/sso/shopify/callback`;
  const oauthUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=write_customers,read_customers&redirect_uri=${redirectUri}`;
  res.redirect(oauthUrl);
});

app.get('/apps/sso/auth/callback', keycloak.protect(), async (req, res) => {
  // Keycloak callback logic (verify token, extract user info, etc.)
  // ...
});

app.get('/apps/sso/shopify/callback', async (req, res) => {
  // Shopify callback logic (get Shopify access token, create/update customer)
  // ...

  // Redirect to Shopify login page with session_id
  const sessionId = 34567;
  res.redirect(`/account/login?session_id=${sessionId}`);
});

app.post('/apps/sso/login/sessionid', async (req, res) => {
  const sessionId = req.body.session_id;

  try {
    // Retrieve user credentials from the database based on session_id
    const user = await User.findOne({ sessionId }); // Replace with your database query

    if (user) {
      res.json({ email: user.email, password: user.password });
      // Invalidate session after use for security
      // ...
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ... other routes and app logic

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
