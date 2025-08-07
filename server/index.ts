import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectToDatabase } from "./config/database";

// Import routes
import authRoutes from "./routes/auth";
import issuesRoutes from "./routes/issues";
import categoriesRoutes from "./routes/categories";
import notificationRoutes from "./routes/notifications";

// Load environment variables
dotenv.config();

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Replace with your production domain
    : ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB (optional for development)
connectToDatabase().catch(error => {
  console.warn('MongoDB not available, using mock data:', error.message);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Keep existing demo route for compatibility
app.get('/api/demo', (req, res) => {
  res.json({
    message: "Hello from the server! 🚀",
    timestamp: new Date().toISOString(),
    database: "MongoDB Atlas Connected"
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const spaPath = path.join(__dirname, '../spa');
  app.use(express.static(spaPath));

  // Catch-all handler for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(spaPath, 'index.html'));
  });
}

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Export the Express app for use with Vite in development
export function createServer() {
  return app;
}

// Only start the standalone server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  });
}

export default app;
