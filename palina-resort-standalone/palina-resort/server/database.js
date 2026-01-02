// Simple in-memory database for demonstration
// In a real app, you would use MongoDB, PostgreSQL, etc.
let bookings = [];

export const addBooking = (booking) => {
  bookings.push({ ...booking, id: Date.now() });
  return true;
};

export const getBookings = () => bookings;
