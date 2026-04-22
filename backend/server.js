const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const uploadRoutes = require('./routes/upload');
const processRoutes = require('./routes/process');
const downloadRoutes = require('./routes/download');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure required directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const outputsDir = path.join(__dirname, 'outputs');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir, { recursive: true });

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded and processed files statically so the frontend can preview them
app.use('/uploads', express.static(uploadsDir));
app.use('/outputs', express.static(outputsDir));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/process', processRoutes);
app.use('/api/download', downloadRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    name: 'Vistora AI Backend',
    tagline: 'Turn Moments into Masterpieces',
    status: 'running',
    endpoints: {
      upload: 'POST /api/upload',
      process: 'POST /api/process',
      download: 'GET /api/download/:filename',
      list: 'GET /api/upload/list'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`\n🎨 Vistora AI Backend running on http://localhost:${PORT}`);
  console.log(`   Uploads dir: ${uploadsDir}`);
  console.log(`   Outputs dir: ${outputsDir}\n`);
});
