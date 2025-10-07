import express from 'express';
import { getSoilData } from '../services/soil.js';
import { getWeatherData } from '../services/meteo.js';
import { getAIRecommendation, processSoilData, processWeatherData } from '../services/claude.js';
import { generatePDFReport, generateFilename } from '../services/pdfGenerator.js';

const router = express.Router();

// Input validation middleware
const validateCoordinates = (req, res, next) => {
  const { lat, lon } = req.body;
  
  if (lat === undefined || lon === undefined) {
    return res.status(400).json({
      error: 'Missing coordinates. Provide both latitude and longitude'
    });
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (isNaN(latNum) || isNaN(lonNum)) {
    return res.status(400).json({
      error: 'Invalid coordinates. Latitude and longitude must be numbers'
    });
  }

  if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
    return res.status(400).json({
      error: 'Invalid coordinates. Provide valid latitude (-90 to 90) and longitude (-180 to 180)'
    });
  }

  // Add validated numbers to request for later use
  req.validatedCoords = {
    lat: latNum,
    lon: lonNum
  };

  next();
};

// Main endpoint for reforestation analysis
router.post('/reforest', validateCoordinates, async (req, res) => {
  const startTime = Date.now();
  const { lat, lon } = req.validatedCoords;

  try {
    console.log(`🌱 Processing reforestation analysis for coordinates: ${lat}, ${lon}`);

    // Fetch all data in parallel with error handling
    const [soilResult, weatherResult] = await Promise.allSettled([
      getSoilData(lat, lon),
      getWeatherData(lat, lon)
    ]);

    // Process soil data with fallback
    let soilData, weatherData;
    let soilFallback = false;
    let weatherFallback = false;

    if (soilResult.status === 'fulfilled') {
      soilData = processSoilData(soilResult.value);
      console.log(`✅ Soil data retrieved: clay=${soilData.clay}%, sand=${soilData.sand}%, silt=${soilData.silt}%`);
    } else {
      console.warn('❌ Failed to fetch soil data, using fallback:', soilResult.reason.message);
      soilData = processSoilData(null); // This will use default values
      soilFallback = true;
    }

    if (weatherResult.status === 'fulfilled') {
      weatherData = processWeatherData(weatherResult.value);
      console.log(`✅ Weather data retrieved: temp=${weatherData.temperature}°C, precip=${weatherData.precipitation}mm`);
    } else {
      console.warn('❌ Failed to fetch weather data, using fallback:', weatherResult.reason.message);
      weatherData = processWeatherData(null); // This will use default values
      weatherFallback = true;
    }

    // Get AI recommendation
    const aiRecommendation = await getAIRecommendation(lat, lon, soilData, weatherData);
    
    const processingTime = Date.now() - startTime;

    // Return complete analysis
    const response = {
      coordinates: { lat, lon },
      dataSources: {
        soil: soilFallback ? 'fallback' : 'api',
        weather: weatherFallback ? 'fallback' : 'api',
        ai: aiRecommendation.source
      },
      soil: {
        ...soilData,
        note: soilFallback ? 'Fallback data used - soil API unavailable' : undefined
      },
      weather: {
        ...weatherData,
        note: weatherFallback ? 'Fallback data used - weather API unavailable' : undefined
      },
      recommendation: aiRecommendation,
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Analysis completed in ${processingTime}ms for (${lat}, ${lon})`);
    res.json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Error in reforest endpoint for (${lat}, ${lon}):`, error.message);

    // More specific error responses
    if (error.type === 'VALIDATION_ERROR') {
      return res.status(400).json({
        error: 'Data validation failed',
        message: error.message,
        processingTime: `${processingTime}ms`
      });
    }

    res.status(500).json({
      error: 'Failed to generate reforestation analysis',
      message: error.message,
      processingTime: `${processingTime}ms`
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ReForecaster API',
    timestamp: new Date().toISOString()
  });
});

// Endpoint to get supported biomes (useful for frontend)
router.get('/biomes', (req, res) => {
  res.json({
    biomes: [
      {
        name: 'tropical',
        range: 'Latitude: -35° to 35°',
        description: 'Warm climates near equator'
      },
      {
        name: 'temperate', 
        range: 'Latitude: 35° to 60°',
        description: 'Moderate climates with distinct seasons'
      },
      {
        name: 'boreal',
        range: 'Latitude: 60° to 90°', 
        description: 'Cold climates with coniferous forests'
      }
    ]
  });
});

// Endpoint to generate and download PDF report
router.post('/download-pdf', async (req, res) => {
  try {
    const { analysisData } = req.body;

    if (!analysisData) {
      return res.status(400).json({
        error: 'No analysis data provided'
      });
    }

    console.log(`📄 Generating PDF for coordinates: ${analysisData.coordinates.lat}, ${analysisData.coordinates.lon}`);

    // Generate PDF
    const pdfBuffer = await generatePDFReport(analysisData);
    const filename = generateFilename(analysisData.coordinates);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    console.log(`✅ PDF generated successfully: ${filename}`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      error: 'Failed to generate PDF report',
      message: error.message
    });
  }
});

export default router;