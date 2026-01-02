import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const dbPath = path.join(__dirname, '..', 'data', 'palina_resort.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  -- Cabin Types Table
  CREATE TABLE IF NOT EXISTS cabin_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    capacity INTEGER DEFAULT 2,
    price_per_night REAL NOT NULL,
    amenities TEXT,
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Day Pass Pricing Table
  CREATE TABLE IF NOT EXISTS day_pass_pricing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Bookings Table
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_name TEXT NOT NULL,
    guest_email TEXT,
    guest_phone TEXT NOT NULL,
    booking_type TEXT NOT NULL CHECK(booking_type IN ('cabin', 'day_pass')),
    cabin_type_id INTEGER,
    check_in_date DATE,
    check_out_date DATE,
    visit_date DATE,
    number_of_guests INTEGER DEFAULT 1,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    special_requests TEXT,
    admin_notes TEXT,
    whatsapp_notified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cabin_type_id) REFERENCES cabin_types(id)
  );

  -- Admin Users Table
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Notification Log Table
  CREATE TABLE IF NOT EXISTS notification_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER,
    notification_type TEXT NOT NULL,
    recipient TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    sent_at DATETIME,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
  );
`);

// Insert default cabin type if not exists
const cabinCount = db.prepare('SELECT COUNT(*) as count FROM cabin_types').get();
if (cabinCount.count === 0) {
  db.prepare(`
    INSERT INTO cabin_types (name, description, capacity, price_per_night, amenities, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'A-Frame Cabin',
    'Unique architectural design with modern comfort. Perfect for couples and families seeking a memorable stay.',
    4,
    100.00,
    JSON.stringify(['King Size Bed', 'Pool View', 'High Speed WiFi', 'Air Conditioning', 'Private Bathroom']),
    '/images/cabins-night-1.jpg'
  );
}

// Insert default day pass pricing if not exists
const dayPassCount = db.prepare('SELECT COUNT(*) as count FROM day_pass_pricing').get();
if (dayPassCount.count === 0) {
  db.prepare(`
    INSERT INTO day_pass_pricing (name, description, price)
    VALUES (?, ?, ?)
  `).run('Adult Day Pass', 'Full day access to pool and facilities', 15.00);
  
  db.prepare(`
    INSERT INTO day_pass_pricing (name, description, price)
    VALUES (?, ?, ?)
  `).run('Child Day Pass', 'Full day access for children under 12', 10.00);
}

// Database helper functions
export const dbHelpers = {
  // Bookings
  createBooking: (booking) => {
    const stmt = db.prepare(`
      INSERT INTO bookings (
        guest_name, guest_email, guest_phone, booking_type,
        cabin_type_id, check_in_date, check_out_date, visit_date,
        number_of_guests, total_price, special_requests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      booking.guestName,
      booking.guestEmail || null,
      booking.guestPhone,
      booking.bookingType,
      booking.cabinTypeId || null,
      booking.checkInDate || null,
      booking.checkOutDate || null,
      booking.visitDate || null,
      booking.numberOfGuests || 1,
      booking.totalPrice,
      booking.specialRequests || null
    );
    
    return { id: result.lastInsertRowid, ...booking };
  },

  getBookings: (filters = {}) => {
    let query = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.bookingType) {
      query += ' AND booking_type = ?';
      params.push(filters.bookingType);
    }
    
    query += ' ORDER BY created_at DESC';
    
    return db.prepare(query).all(...params);
  },

  getBookingById: (id) => {
    return db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  },

  updateBookingStatus: (id, status, adminNotes = null) => {
    const stmt = db.prepare(`
      UPDATE bookings 
      SET status = ?, admin_notes = COALESCE(?, admin_notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(status, adminNotes, id);
  },

  markWhatsAppNotified: (id) => {
    return db.prepare('UPDATE bookings SET whatsapp_notified = 1 WHERE id = ?').run(id);
  },

  // Cabin Types
  getCabinTypes: () => {
    return db.prepare('SELECT * FROM cabin_types WHERE is_active = 1').all();
  },

  // Day Pass Pricing
  getDayPassPricing: () => {
    return db.prepare('SELECT * FROM day_pass_pricing WHERE is_active = 1').all();
  },

  // Stats
  getStats: () => {
    const pending = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'").get();
    const confirmed = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'").get();
    const cabins = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE booking_type = 'cabin'").get();
    const dayPasses = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE booking_type = 'day_pass'").get();
    
    return {
      pending: pending.count,
      confirmed: confirmed.count,
      cabinBookings: cabins.count,
      dayPassBookings: dayPasses.count
    };
  },

  // Notification Log
  logNotification: (bookingId, type, recipient, message, status, errorMessage = null) => {
    const stmt = db.prepare(`
      INSERT INTO notification_log (booking_id, notification_type, recipient, message, status, sent_at, error_message)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    `);
    return stmt.run(bookingId, type, recipient, message, status, errorMessage);
  }
};

export default db;
