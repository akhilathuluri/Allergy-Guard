import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { analyzeMenuItems } from '../lib/gemini';
import { createWorker } from 'tesseract.js';
import { Allergy } from '../types';
import { Utensils, Upload, Loader2 } from 'lucide-react';

export default function RestaurantMenuScanner() {
  const { user } = useAuth();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAllergies, setFetchingAllergies] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllergies = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('allergies')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setAllergies(data || []);
      } catch (error) {
        console.error('Error fetching allergies:', error);
        setError('Failed to fetch your allergies. Please try again.');
      } finally {
        setFetchingAllergies(false);
      }
    };

    fetchAllergies();
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setExtractedText(null);
      setAnalysis(null);
    }
  };

  const handleScanMenu = async () => {
    if (!image) {
      setError('Please select an image to scan');
      return;
    }

    if (allergies.length === 0) {
      setError('Please add at least one allergy before scanning');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Initialize Tesseract worker
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      // Recognize text from image
      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();
      
      setExtractedText(text);
      
      // Get user's allergies
      const allergyNames = allergies.map(a => a.name);
      
      // Analyze menu with Gemini
      const menuAnalysis = await analyzeMenuItems(text, allergyNames);
      setAnalysis(menuAnalysis);
      
      // Save scan to history
      if (user) {
        await supabase.from('scan_history').insert({
          user_id: user.id,
          product_name: `Menu: ${restaurantName || 'Unknown Restaurant'}`,
          ingredients: [text], // Store the full menu text
          matched_allergies: allergyNames,
          has_matches: true, // Always true for menus since we want to store them
          analysis: menuAnalysis
        });
      }
    } catch (err) {
      console.error('Error processing menu:', err);
      setError('Failed to process the menu. Please try again with a clearer image.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingAllergies) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-8">
          <Utensils className="h-8 w-8 mr-2 text-indigo-600" />
          Restaurant Menu Scanner
        </h1>

        {allergies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Utensils className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No allergies added yet</h3>
            <p className="text-gray-500 mb-6">
              Add your food allergies first to scan restaurant menus.
            </p>
            <a
              href="/allergies"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add Your Allergies
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-1">
                Restaurant Name (Optional)
              </label>
              <input
                type="text"
                id="restaurantName"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Joe's Diner"
              />
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Allergies</h2>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy) => (
                  <span
                    key={allergy.id}
                    className={`px-3 py-1 rounded-full text-sm ${
                      allergy.severity === 'severe'
                        ? 'bg-red-100 text-red-800'
                        : allergy.severity === 'moderate'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {allergy.name}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Menu Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {imagePreview ? (
                  <div className="text-center">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="mx-auto h-64 object-contain mb-4" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <button
                onClick={handleScanMenu}
                disabled={!image || loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Analyzing Menu...
                  </>
                ) : (
                  <>
                    <Utensils className="h-5 w-5 mr-2" />
                    Analyze Menu
                  </>
                )}
              </button>
            </div>

            {analysis && (
              <div className="prose max-w-none">
                <div className="p-6 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {analysis}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}