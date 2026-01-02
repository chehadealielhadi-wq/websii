import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Home, 
  Waves, 
  Calendar, 
  Users, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function Book() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'cabin';
  
  const [bookingType, setBookingType] = useState(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: '',
    checkOutDate: '',
    visitDate: '',
    numberOfGuests: 1,
    specialRequests: ''
  });

  // Calculate price
  const calculatePrice = () => {
    if (bookingType === 'cabin') {
      if (formData.checkInDate && formData.checkOutDate) {
        const checkIn = new Date(formData.checkInDate);
        const checkOut = new Date(formData.checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights * 100 : 0;
      }
      return 0;
    } else {
      // Day pass: $15 adults, $10 children (simplified to $15 per person)
      return formData.numberOfGuests * 15;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const bookingData = {
        guestName: formData.guestName,
        guestEmail: formData.guestEmail || null,
        guestPhone: formData.guestPhone,
        bookingType: bookingType,
        numberOfGuests: parseInt(formData.numberOfGuests),
        totalPrice: calculatePrice(),
        specialRequests: formData.specialRequests || null
      };

      if (bookingType === 'cabin') {
        bookingData.checkInDate = formData.checkInDate;
        bookingData.checkOutDate = formData.checkOutDate;
      } else {
        bookingData.visitDate = formData.visitDate;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }

      setBookingId(result.booking.id);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="bg-dark-lighter rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display text-3xl text-white mb-4">Booking Received!</h1>
          <p className="text-white/60 mb-6">
            Thank you for your booking request. Your reference number is:
          </p>
          <p className="text-4xl font-bold text-primary mb-6">#{bookingId}</p>
          <p className="text-white/50 text-sm mb-8">
            We will contact you shortly via WhatsApp to confirm your booking and payment details.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-dark font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-dark-lighter border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-white/50 hover:text-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="font-display text-2xl text-white">Book Your Stay</h1>
            <p className="text-white/50 text-sm">Palina Resort, Lebanon</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Booking Type Selection */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setBookingType('cabin')}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              bookingType === 'cabin' 
                ? 'border-primary bg-primary/10' 
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <Home className={`w-8 h-8 mb-3 ${bookingType === 'cabin' ? 'text-primary' : 'text-white/50'}`} />
            <h3 className="text-white font-semibold text-lg mb-1">Cabin Stay</h3>
            <p className="text-white/50 text-sm">Book an A-frame cabin for overnight stay</p>
            <p className="text-primary font-semibold mt-2">From $100/night</p>
          </button>
          
          <button
            onClick={() => setBookingType('day_pass')}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              bookingType === 'day_pass' 
                ? 'border-primary bg-primary/10' 
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <Waves className={`w-8 h-8 mb-3 ${bookingType === 'day_pass' ? 'text-primary' : 'text-white/50'}`} />
            <h3 className="text-white font-semibold text-lg mb-1">Day Pass</h3>
            <p className="text-white/50 text-sm">Enjoy the pool for a day</p>
            <p className="text-primary font-semibold mt-2">$15/person</p>
          </button>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="bg-dark-lighter rounded-2xl p-6 md:p-8">
          <h2 className="font-display text-2xl text-white mb-6">
            {bookingType === 'cabin' ? 'Cabin Reservation' : 'Day Pass Booking'}
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Guest Name */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Full Name *</label>
              <input
                type="text"
                name="guestName"
                value={formData.guestName}
                onChange={handleInputChange}
                required
                className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="Your full name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-white/70 text-sm mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="guestPhone"
                value={formData.guestPhone}
                onChange={handleInputChange}
                required
                className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="+961 XX XXX XXX"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-white/70 text-sm mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email (optional)
              </label>
              <input
                type="email"
                name="guestEmail"
                value={formData.guestEmail}
                onChange={handleInputChange}
                className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
            </div>

            {/* Number of Guests */}
            <div>
              <label className="block text-white/70 text-sm mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Number of Guests *
              </label>
              <select
                name="numberOfGuests"
                value={formData.numberOfGuests}
                onChange={handleInputChange}
                required
                className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>

            {/* Date Fields */}
            {bookingType === 'cabin' ? (
              <>
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    name="checkInDate"
                    value={formData.checkInDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    name="checkOutDate"
                    value={formData.checkOutDate}
                    onChange={handleInputChange}
                    required
                    min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                    className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-white/70 text-sm mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Visit Date *
                </label>
                <input
                  type="date"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            )}

            {/* Special Requests */}
            <div className="md:col-span-2">
              <label className="block text-white/70 text-sm mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Special Requests (optional)
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors resize-none"
                placeholder="Any special requests or notes..."
              />
            </div>
          </div>

          {/* Price Summary */}
          <div className="mt-8 p-6 bg-dark rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/70">
                {bookingType === 'cabin' 
                  ? `${formData.checkInDate && formData.checkOutDate 
                      ? Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24)) 
                      : 0} night(s) × $100`
                  : `${formData.numberOfGuests} guest(s) × $15`
                }
              </span>
              <span className="text-white font-semibold">${calculatePrice()}</span>
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <span className="text-white font-semibold text-lg">Total</span>
              <span className="text-primary font-bold text-2xl">${calculatePrice()}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || calculatePrice() === 0}
            className="w-full mt-6 bg-primary hover:bg-primary-dark disabled:bg-primary/50 disabled:cursor-not-allowed text-dark font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm Booking
              </>
            )}
          </button>

          <p className="text-white/40 text-sm text-center mt-4">
            We will contact you via WhatsApp to confirm your booking and arrange payment.
          </p>
        </form>
      </main>
    </div>
  );
}
