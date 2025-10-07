import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const AI_CONFIG = {
  model: 'claude-3-sonnet-20240229',
  maxTokens: 1024,
  temperature: 0.7,
  timeout: 30000, // 30 seconds
  fallbackEnabled: true
};

// Biome definitions for enhanced mock data
const BIOMES = {
  tropical: {
    minLat: -35,
    maxLat: 35,
    species: [
      'Acacia tortilis (Umbrella Thorn) - Drought resistant, nitrogen-fixing',
      'Commiphora africana (African Myrrh) - Medicinal, arid-adapted',
      'Terminalia brownii - Good for timber, soil stabilization',
      'Balanites aegyptiaca (Desert Date) - Edible fruits, very drought tolerant',
      'Faidherbia albida - Improves soil fertility, good for agroforestry'
    ],
    plantingSeason: 'Start of rainy season (March-April)',
    spacing: '4m x 4m for trees, 2m x 2m for shrubs'
  },
  temperate: {
    minLat: 35,
    maxLat: 60,
    species: [
      'Quercus robur (English Oak) - Long-lived, high biodiversity value',
      'Fagus sylvatica (European Beech) - Shade tolerant, soil improvement',
      'Betula pendula (Silver Birch) - Pioneer species, fast growing',
      'Acer pseudoplatanus (Sycamore) - Resilient, good for wildlife',
      'Crataegus monogyna (Hawthorn) - Hedge plant, bird habitat'
    ],
    plantingSeason: 'Late autumn or early spring',
    spacing: '5m x 5m for canopy trees, 3m x 3m for understory'
  },
  boreal: {
    minLat: 60,
    maxLat: 90,
    species: [
      'Picea abies (Norway Spruce) - Cold tolerant, windbreak',
      'Pinus sylvestris (Scots Pine) - Adaptable, poor soil tolerant',
      'Betula pubescens (Downy Birch) - Frost resistant, pioneer species',
      'Larix decidua (European Larch) - Deciduous conifer, durable wood',
      'Sorbus aucuparia (Rowan) - Berry-producing, bird attractant'
    ],
    plantingSeason: 'Early spring after frost',
    spacing: '3m x 3m for dense stands, 4m x 4m for mixed woodland'
  }
};

// Simple in-memory cache
const recommendationCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Custom error class
class AIRecommendationError extends Error {
  constructor(message, type = 'API_ERROR', originalError = null) {
    super(message);
    this.name = 'AIRecommendationError';
    this.type = type;
    this.originalError = originalError;
  }
}

// Logging utility
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  
  if (LOG_LEVEL === 'debug' || level === 'error' || level === 'warn') {
    console[level](logMessage);
  }
}

/**
 * Validates input parameters for the AI recommendation request
 */
function validateInput(lat, lon, soilData, weatherData) {
  if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) {
    throw new AIRecommendationError(
      `Invalid latitude: ${lat}. Must be a number between -90 and 90.`,
      'VALIDATION_ERROR'
    );
  }

  if (typeof lon !== 'number' || isNaN(lon) || lon < -180 || lon > 180) {
    throw new AIRecommendationError(
      `Invalid longitude: ${lon}. Must be a number between -180 and 180.`,
      'VALIDATION_ERROR'
    );
  }

  if (!soilData || typeof soilData !== 'object') {
    throw new AIRecommendationError(
      'Soil data must be provided as an object',
      'VALIDATION_ERROR'
    );
  }

  const requiredSoilProps = ['clay', 'sand', 'silt'];
  for (const prop of requiredSoilProps) {
    const value = soilData[prop];
    // Allow numbers with decimals and check range
    if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 100) {
      throw new AIRecommendationError(
        `Invalid soil.${prop}: ${value}. Must be a number between 0 and 100.`,
        'VALIDATION_ERROR'
      );
    }
  }

  // Check if soil composition sums to approximately 100% (with tolerance for decimals)
  const soilSum = soilData.clay + soilData.sand + soilData.silt;
  if (Math.abs(soilSum - 100) > 10) { // Increased tolerance to 10%
    log(`Soil composition sums to ${soilSum.toFixed(2)}% (expected ~100%)`, 'warn');
    // Don't throw error, just warn - soil data from APIs often doesn't sum exactly to 100%
  }

  if (!weatherData || typeof weatherData !== 'object') {
    throw new AIRecommendationError(
      'Weather data must be provided as an object',
      'VALIDATION_ERROR'
    );
  }

  const requiredWeatherProps = ['temperature', 'precipitation', 'maxTemperature', 'minTemperature'];
  for (const prop of requiredWeatherProps) {
    const value = weatherData[prop];
    if (typeof value !== 'number' || isNaN(value)) {
      throw new AIRecommendationError(
        `Invalid weather.${prop}: ${value}. Must be a number.`,
        'VALIDATION_ERROR'
      );
    }
  }

  log(`Input validation passed for coordinates (${lat}, ${lon})`, 'debug');
}

/**
 * Safely parses numeric values from API responses
 */
function safeParseNumber(value, defaultValue = 0) {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Processes and normalizes soil data from external APIs
 */
export function processSoilData(soilData) {
  if (!soilData || typeof soilData !== 'object') {
    log('No soil data provided, using fallback values', 'warn');
    return { clay: 25, sand: 40, silt: 35 }; // Default balanced soil
  }

  // Handle different API response structures
  let clay, sand, silt;

  // SoilGrids API structure
  if (soilData.properties && Array.isArray(soilData.properties)) {
    const properties = {};
    soilData.properties.forEach(prop => {
      if (prop.name === 'clay') properties.clay = prop.depths[0]?.values?.mean;
      if (prop.name === 'sand') properties.sand = prop.depths[0]?.values?.mean;
      if (prop.name === 'silt') properties.silt = prop.depths[0]?.values?.mean;
    });
    
    clay = safeParseNumber(properties.clay, 25);
    sand = safeParseNumber(properties.sand, 40);
    silt = safeParseNumber(properties.silt, 35);
  }
  // Direct property structure
  else {
    clay = safeParseNumber(soilData.clay, 25);
    sand = safeParseNumber(soilData.sand, 40);
    silt = safeParseNumber(soilData.silt, 35);
  }

  // Normalize to sum to 100% if needed
  const sum = clay + sand + silt;
  if (sum > 0 && Math.abs(sum - 100) > 1) {
    const factor = 100 / sum;
    clay = clay * factor;
    sand = sand * factor;
    silt = silt * factor;
  }

  return {
    clay: parseFloat(clay.toFixed(1)),
    sand: parseFloat(sand.toFixed(1)),
    silt: parseFloat(silt.toFixed(1))
  };
}

/**
 * Processes and normalizes weather data from external APIs
 */
export function processWeatherData(weatherData) {
  if (!weatherData || typeof weatherData !== 'object') {
    log('No weather data provided, using fallback values', 'warn');
    return { 
      temperature: 20, 
      precipitation: 500, 
      maxTemperature: 25, 
      minTemperature: 15 
    };
  }

  return {
    temperature: safeParseNumber(weatherData.temperature, 20),
    precipitation: safeParseNumber(weatherData.precipitation, 500),
    maxTemperature: safeParseNumber(weatherData.maxTemperature, 25),
    minTemperature: safeParseNumber(weatherData.minTemperature, 15)
  };
}

/**
 * Generates a cache key based on input parameters
 */
function getCacheKey(lat, lon, soilData, weatherData) {
  const soilKey = `${soilData.clay.toFixed(1)},${soilData.sand.toFixed(1)},${soilData.silt.toFixed(1)}`;
  const weatherKey = `${weatherData.temperature.toFixed(1)},${weatherData.precipitation.toFixed(1)}`;
  return `rec:${lat.toFixed(6)},${lon.toFixed(6)},${soilKey},${weatherKey}`;
}

/**
 * Gets AI recommendation from Claude or falls back to mock data
 */
export async function getAIRecommendation(lat, lon, soilData, weatherData) {
  const startTime = Date.now();
  
  try {
    // Process and normalize data first
    const processedSoilData = processSoilData(soilData);
    const processedWeatherData = processWeatherData(weatherData);

    log(`Processed soil data: clay=${processedSoilData.clay}%, sand=${processedSoilData.sand}%, silt=${processedSoilData.silt}%`, 'debug');
    log(`Processed weather data: temp=${processedWeatherData.temperature}°C, precip=${processedWeatherData.precipitation}mm`, 'debug');

    // Validate input with processed data
    validateInput(lat, lon, processedSoilData, processedWeatherData);

    // Check cache first
    const cacheKey = getCacheKey(lat, lon, processedSoilData, processedWeatherData);
    const cached = recommendationCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      log(`Returning cached recommendation for (${lat}, ${lon})`, 'debug');
      return { ...cached.data, cached: true };
    }

    // If no API key, return mock response
    if (!process.env.CLAUDE_API_KEY) {
      log('No Claude API key found, using mock AI response', 'warn');
      const mockResult = getMockRecommendation(lat, lon, processedSoilData, processedWeatherData);
      
      // Cache mock results too (shorter TTL)
      recommendationCache.set(cacheKey, {
        data: { ...mockResult, cached: false },
        timestamp: Date.now()
      });
      
      return mockResult;
    }

    const prompt = buildPrompt(lat, lon, processedSoilData, processedWeatherData);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout);

    log(`Calling Claude API for coordinates (${lat}, ${lon})`, 'debug');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
        system: 'You are ReForester, an expert environmental AI assistant specializing in reforestation and sustainable land management. Provide practical, scientifically-grounded advice for tree planting and soil improvement.',
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new AIRecommendationError(
        `Claude API error: ${response.status} ${response.statusText} - ${errorText}`,
        'API_ERROR'
      );
    }

    const data = await response.json();
    const processingTime = Date.now() - startTime;
    
    const result = {
      text: data.content[0].text,
      source: 'Claude AI',
      model: AI_CONFIG.model,
      processingTime: `${processingTime}ms`
    };

    // Cache successful API response
    recommendationCache.set(cacheKey, {
      data: { ...result, cached: false },
      timestamp: Date.now()
    });

    log(`AI recommendation generated in ${processingTime}ms for (${lat}, ${lon})`, 'debug');
    
    return result;

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      log(`Request timeout after ${processingTime}ms for (${lat}, ${lon})`, 'warn');
    } else if (error.type === 'VALIDATION_ERROR') {
      log(`Validation error: ${error.message}`, 'error');
      throw error; // Don't fallback on validation errors
    } else {
      log(`API error: ${error.message}`, 'warn');
    }

    if (AI_CONFIG.fallbackEnabled) {
      log('Falling back to mock response', 'warn');
      // Use processed data if available, otherwise use original data
      const processedSoilData = soilData ? processSoilData(soilData) : { clay: 25, sand: 40, silt: 35 };
      const processedWeatherData = weatherData ? processWeatherData(weatherData) : { 
        temperature: 20, precipitation: 500, maxTemperature: 25, minTemperature: 15 
      };
      
      const mockResult = getMockRecommendation(lat, lon, processedSoilData, processedWeatherData);
      return { ...mockResult, fallback: true, processingTime: `${processingTime}ms` };
    }
    
    throw new AIRecommendationError(
      `Failed to get AI recommendation: ${error.message}`,
      'FALLBACK_DISABLED',
      error
    );
  }
}

/**
 * Builds the prompt for Claude AI
 */
function buildPrompt(lat, lon, soil, weather) {
  return `
You are an environmental AI assistant called ReForester.

Given the following real environmental data:
- Coordinates: (${lat}, ${lon})
- Soil Composition: clay ${soil.clay}%, sand ${soil.sand}%, silt ${soil.silt}%
- Current Weather: temperature ${weather.temperature}°C, precipitation ${weather.precipitation}mm
- Climate Data: max temp ${weather.maxTemperature}°C, min temp ${weather.minTemperature}°C, annual precipitation ~${weather.precipitation}mm

Please provide a comprehensive reforestation strategy for this location. Include:

1. **Recommended Native Tree Species** (3-5 species suitable for these conditions)
2. **Planting Strategy** (season, spacing, companion planting)
3. **Soil Preparation** (based on the soil composition)
4. **Water Management** (irrigation needs, rainwater harvesting)
5. **Maintenance Plan** (first year care, protection from elements)
6. **Expected Benefits** (soil improvement, biodiversity, carbon sequestration)

Focus on sustainability, water efficiency, and long-term soil improvement. Be specific and practical in your recommendations.

Return your answer in clear, organized plain text suitable for landowners and conservationists.
`;
}

/**
 * Determines the biome based on latitude
 */
function determineBiome(lat) {
  if (lat >= BIOMES.boreal.minLat) return 'boreal';
  if (lat >= BIOMES.temperate.minLat) return 'temperate';
  return 'tropical';
}

/**
 * Provides mock AI recommendations when Claude is unavailable
 */
function getMockRecommendation(lat, lon, soil, weather) {
  const biome = determineBiome(lat);
  const biomeData = BIOMES[biome];
  
  const soilAnalysis = `
Your soil analysis (Clay: ${soil.clay}%, Sand: ${soil.sand}%, Silt: ${soil.silt}%) suggests:
${soil.clay > 30 ? '• Add organic matter to improve drainage and reduce compaction\n• Implement contour planting to prevent waterlogging' : ''}
${soil.sand > 70 ? '• Incorporate clay or compost to increase water retention\n• Use mulch heavily to reduce evaporation' : ''}
${soil.silt > 50 ? '• Use cover crops to stabilize soil structure\n• Avoid working soil when wet to prevent compaction' : ''}
${(soil.clay + soil.silt + soil.sand) < 95 ? '• Consider soil testing for micronutrients and pH balance' : ''}`.trim();

  return {
    text: `REFORESTATION STRATEGY FOR ${biome.toUpperCase()} REGION (${lat}, ${lon})

Based on your local conditions (Temperature: ${weather.temperature}°C, Rainfall: ${weather.precipitation}mm, Soil Type: ${biome} biome), here is a tailored reforestation approach:

🌳 RECOMMENDED NATIVE SPECIES:
${biomeData.species.map(species => `• ${species}`).join('\n')}

📋 PLANTING STRATEGY:
• Optimal planting season: ${biomeData.plantingSeason}
• Tree spacing: ${biomeData.spacing}
• Companion plants: Leguminous plants for nitrogen fixation, native grasses for ground cover
• Planting method: Dig pits 2x root ball size, mix native soil with compost

🌱 SOIL PREPARATION:
${soilAnalysis}

💧 WATER MANAGEMENT:
• Construct swales or contour bunds for water harvesting
• Use drip irrigation for first year establishment
• Mulch with 10-15cm organic material to retain moisture
• Design drainage for heavy rainfall events

🛠️ MAINTENANCE PLAN:
• First 3 months: Water twice weekly, monitor for pests
• Months 4-12: Water weekly during dry periods, weed control
• Year 2-3: Quarterly monitoring, formative pruning
• Protection: Tree guards against herbivores, wind protection if needed

✅ EXPECTED BENEFITS:
• Soil organic matter increase: 1-2% over 3 years
• Carbon sequestration: 4-8 tons CO2/hectare/year
• Biodiversity: Habitat creation for local wildlife
• Water regulation: Improved infiltration and reduced runoff
• Microclimate: Temperature moderation and wind protection

📊 MONITORING RECOMMENDATIONS:
• Monthly growth measurements for first year
• Soil health assessment every 6 months
• Biodiversity surveys annually
• Survival rate tracking at 6, 12, and 24 months

⚠️ CLIMATE CONSIDERATIONS:
Your local climate (${weather.minTemperature}°C to ${weather.maxTemperature}°C) requires species selection for temperature extremes. Ensure adequate water during establishment phase.

CONTACT LOCAL EXPERTS:
For species-specific recommendations, consult with local forestry departments, agricultural extension services, or native plant societies.

Source: ReForester AI Analysis (Mock Data - For demonstration)
Region: ${biome} biome | Coordinates: ${lat}, ${lon}`,
    source: 'Mock AI (No API Key)',
    model: 'mock-biome-based',
  };
}

/**
 * Utility function to clear cache (useful for testing)
 */
export function clearCache() {
  const clearedEntries = recommendationCache.size;
  recommendationCache.clear();
  log(`Cleared ${clearedEntries} cache entries`, 'debug');
  return clearedEntries;
}

/**
 * Get cache statistics (useful for monitoring)
 */
export function getCacheStats() {
  return {
    size: recommendationCache.size,
    maxAge: CACHE_TTL,
    entries: Array.from(recommendationCache.entries()).map(([key, value]) => ({
      key: key.substring(0, 50) + '...', // Truncate for security
      age: Date.now() - value.timestamp,
      ttlRemaining: CACHE_TTL - (Date.now() - value.timestamp)
    }))
  };
}