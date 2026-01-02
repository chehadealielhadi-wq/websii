import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dbHelpers } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Excel Export/Import Service for Bookings
 */

// Export all bookings to Excel
export function exportBookingsToExcel(filters = {}) {
  const bookings = dbHelpers.getBookings(filters);
  
  // Transform data for Excel
  const excelData = bookings.map(booking => ({
    'Booking ID': booking.id,
    'Guest Name': booking.guest_name,
    'Phone': booking.guest_phone,
    'Email': booking.guest_email || '',
    'Type': booking.booking_type === 'cabin' ? 'Cabin Stay' : 'Day Pass',
    'Check-in Date': booking.check_in_date || '',
    'Check-out Date': booking.check_out_date || '',
    'Visit Date': booking.visit_date || '',
    'Number of Guests': booking.number_of_guests,
    'Total Price ($)': booking.total_price,
    'Status': booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
    'Special Requests': booking.special_requests || '',
    'Admin Notes': booking.admin_notes || '',
    'WhatsApp Notified': booking.whatsapp_notified ? 'Yes' : 'No',
    'Created At': booking.created_at,
    'Updated At': booking.updated_at
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Booking ID
    { wch: 25 }, // Guest Name
    { wch: 18 }, // Phone
    { wch: 30 }, // Email
    { wch: 12 }, // Type
    { wch: 14 }, // Check-in
    { wch: 14 }, // Check-out
    { wch: 14 }, // Visit Date
    { wch: 8 },  // Guests
    { wch: 12 }, // Total Price
    { wch: 12 }, // Status
    { wch: 40 }, // Special Requests
    { wch: 40 }, // Admin Notes
    { wch: 12 }, // WhatsApp
    { wch: 20 }, // Created
    { wch: 20 }, // Updated
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

  // Add summary sheet
  const stats = dbHelpers.getStats();
  const summaryData = [
    { 'Metric': 'Total Pending', 'Value': stats.pending },
    { 'Metric': 'Total Confirmed', 'Value': stats.confirmed },
    { 'Metric': 'Cabin Bookings', 'Value': stats.cabinBookings },
    { 'Metric': 'Day Pass Bookings', 'Value': stats.dayPassBookings },
    { 'Metric': 'Export Date', 'Value': new Date().toISOString() }
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `palina_bookings_${timestamp}.xlsx`;
  const filepath = path.join(__dirname, '..', 'data', filename);

  // Write file
  XLSX.writeFile(workbook, filepath);

  return { filename, filepath, count: bookings.length };
}

// Export bookings as buffer (for direct download)
export function exportBookingsToBuffer(filters = {}) {
  const bookings = dbHelpers.getBookings(filters);
  
  const excelData = bookings.map(booking => ({
    'Booking ID': booking.id,
    'Guest Name': booking.guest_name,
    'Phone': booking.guest_phone,
    'Email': booking.guest_email || '',
    'Type': booking.booking_type === 'cabin' ? 'Cabin Stay' : 'Day Pass',
    'Check-in Date': booking.check_in_date || '',
    'Check-out Date': booking.check_out_date || '',
    'Visit Date': booking.visit_date || '',
    'Number of Guests': booking.number_of_guests,
    'Total Price ($)': booking.total_price,
    'Status': booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
    'Special Requests': booking.special_requests || '',
    'Admin Notes': booking.admin_notes || '',
    'Created At': booking.created_at
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

  // Return as buffer
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

// Import bookings from Excel (for bulk updates)
export function importBookingsFromExcel(filepath) {
  const workbook = XLSX.readFile(filepath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  const results = {
    imported: 0,
    updated: 0,
    errors: []
  };

  for (const row of data) {
    try {
      const bookingId = row['Booking ID'];
      
      if (bookingId) {
        // Update existing booking
        const status = (row['Status'] || 'pending').toLowerCase();
        const adminNotes = row['Admin Notes'] || null;
        
        if (['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
          dbHelpers.updateBookingStatus(bookingId, status, adminNotes);
          results.updated++;
        }
      } else {
        // Create new booking
        const booking = {
          guestName: row['Guest Name'],
          guestEmail: row['Email'] || null,
          guestPhone: row['Phone'],
          bookingType: (row['Type'] || '').toLowerCase().includes('cabin') ? 'cabin' : 'day_pass',
          checkInDate: row['Check-in Date'] || null,
          checkOutDate: row['Check-out Date'] || null,
          visitDate: row['Visit Date'] || null,
          numberOfGuests: parseInt(row['Number of Guests']) || 1,
          totalPrice: parseFloat(row['Total Price ($)']) || 0,
          specialRequests: row['Special Requests'] || null
        };

        if (booking.guestName && booking.guestPhone) {
          dbHelpers.createBooking(booking);
          results.imported++;
        } else {
          results.errors.push(`Row missing required fields: ${JSON.stringify(row)}`);
        }
      }
    } catch (error) {
      results.errors.push(`Error processing row: ${error.message}`);
    }
  }

  return results;
}

// Generate daily report
export function generateDailyReport() {
  const today = new Date().toISOString().split('T')[0];
  const bookings = dbHelpers.getBookings();
  
  // Filter today's bookings
  const todaysBookings = bookings.filter(b => 
    b.created_at && b.created_at.startsWith(today)
  );

  // Upcoming check-ins (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingCheckins = bookings.filter(b => {
    if (b.booking_type !== 'cabin' || !b.check_in_date) return false;
    const checkIn = new Date(b.check_in_date);
    return checkIn >= new Date(today) && checkIn <= nextWeek && b.status === 'confirmed';
  });

  // Today's day passes
  const todaysDayPasses = bookings.filter(b => 
    b.booking_type === 'day_pass' && 
    b.visit_date === today && 
    b.status === 'confirmed'
  );

  const reportData = [
    { 'Report': 'Daily Summary', 'Date': today },
    { 'Report': '', 'Date': '' },
    { 'Report': 'New Bookings Today', 'Date': todaysBookings.length },
    { 'Report': 'Upcoming Check-ins (7 days)', 'Date': upcomingCheckins.length },
    { 'Report': "Today's Day Passes", 'Date': todaysDayPasses.length },
  ];

  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summarySheet = XLSX.utils.json_to_sheet(reportData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Upcoming check-ins sheet
  if (upcomingCheckins.length > 0) {
    const checkinsData = upcomingCheckins.map(b => ({
      'Guest': b.guest_name,
      'Phone': b.guest_phone,
      'Check-in': b.check_in_date,
      'Check-out': b.check_out_date,
      'Guests': b.number_of_guests
    }));
    const checkinsSheet = XLSX.utils.json_to_sheet(checkinsData);
    XLSX.utils.book_append_sheet(workbook, checkinsSheet, 'Upcoming Check-ins');
  }

  // Today's day passes sheet
  if (todaysDayPasses.length > 0) {
    const dayPassData = todaysDayPasses.map(b => ({
      'Guest': b.guest_name,
      'Phone': b.guest_phone,
      'Guests': b.number_of_guests,
      'Total': `$${b.total_price}`
    }));
    const dayPassSheet = XLSX.utils.json_to_sheet(dayPassData);
    XLSX.utils.book_append_sheet(workbook, dayPassSheet, "Today's Day Passes");
  }

  const filename = `palina_daily_report_${today}.xlsx`;
  const filepath = path.join(__dirname, '..', 'data', filename);
  XLSX.writeFile(workbook, filepath);

  return { filename, filepath };
}

// Auto-sync function (can be called by cron job)
export function autoSyncToExcel() {
  try {
    const result = exportBookingsToExcel();
    console.log(`📊 Auto-sync complete: ${result.count} bookings exported to ${result.filename}`);
    return result;
  } catch (error) {
    console.error('Auto-sync error:', error.message);
    return { error: error.message };
  }
}

export default {
  exportBookingsToExcel,
  exportBookingsToBuffer,
  importBookingsFromExcel,
  generateDailyReport,
  autoSyncToExcel
};
