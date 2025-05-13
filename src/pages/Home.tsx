import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Search, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Protect Yourself From Food Allergies
              </h1>
              <p className="mt-4 text-xl">
              SafeByte helps you identify potential allergens in food products by scanning ingredient lists and comparing them with your personal allergy profile.
              </p>
              <div className="mt-8">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="inline-block bg-white text-indigo-600 font-medium px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="inline-block bg-white text-indigo-600 font-medium px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden md:block md:w-1/2">
              <div className="flex justify-center">
                <Shield className="h-64 w-64 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          How AllergyGuard Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Track Your Allergies</h3>
            <p className="text-gray-600 text-center">
              Create and manage your personal allergy profile with detailed information about your food sensitivities.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              <Search className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Scan Ingredients</h3>
            <p className="text-gray-600 text-center">
              Upload images of ingredient lists from food products and our AI will extract and analyze them for potential allergens.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              <History className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Review History</h3>
            <p className="text-gray-600 text-center">
              Access your scan history to review previous product analyses and keep track of safe food options.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Eat Safely?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of users who trust AllergyGuard to help them make informed food choices and avoid allergic reactions.
          </p>
          {user ? (
            <Link
              to="/scan"
              className="inline-block bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
            >
              Scan a Product Now
            </Link>
          ) : (
            <Link
              to="/signup"
              className="inline-block bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
            >
              Create Free Account
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}