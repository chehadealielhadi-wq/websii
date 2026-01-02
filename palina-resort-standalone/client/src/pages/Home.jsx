import { Link } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Waves, 
  Image, 
  Phone, 
  Instagram, 
  ArrowRight,
  ChevronDown,
  Star,
  Users,
  Wifi,
  Wind,
  Bath
} from 'lucide-react';

export default function Home() {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-primary">Palina</span>
              <span className="text-white/80 font-light">Resort</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('cabins')} className="text-white/70 hover:text-primary transition-colors">
                Cabins
              </button>
              <button onClick={() => scrollToSection('pool')} className="text-white/70 hover:text-primary transition-colors">
                Pool
              </button>
              <button onClick={() => scrollToSection('gallery')} className="text-white/70 hover:text-primary transition-colors">
                Gallery
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-white/70 hover:text-primary transition-colors">
                Contact
              </button>
            </div>
            
            <Link 
              to="/book" 
              className="bg-primary hover:bg-primary-dark text-dark font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/pool-night-1.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/50 to-dark"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-primary font-semibold tracking-[0.3em] uppercase mb-4 slide-up">
            Welcome to
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-6 slide-up">
            Palina Resort
          </h1>
          <p className="text-xl md:text-2xl text-white/70 font-light mb-4 slide-up">
            Lebanon's Hidden Oasis
          </p>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 slide-up">
            Experience luxury A-frame cabins and a stunning pool retreat. 
            Your perfect escape awaits in the heart of Lebanon.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up">
            <Link 
              to="/book" 
              className="bg-primary hover:bg-primary-dark text-dark font-semibold px-8 py-4 rounded-lg transition-all flex items-center justify-center gap-2 group"
            >
              Book Your Stay
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={() => scrollToSection('cabins')}
              className="border border-white/30 hover:border-primary text-white hover:text-primary px-8 py-4 rounded-lg transition-all"
            >
              Explore Cabins
            </button>
          </div>
        </div>
        
        <button 
          onClick={() => scrollToSection('cabins')}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 hover:text-primary transition-colors animate-bounce"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </section>

      {/* Cabins Section */}
      <section id="cabins" className="py-24 px-4 bg-dark-lighter">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold tracking-widest uppercase mb-4">Accommodations</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
              Unique A-Frame Cabins
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Our distinctive A-frame cabins combine architectural beauty with modern comfort, 
              offering an unforgettable stay surrounded by nature.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="/images/cabins-night-2.jpg" 
                alt="A-Frame Cabins at Night" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-primary text-dark p-6 rounded-xl">
                <p className="text-sm font-medium">Starting from</p>
                <p className="text-3xl font-bold">$100<span className="text-lg font-normal">/night</span></p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-dark p-6 rounded-xl">
                  <Users className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-white font-semibold mb-1">Up to 4 Guests</h3>
                  <p className="text-white/50 text-sm">Perfect for families</p>
                </div>
                <div className="bg-dark p-6 rounded-xl">
                  <Wifi className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-white font-semibold mb-1">High Speed WiFi</h3>
                  <p className="text-white/50 text-sm">Stay connected</p>
                </div>
                <div className="bg-dark p-6 rounded-xl">
                  <Wind className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-white font-semibold mb-1">Air Conditioning</h3>
                  <p className="text-white/50 text-sm">Climate controlled</p>
                </div>
                <div className="bg-dark p-6 rounded-xl">
                  <Bath className="w-8 h-8 text-primary mb-3" />
                  <h3 className="text-white font-semibold mb-1">Private Bathroom</h3>
                  <p className="text-white/50 text-sm">Modern amenities</p>
                </div>
              </div>
              
              <Link 
                to="/book?type=cabin" 
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-dark font-semibold px-8 py-4 rounded-lg transition-all group"
              >
                Reserve a Cabin
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pool Section */}
      <section id="pool" className="py-24 px-4 bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-primary font-semibold tracking-widest uppercase mb-4">Day Pass</p>
              <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
                Crystal Clear Pool
              </h2>
              <p className="text-white/60 mb-8">
                Enjoy a refreshing escape at our stunning pool. Perfect for families, 
                couples, or groups looking for a day of relaxation and fun.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Adult Day Pass</h3>
                    <p className="text-white/50">$15 per person</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Child Day Pass</h3>
                    <p className="text-white/50">$10 per child (under 12)</p>
                  </div>
                </div>
              </div>
              
              <Link 
                to="/book?type=day_pass" 
                className="inline-flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-dark font-semibold px-8 py-4 rounded-lg transition-all group"
              >
                Book Day Pass
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="order-1 lg:order-2">
              <img 
                src="/images/pool-night-1.jpg" 
                alt="Pool at Night" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-4 bg-dark-lighter">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-semibold tracking-widest uppercase mb-4">Gallery</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
              Capture the Moment
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <img src="/images/pool-night-1.jpg" alt="Pool" className="rounded-xl hover:scale-105 transition-transform duration-300 cursor-pointer" />
            <img src="/images/cabins-night-1.jpg" alt="Cabins" className="rounded-xl hover:scale-105 transition-transform duration-300 cursor-pointer" />
            <img src="/images/cabins-night-2.jpg" alt="Cabins Night" className="rounded-xl hover:scale-105 transition-transform duration-300 cursor-pointer" />
          </div>
          
          <div className="text-center mt-12">
            <a 
              href="https://instagram.com/palina_pool" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
            >
              <Instagram className="w-5 h-5" />
              Follow us on Instagram for more
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 bg-dark">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary font-semibold tracking-widest uppercase mb-4">Contact Us</p>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6">
            Get in Touch
          </h2>
          <p className="text-white/60 mb-12">
            Ready to book your escape? Have questions? We're here to help.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <a 
              href="https://wa.me/961XXXXXXXX" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-dark-lighter p-8 rounded-xl hover:bg-dark-card transition-colors group"
            >
              <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">WhatsApp</h3>
              <p className="text-white/50">Message us directly</p>
            </a>
            
            <a 
              href="https://instagram.com/palina_pool" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-dark-lighter p-8 rounded-xl hover:bg-dark-card transition-colors group"
            >
              <Instagram className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">Instagram</h3>
              <p className="text-white/50">@palina_pool</p>
            </a>
          </div>
          
          <Link 
            to="/book" 
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-dark font-semibold px-10 py-4 rounded-lg transition-all text-lg group"
          >
            Book Your Stay Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-dark-lighter border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-primary">Palina</span>
              <span className="text-white/80 font-light">Resort</span>
            </div>
            
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} Palina Resort, Lebanon. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <a href="https://instagram.com/palina_pool" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-primary transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <Link to="/admin" className="text-white/30 hover:text-white/50 text-sm transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
