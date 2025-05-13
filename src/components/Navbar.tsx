import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, LogOut, ChefHat, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Shield className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">SafeByte</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  Dashboard
                </Link>
                <Link to="/allergies" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  My Allergies
                </Link>
                <Link to="/scan" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  Scan Product
                </Link>
                <Link to="/menu-scanner" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  <div className="flex items-center">
                    <Utensils className="h-4 w-4 mr-1" />
                    Menu Scanner
                  </div>
                </Link>
                <Link to="/recommendations" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  <div className="flex items-center">
                    <ChefHat className="h-4 w-4 mr-1" />
                    Meal Ideas
                  </div>
                </Link>
                <Link to="/history" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  History
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center px-3 py-2 rounded-md hover:bg-indigo-700"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  Login
                </Link>
                <Link to="/signup" className="px-3 py-2 bg-white text-indigo-600 font-medium rounded-md hover:bg-gray-100">
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-indigo-700 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block px-3 py-2 rounded-md hover:bg-indigo-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/allergies" 
                  className="block px-3 py-2 rounded-md hover:bg-indigo-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Allergies
                </Link>
                <Link 
                  to="/scan" 
                  className="block px-3 py-2 rounded-md hover:bg-indigo-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Scan Product
                </Link>
                <Link 
                  to="/menu-scanner" 
                  className="block px-3 py-2 rounded-md hover:bg-indigo-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Utensils className="h-4 w-4 mr-1" />
                    Menu Scanner
                  </div>
                </Link>
                <Link 
                  to="/recommendations" 
                  className="block px-3 py-2 rounded-md hover:bg-indigo-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <ChefHat className="h-4 w-4 mr-1" />
                    Meal Ideas
                  </div>
                </Link>
                <Link 
                  to="/history" 
                  className="block px-3 py-2 rounded-md hover:bg-indigo-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  History
                </Link>
                <button 
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-indigo-700"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-md hover:bg-indigo-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block px-3 py-2 bg-white text-indigo-600 font-medium rounded-md hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}