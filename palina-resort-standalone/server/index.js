import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { dbHelpers } from './database.js';
import whatsapp from './whatsapp.js';
import excel from './excel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client build
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
const clientPublicPath = path.join(__dirname, '..', 'client', 'public');

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
}
app.use('/images', express.static(path.join(clientPublicPath, 'images')));

// File upload configuration
const upload = multer({ dest: path.join(__dirname, '..', 'data', 'uploads') });

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------------------------------------
// BOOKING ROUTES
// --------------------------------------------

// Get all bookings (with optional filters)
app.get('/api/bookings', (req, res) => {
  try {
    const { status, type } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.bookingType = type;
    
    const bookings = dbHelpers.getBookings(filters);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single booking
app.get('/api/bookings/:id', (req, res) => {
  try {
    const booking = dbHelpers.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = dbHelpers.createBooking(req.body);
    
    // Send WhatsApp notifications
    const adminNotification = await whatsapp.notifyAdminNewBooking(booking);
    const guestNotification = await whatsapp.notifyGuestBookingReceived(booking);
    
    res.status(201).json({
      booking,
      notifications: {
        admin: adminNotification,
        guest: guestNotification
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const bookingId = req.params.id;
    
    // Validate status
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    dbHelpers.updateBookingStatus(bookingId, status, adminNotes);
    
    // Get updated booking
    const booking = dbHelpers.getBookingById(bookingId);
    
    // Send notification to guest
    const notification = await whatsapp.notifyGuestStatusUpdate(booking, status);
    
    res.json({ booking, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------
// PRICING ROUTES
// --------------------------------------------

// Get cabin types
app.get('/api/cabins', (req, res) => {
  try {
    const cabins = dbHelpers.getCabinTypes();
    res.json(cabins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get day pass pricing
app.get('/api/day-passes', (req, res) => {
  try {
    const pricing = dbHelpers.getDayPassPricing();
    res.json(pricing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------
// STATS ROUTES
// --------------------------------------------

app.get('/api/stats', (req, res) => {
  try {
    const stats = dbHelpers.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------
// EXCEL ROUTES
// --------------------------------------------

// Export bookings to Excel (download)
app.get('/api/export/excel', (req, res) => {
  try {
    const { status, type } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.bookingType = type;
    
    const buffer = excel.exportBookingsToBuffer(filters);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=palina_bookings_${timestamp}.xlsx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export and save to server
app.post('/api/export/excel/save', (req, res) => {
  try {
    const result = excel.exportBookingsToExcel(req.body.filters || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import bookings from Excel
app.post('/api/import/excel', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const result = excel.importBookingsFromExcel(req.file.path);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate daily report
app.get('/api/export/daily-report', (req, res) => {
  try {
    const result = excel.generateDailyReport();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download saved Excel file
app.get('/api/download/:filename', (req, res) => {
  try {
    const filepath = path.join(__dirname, '..', 'data', req.params.filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.download(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------
// WHATSAPP TEST ROUTE
// --------------------------------------------

app.post('/api/whatsapp/test', async (req, res) => {
  try {
    const { phone, message } = req.body;
    const result = await whatsapp.sendWhatsAppNotification(phone, message || 'Test message from Palina Resort');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------
// ADMIN AUTH (Simple)
// --------------------------------------------

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (username === adminUsername && password === adminPassword) {
    res.json({ success: true, token: 'admin-session-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// --------------------------------------------
// CATCH-ALL FOR SPA
// --------------------------------------------

app.get('*', (req, res) => {
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Development mode - redirect to Vite dev server
    res.redirect('http://localhost:5173' + req.path);
  }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌴 Palina Resort Server                                 ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║                                                           ║
║   API Endpoints:                                          ║
║   • GET  /api/bookings       - List all bookings          ║
║   • POST /api/bookings       - Create new booking         ║
║   • GET  /api/export/excel   - Download Excel             ║
║   • POST /api/import/excel   - Import from Excel          ║
║   • POST /api/whatsapp/test  - Test WhatsApp              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
