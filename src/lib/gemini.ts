import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function analyzeIngredients(ingredients: string[], allergies: string[]) {
  const matchedAllergies = allergies.filter(allergy => 
    ingredients.some(ingredient => 
      ingredient.toLowerCase().includes(allergy.toLowerCase())
    )
  );

  const hasMatches = matchedAllergies.length > 0;
  
  const prompt = hasMatches 
    ? `if ingredients are not found give me the response of Upload the correct Image of ingredients present
       I have allergies to: ${matchedAllergies.join(', ')}. I found these ingredients in a food product: ${ingredients.join(', ')}. 
       Please explain the potential risks, symptoms I might experience, and what medications or treatments I should consider. 
       Also provide advice on alternatives to this food.`
    : `I have allergies to: ${allergies.join(', ')}. I found these ingredients in a food product: ${ingredients.join(', ')}.
       Based on these ingredients, are they safe for me to consume? Please provide a brief analysis.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return {
      text: response.text(),
      hasMatches,
      matchedAllergies
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to analyze ingredients');
  }
}

export async function getMealRecommendations(allergies: string[], mealType: string, cuisine?: string) {
  const prompt = `I have allergies to: ${allergies.join(', ')}. 
    Please suggest 5 ${mealType} recipes${cuisine ? ` from ${cuisine} cuisine` : ''} that are safe for me to eat.
    For each recipe, provide:
    1. Recipe name
    2. Brief description
    3. Key ingredients (that are safe for my allergies)
    4. Basic preparation steps
    5. Any specific allergy-related notes or substitutions

    Format the response in a clear, structured way.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate meal recommendations');
  }
}

export async function analyzeMenuItems(menuText: string, allergies: string[]) {
  const prompt = `I have allergies to: ${allergies.join(', ')}. 
    Here is a restaurant menu:

    ${menuText}

    Please analyze each menu item and:
    1. Identify items that are likely safe for me to eat
    2. Flag items that might contain my allergens
    3. Suggest modifications to make risky items safe (if possible)
    4. Provide general advice for dining at this restaurant

    Format the response in clear sections.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to analyze menu items');
  }
}