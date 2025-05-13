import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload, AlertTriangle, Check } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { analyzeIngredients } from '../lib/gemini';
import { Allergy } from '../types';

export default function ScanProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAllergies, setFetchingAllergies] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<{
    text: string;
    hasMatches: boolean;
    matchedAllergies: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanComplete, setScanComplete] = useState(false);

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
      setIngredients([]);
      setAnalysis(null);
      setScanComplete(false);
    }
  };

  const extractIngredients = (text: string): string[] => {
    // Split by common delimiters and clean up
    const rawIngredients = text
      .replace(/ingredients:/i, '')
      .split(/[,;:]/)
      .map(item => item.trim())
      .filter(item => item.length > 1);
    
    return rawIngredients;
  };

  const processImage = async () => {
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
      
      // Extract ingredients from text
      const extractedIngredients = extractIngredients(text);

      // Modified condition and message
      if (!extractedIngredients || 
          extractedIngredients.length === 0 || 
          extractedIngredients.some(ing => ing.length < 2 || /^[^a-zA-Z]*$/.test(ing))) {
        setIngredients([]);
        setAnalysis({
          hasMatches: false,
          matchedAllergies: [],
          text: 'Upload the correct image of ingredients'
        });
        setScanComplete(true);
        return;
      }

      setIngredients(extractedIngredients);
      
      // Get user's allergies
      const allergyNames = allergies.map(a => a.name.toLowerCase());
      
      // Analyze ingredients with Gemini
      const analysisResult = await analyzeIngredients(extractedIngredients, allergyNames);
      setAnalysis(analysisResult);
      
      // Save scan to history
      if (user) {
        await supabase.from('scan_history').insert({
          user_id: user.id,
          product_name: productName || 'Unnamed Product',
          ingredients: extractedIngredients,
          matched_allergies: analysisResult.matchedAllergies,
          has_matches: analysisResult.hasMatches,
          analysis: analysisResult.text
        });
      }
      
      setScanComplete(true);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process the image. Please try again with a clearer image.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = () => {
    navigate('/history');
  };

  const handleScanAnother = () => {
    setImage(null);
    setImagePreview(null);
    setProductName('');
    setExtractedText(null);
    setIngredients([]);
    setAnalysis(null);
    setScanComplete(false);
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
          <Search className="h-8 w-8 mr-2 text-indigo-600" />
          Scan Product
        </h1>

        {allergies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No allergies added yet</h3>
            <p className="text-gray-500 mb-6">
              You need to add your allergies before scanning products.
            </p>
            <button
              onClick={() => navigate('/allergies')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add Your Allergies
            </button>
          </div>
        ) : scanComplete ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center mb-6">
              {analysis?.hasMatches ? (
                <div className="bg-red-100 text-red-800 p-3 rounded-full">
                  <AlertTriangle className="h-8 w-8" />
                </div>
              ) : (
                <div className="bg-green-100 text-green-800 p-3 rounded-full">
                  <Check className="h-8 w-8" />
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2">
              {analysis?.hasMatches ? 'Allergens Detected' : 'No Allergens Detected'}
            </h2>
            
            <p className="text-center text-gray-600 mb-6">
              {productName || 'Unnamed Product'}
            </p>
            
            {analysis?.hasMatches && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Matched Allergies:</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedAllergies.map((allergy, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Analysis:</h3>
              <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                {analysis?.text}
              </div>
            </div>
            
            {ingredients.length > 0 && 
             ingredients.some(ing => ing.length >= 2) && 
             !analysis?.text.includes('Upload the correct Image') && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Ingredients:</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <ul className="list-disc pl-5 space-y-1">
                    {ingredients.map((ingredient, index) => (
                      <li key={index} className={analysis?.matchedAllergies.some(a => 
                        ingredient.toLowerCase().includes(a.toLowerCase())
                      ) ? 'text-red-600 font-semibold' : ''}>
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleScanAnother}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Scan Another Product
              </button>
              <button
                onClick={handleViewHistory}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View Scan History
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name (Optional)
              </label>
              <input
                type="text"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Chocolate Chip Cookies"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Ingredients Image
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
            
            <div className="flex justify-center">
              <button
                onClick={processImage}
                disabled={!image || loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Scan Ingredients
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}