import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Search, History, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Allergy, ScanHistory } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [recentScans, setRecentScans] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch allergies
        const { data: allergyData, error: allergyError } = await supabase
          .from('allergies')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (allergyError) throw allergyError;
        setAllergies(allergyData || []);

        // Fetch recent scans
        const { data: scanData, error: scanError } = await supabase
          .from('scan_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (scanError) throw scanError;
        setRecentScans(scanData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Allergies Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-indigo-600" />
                My Allergies
              </h2>
              <Link
                to="/allergies"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {allergies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't added any allergies yet.</p>
                <Link
                  to="/allergies"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Allergies
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {allergies.slice(0, 5).map((allergy) => (
                  <div key={allergy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{allergy.name}</p>
                      <p className="text-sm text-gray-500">
                        Severity: <span className={`font-medium ${
                          allergy.severity === 'severe' ? 'text-red-600' : 
                          allergy.severity === 'moderate' ? 'text-orange-500' : 'text-yellow-500'
                        }`}>{allergy.severity}</span>
                      </p>
                    </div>
                    {allergy.notes && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                        Has notes
                      </span>
                    )}
                  </div>
                ))}
                {allergies.length > 5 && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    + {allergies.length - 5} more
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Scan Product Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
              <Search className="h-5 w-5 mr-2 text-indigo-600" />
              Scan a Product
            </h2>
            <p className="text-gray-600 mb-6">
              Upload an image of a product's ingredient list to check for potential allergens.
            </p>
            <Link
              to="/scan"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Search className="h-4 w-4 mr-2" />
              Scan Ingredients
            </Link>
          </div>
        </div>

        {/* Recent Scans Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <History className="h-5 w-5 mr-2 text-indigo-600" />
              Recent Scans
            </h2>
            <Link
              to="/history"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {recentScans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't scanned any products yet.</p>
              <Link
                to="/scan"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Scan Your First Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentScans.map((scan) => (
                    <tr key={scan.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {scan.product_name || 'Unnamed Product'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(scan.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          scan.has_matches 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {scan.has_matches ? 'Allergens Found' : 'Safe'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link 
                          to={`/history/${scan.id}`} 
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}