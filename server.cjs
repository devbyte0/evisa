const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4173;

// Path to Vite build output
const distPath = path.join(__dirname, 'dist');

// Serve static assets from dist
app.use(express.static(distPath));

// SPA fallback: send index.html for all non-asset routes so React Router can handle them
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
});

