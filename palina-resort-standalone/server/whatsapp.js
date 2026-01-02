import fetch from 'node-fetch';
import { dbHelpers } from './database.js';

/**
 * WhatsApp Notification Service
 * Supports both WhatsApp Cloud API (Meta) and Twilio
 */

// Format phone number for WhatsApp
function formatPhoneNumber(phone) {
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  // Ensure it starts with country code
  if (!cleaned.startsWith('+')) {
    // Assume Lebanon if no country code
    cleaned = '+961' + cleaned.replace(/^0/, '');
  }
  return cleaned;
}

// Send WhatsApp message via Meta Cloud API
async function sendViaMetaAPI(to, message) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  
  if (!phoneNumberId || !accessToken) {
    throw new Error('WhatsApp Cloud API credentials not configured');
  }

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formatPhoneNumber(to).replace('+', ''),
        type: 'text',
        text: { body: message }
      })
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to send WhatsApp message');
  }
  
  return data;
}

// Send WhatsApp message via Twilio
async function sendViaTwilio(to, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio credentials not configured');
  }

  const toWhatsApp = `whatsapp:${formatPhoneNumber(to)}`;
  
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: toWhatsApp,
        Body: message
      })
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send WhatsApp message via Twilio');
  }
  
  return data;
}

// Main function to send WhatsApp notification
export async function sendWhatsAppNotification(to, message, bookingId = null) {
  let result = { success: false, error: null };
  
  try {
    // Try Meta API first, then Twilio
    if (process.env.WHATSAPP_ACCESS_TOKEN) {
      await sendViaMetaAPI(to, message);
      result.success = true;
      result.provider = 'meta';
    } else if (process.env.TWILIO_ACCOUNT_SID) {
      await sendViaTwilio(to, message);
      result.success = true;
      result.provider = 'twilio';
    } else {
      // Log to console if no provider configured (for testing)
      console.log('📱 WhatsApp Notification (no provider configured):');
      console.log(`   To: ${to}`);
      console.log(`   Message: ${message}`);
      result.success = true;
      result.provider = 'console';
    }
    
    // Log successful notification
    if (bookingId) {
      dbHelpers.logNotification(bookingId, 'whatsapp', to, message, 'sent');
      dbHelpers.markWhatsAppNotified(bookingId);
    }
    
  } catch (error) {
    result.error = error.message;
    console.error('WhatsApp notification error:', error.message);
    
    // Log failed notification
    if (bookingId) {
      dbHelpers.logNotification(bookingId, 'whatsapp', to, message, 'failed', error.message);
    }
  }
  
  return result;
}

// Send booking notification to admin
export async function notifyAdminNewBooking(booking) {
  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
  
  if (!adminPhone) {
    console.log('Admin WhatsApp number not configured');
    return { success: false, error: 'Admin phone not configured' };
  }
  
  const bookingType = booking.bookingType === 'cabin' ? '🏠 Cabin Stay' : '🏊 Day Pass';
  const dateInfo = booking.bookingType === 'cabin' 
    ? `Check-in: ${booking.checkInDate}\\nCheck-out: ${booking.checkOutDate}`
    : `Visit Date: ${booking.visitDate}`;
  
  const message = `🔔 *NEW BOOKING - Palina Resort*

${bookingType}

👤 *Guest:* ${booking.guestName}
📞 *Phone:* ${booking.guestPhone}
${booking.guestEmail ? `📧 *Email:* ${booking.guestEmail}` : ''}

📅 ${dateInfo}
👥 *Guests:* ${booking.numberOfGuests}
💰 *Total:* $${booking.totalPrice}

${booking.specialRequests ? `📝 *Notes:* ${booking.specialRequests}` : ''}

Reply with booking ID #${booking.id} to manage this booking.`;

  return sendWhatsAppNotification(adminPhone, message, booking.id);
}

// Send confirmation to guest
export async function notifyGuestBookingReceived(booking) {
  const message = `🌴 *Thank you for booking with Palina Resort!*

Hi ${booking.guestName},

We have received your ${booking.bookingType === 'cabin' ? 'cabin reservation' : 'day pass booking'} request.

📋 *Booking Details:*
• Reference: #${booking.id}
• ${booking.bookingType === 'cabin' ? `Check-in: ${booking.checkInDate}` : `Visit: ${booking.visitDate}`}
• Guests: ${booking.numberOfGuests}
• Total: $${booking.totalPrice}

We will contact you shortly to confirm your booking and payment details.

📍 Palina Resort, Lebanon
📱 Follow us: @palina_pool`;

  return sendWhatsAppNotification(booking.guestPhone, message, booking.id);
}

// Send status update to guest
export async function notifyGuestStatusUpdate(booking, newStatus) {
  const statusMessages = {
    confirmed: `✅ *Booking Confirmed!*

Hi ${booking.guestName},

Great news! Your booking #${booking.id} at Palina Resort has been confirmed.

We look forward to welcoming you!

📍 Palina Resort, Lebanon`,
    
    cancelled: `❌ *Booking Cancelled*

Hi ${booking.guestName},

Your booking #${booking.id} at Palina Resort has been cancelled.

If you have any questions, please contact us.

📍 Palina Resort, Lebanon`,
    
    completed: `🎉 *Thank you for visiting!*

Hi ${booking.guestName},

We hope you enjoyed your time at Palina Resort!

Please leave us a review on Instagram @palina_pool

See you again soon! 🌴`
  };

  const message = statusMessages[newStatus];
  if (message) {
    return sendWhatsAppNotification(booking.guest_phone, message, booking.id);
  }
  
  return { success: false, error: 'Unknown status' };
}

export default {
  sendWhatsAppNotification,
  notifyAdminNewBooking,
  notifyGuestBookingReceived,
  notifyGuestStatusUpdate
};
