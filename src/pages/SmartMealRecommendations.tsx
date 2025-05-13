import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getMealRecommendations } from '../lib/gemini';
import { Allergy } from '../types';
import { ChefHat, Loader2 } from 'lucide-react';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];
const cuisines = [
  'Any',
  'Italian',
  'Mexican',
  'Chinese',
  'Indian',
  'Japanese',
  'Mediterranean',
  'American',
  'Thai',
  'French'
];

export default function SmartMealRecommendations() {
  const { user } = useAuth();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState(mealTypes[0]);
  const [selectedCuisine, setSelectedCuisine] = useState(cuisines[0]);
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
      }
    };

    fetchAllergies();
  }, [user]);

  const handleGetRecommendations = async () => {
    if (allergies.length === 0) {
      setError('Please add your allergies first to get personalized recommendations.');
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const allergyNames = allergies.map(a => a.name);
      const cuisine = selectedCuisine === 'Any' ? undefined : selectedCuisine;
      const result = await getMealRecommendations(allergyNames, selectedMealType.toLowerCase(), cuisine);
      setRecommendations(result);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-8">
          <ChefHat className="h-8 w-8 mr-2 text-indigo-600" />
          Smart Meal Recommendations
        </h1>

        {allergies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ChefHat className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No allergies added yet</h3>
            <p className="text-gray-500 mb-6">
              Add your food allergies first to get personalized meal recommendations.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type
                </label>
                <select
                  id="mealType"
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {mealTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine (Optional)
                </label>
                <select
                  id="cuisine"
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {cuisines.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>
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

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-center mb-6">
              <button
                onClick={handleGetRecommendations}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Generating Recommendations...
                  </>
                ) : (
                  'Get Recommendations'
                )}
              </button>
            </div>

            {recommendations && (
              <div className="prose max-w-none">
                <div className="p-6 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {recommendations}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}