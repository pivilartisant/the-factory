/**
 * Express web server for PNG generation API
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { renderPNG, renderPreview } = require('./renderRoute');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get available templates
app.get('/api/templates', (req, res) => {
  try {
    const templatesDir = path.join(__dirname, '../templates');
    const files = fs.readdirSync(templatesDir)
      .filter(file => file.endsWith('.html'))
      .map(file => ({
        name: file.replace('.html', ''),
        path: path.join(templatesDir, file),
        filename: file
      }));
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

// Main render endpoint
app.post('/api/render', renderPNG);

// Preview endpoint (returns HTML)
app.post('/api/preview', renderPreview);

// Serve main UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 The Factory server running on http://localhost:${PORT}`);
  console.log(`📝 Web UI available at http://localhost:${PORT}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/render`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});
