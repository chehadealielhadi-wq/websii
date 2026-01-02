import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Home, 
  Waves, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  Download,
  Upload,
  FileSpreadsheet,
  LogIn,
  LogOut,
  Filter
} from 'lucide-react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState(null);
  
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, cabinBookings: 0, dayPassBookings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Check if already authenticated (simple session)
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, statusFilter, typeFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let url = '/api/bookings?';
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (typeFilter !== 'all') url += `type=${typeFilter}`;
      
      const [bookingsRes, statsRes] = await Promise.all([
        fetch(url),
        fetch('/api/stats')
      ]);
      
      const bookingsData = await bookingsRes.json();
      const statsData = await statsRes.json();
      
      setBookings(bookingsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      localStorage.setItem('adminToken', data.token);
      setIsAuthenticated(true);
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const exportToExcel = async () => {
    try {
      let url = '/api/export/excel?';
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (typeFilter !== 'all') url += `type=${typeFilter}`;
      
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `palina_bookings_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/import/excel', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      alert(`Import complete: ${result.imported} new, ${result.updated} updated, ${result.errors.length} errors`);
      fetchData();
    } catch (error) {
      console.error('Import failed:', error);
    }
    
    e.target.value = '';
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      confirmed: 'bg-green-500/10 text-green-500 border-green-500/30',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/30',
      completed: 'bg-blue-500/10 text-blue-500 border-blue-500/30'
    };
    
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      confirmed: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="bg-dark-lighter rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-white mb-2">Admin Login</h1>
            <p className="text-white/50">Palina Resort Dashboard</p>
          </div>
          
          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                required
                className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                required
                className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-dark font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Login
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/" className="text-white/50 hover:text-primary text-sm transition-colors">
              ← Back to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-dark-lighter border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white/50 hover:text-primary transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-display text-xl text-white">Admin Dashboard</h1>
              <p className="text-white/50 text-sm">Manage bookings for Palina Resort</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className="p-2 text-white/50 hover:text-primary transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-white/50 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-dark-lighter rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-lighter rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Confirmed</p>
                <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-lighter rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Cabin Bookings</p>
                <p className="text-2xl font-bold text-white">{stats.cabinBookings}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-lighter rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Waves className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Day Passes</p>
                <p className="text-2xl font-bold text-white">{stats.dayPassBookings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Filters */}
        <div className="bg-dark-lighter rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/50" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-dark border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="cabin">Cabin</option>
              <option value="day_pass">Day Pass</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
            <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Import Excel
              <input type="file" accept=".xlsx,.xls" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-dark-lighter rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Bookings
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-white/50">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark">
                  <tr>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">ID</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Guest</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Type</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Date</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Guests</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Total</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Status</th>
                    <th className="text-left text-white/50 text-sm font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-dark/50 transition-colors">
                      <td className="px-4 py-4 text-white font-mono">#{booking.id}</td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-white font-medium">{booking.guest_name}</p>
                          <p className="text-white/50 text-sm">{booking.guest_phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          booking.booking_type === 'cabin' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {booking.booking_type === 'cabin' ? <Home className="w-3 h-3" /> : <Waves className="w-3 h-3" />}
                          {booking.booking_type === 'cabin' ? 'Cabin' : 'Day Pass'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-white/70 text-sm">
                        {booking.booking_type === 'cabin' 
                          ? `${booking.check_in_date} → ${booking.check_out_date}`
                          : booking.visit_date
                        }
                      </td>
                      <td className="px-4 py-4 text-white/70">{booking.number_of_guests}</td>
                      <td className="px-4 py-4 text-primary font-semibold">${booking.total_price}</td>
                      <td className="px-4 py-4">{getStatusBadge(booking.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                title="Confirm"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                title="Cancel"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                              title="Mark Complete"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
