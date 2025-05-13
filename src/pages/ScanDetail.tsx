import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ScanHistory } from '../types';

export default function ScanDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScanDetails = async () => {
      if (!user || !id) return;

      try {
        const { data, error } = await supabase
          .from('scan_history')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setScan(data);
      } catch (err) {
        console.error('Error fetching scan details:', err);
        setError('Failed to load scan details. The scan may not exist or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchScanDetails();
  }, [id, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Scan</h3>
            <p className="text-gray-500 mb-6">
              {error || 'The scan could not be found.'}
            </p>
            <button
              onClick={() => navigate('/history')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/history"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to History
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center mb-6">
            {scan.has_matches ? (
              <div className="bg-red-100 text-red-800 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8" />
              </div>
            ) : (
              <div className="bg-green-100 text-green-800 p-3 rounded-full">
                <Check className="h-8 w-8" />
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">
            {scan.product_name || 'Unnamed Product'}
          </h1>
          
          <p className="text-center text-gray-500 mb-6">
            Scanned on {formatDate(scan.created_at)}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Scan Results</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium mb-2">
                  Status: 
                  <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                    scan.has_matches 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {scan.has_matches ? 'Allergens Found' : 'Safe'}
                  </span>
                </p>
                
                <div className="mt-4">
                  <p className="font-medium mb-2">Matched Allergies:</p>
                  {scan.matched_allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {scan.matched_allergies.map((allergy, index) => (
                        <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No allergies matched</p>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Ingredients</h2>
              <div className="p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                <ul className="list-disc pl-5 space-y-1">
                  {scan.ingredients.map((ingredient, index) => (
                    <li key={index} className={scan.matched_allergies.some(a => 
                      ingredient.toLowerCase().includes(a.toLowerCase())
                    ) ? 'text-red-600 font-semibold' : ''}>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Analysis</h2>
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
              {scan.analysis}
            </div>
          </div>
          
          <div className="flex justify-center">
            <Link
              to="/scan"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Scan Another Product
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}