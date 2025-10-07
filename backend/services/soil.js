// services/soil.js
import fetch from 'node-fetch';

const SOIL_CONFIG = {
  timeout: 4000, // 4 seconds max for soil API
  cacheTTL: 30 * 60 * 1000, // 30 minutes
};

// Cache for soil data
const soilCache = new Map();

/**
 * Faster soil data with quick fallbacks
 */
export async function getSoilData(lat, lon) {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  
  // Check cache first
  const cached = soilCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < SOIL_CONFIG.cacheTTL) {
    return cached.data;
  }

  try {
    // Try fast soil classification first
    const soil = await getFastSoilClassification(lat, lon);
    const result = {
      ...soil,
      source: 'SoilGrids API',
      retrieved: new Date().toISOString()
    };
    
    // Cache successful result
    soilCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.warn(`Soil API failed for (${lat}, ${lon}):`, error.message);
    
    // Use intelligent fallback based on location
    const fallbackData = getIntelligentSoilData(lat, lon);
    return {
      ...fallbackData,
      source: 'Regional Estimate',
      note: 'Soil API unavailable - using regional averages'
    };
  }
}

/**
 * Faster soil classification endpoint
 */
async function getFastSoilClassification(lat, lon) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SOIL_CONFIG.timeout);

  try {
    // Try the classification endpoint first (usually faster)
    const response = await fetch(
      `https://rest.isric.org/soilgrids/v2.0/classification?lon=${lon}&lat=${lat}`,
      { signal: controller.signal }
    );

    if (response.ok) {
      const data = await response.json();
      const soilType = data?.properties?.[0]?.value;
      return getSoilCompositionByType(soilType, lat, lon);
    }
    
    throw new Error('Classification endpoint failed');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get soil composition based on soil type and location
 */
function getSoilCompositionByType(soilType, lat, lon) {
  const baseCompositions = {
    'Acrisol': { clay: 35, sand: 40, silt: 25 },
    'Alisol': { clay: 40, sand: 30, silt: 30 },
    'Arenosol': { clay: 8, sand: 85, silt: 7 },
    'Cambisol': { clay: 25, sand: 45, silt: 30 },
    'Chernozem': { clay: 30, sand: 35, silt: 35 },
    'Ferralsol': { clay: 45, sand: 25, silt: 30 },
    'Fluvisol': { clay: 28, sand: 42, silt: 30 },
    'Gleysol': { clay: 35, sand: 35, silt: 30 },
    'Kastanozem': { clay: 25, sand: 50, silt: 25 },
    'Luvisol': { clay: 32, sand: 38, silt: 30 },
    'Phaeozem': { clay: 30, sand: 40, silt: 30 },
    'Podzol': { clay: 12, sand: 75, silt: 13 },
    'Regosol': { clay: 15, sand: 70, silt: 15 },
    'Solonchak': { clay: 25, sand: 45, silt: 30 },
    'Vertisol': { clay: 55, sand: 20, silt: 25 }
  };

  // Default to regional data if soil type not found
  return baseCompositions[soilType] || getIntelligentSoilData(lat, lon);
}

/**
 * Intelligent soil data based on geographic patterns
 */
function getIntelligentSoilData(lat, lon) {
  // Africa-specific patterns
  const isWestAfrica = lat > 5 && lat < 20 && lon > -20 && lon < 20;
  const isEastAfrica = lat > -10 && lat < 15 && lon > 25 && lon < 50;
  const isSouthernAfrica = lat < -10 && lon > 10 && lon < 40;
  const isNorthAfrica = lat > 20 && lon > -20 && lon < 40;
  
  // Central/South America
  const isAmazon = lat > -15 && lat < 5 && lon > -80 && lon < -45;
  const isCentralAmerica = lat > 10 && lat < 25 && lon > -100 && lon < -75;
  
  // Asia
  const isSoutheastAsia = lat > -10 && lat < 25 && lon > 90 && lon < 130;
  const isSouthAsia = lat > 5 && lat < 35 && lon > 65 && lon < 90;

  if (isWestAfrica) return { clay: 22, sand: 60, silt: 18 }; // Sandy loam
  if (isEastAfrica) return { clay: 25, sand: 55, silt: 20 }; // Sandy clay loam
  if (isSouthernAfrica) return { clay: 18, sand: 65, silt: 17 }; // Sandy
  if (isNorthAfrica) return { clay: 15, sand: 75, silt: 10 }; // Desert sand
  if (isAmazon) return { clay: 35, sand: 40, silt: 25 }; // Clay loam
  if (isCentralAmerica) return { clay: 28, sand: 45, silt: 27 }; // Loam
  if (isSoutheastAsia) return { clay: 32, sand: 38, silt: 30 }; // Clay loam
  if (isSouthAsia) return { clay: 30, sand: 42, silt: 28 }; // Loam

  // Default regional patterns by latitude
  if (Math.abs(lat) < 15) return { clay: 25, sand: 50, silt: 25 }; // Tropical
  if (Math.abs(lat) < 35) return { clay: 20, sand: 55, silt: 25 }; // Subtropical
  if (Math.abs(lat) < 55) return { clay: 25, sand: 40, silt: 35 }; // Temperate
  return { clay: 15, sand: 60, silt: 25 }; // Boreal/other
}