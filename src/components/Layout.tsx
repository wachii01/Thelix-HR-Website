import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Briefcase, LogIn, Menu, X } from 'lucide-react';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const isHR = location.pathname.startsWith('/hr');

  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      <header className="sticky top-0 z-50 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src="https://thelixholdings.com/wp-content/uploads/2024/09/cropped-Thelix.png" 
                  alt="Thelix Holdings" 
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {!isHR ? (
                <>
                  <Link to="/jobs" className="text-slate-600 hover:text-primary font-medium transition-colors">
                    Open Positions
                  </Link>
                  <Link to="/hr/login" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-accent transition-colors">
                    <LogIn className="w-4 h-4" />
                    HR Login
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/hr/dashboard" className="text-slate-600 hover:text-primary font-medium transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-accent transition-colors">
                    <LogIn className="w-4 h-4" />
                    Logout
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-500 hover:text-primary focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden glass-panel border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {!isHR ? (
                <>
                  <Link 
                    to="/jobs" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-white/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Open Positions
                  </Link>
                  <Link 
                    to="/hr/login" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-accent hover:bg-white/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    HR Login
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/hr/dashboard" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-white/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-accent hover:bg-white/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Logout
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="glass-panel border-t border-white/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="https://thelixholdings.com/wp-content/uploads/2024/09/cropped-TMH-32x32.png" 
                alt="Thelix Holdings Icon" 
                className="h-6 w-6"
              />
              <span className="text-slate-500 text-sm">© {new Date().getFullYear()} Thelix Holdings. All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
