import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get popular species
router.get('/popular', authenticateToken, async (req, res) => {
  try {
    const popularSpecies = [
      {
        id: 'acacia-tortilis',
        scientificName: 'Acacia tortilis',
        commonName: 'Umbrella Thorn',
        family: 'Fabaceae',
        description: 'Drought-resistant tree native to Africa, known for its distinctive umbrella-shaped canopy.',
        imageUrl: 'https://i.pinimg.com/736x/f6/af/eb/f6afebcd3c3350070a595d0750b2d47e.jpg',
        source: 'popular'
      },
      {
        id: 'adansonia-digitata',
        scientificName: 'Adansonia digitata',
        commonName: 'Baobab',
        family: 'Malvaceae',
        description: 'Iconic African tree with a massive trunk that stores water.',
        imageUrl: 'https://i.pinimg.com/736x/13/e9/06/13e90653f4c62c9dedf1fb976b46d1cb.jpg',
        source: 'popular'
      },
      {
        id: 'quercus-robur',
        scientificName: 'Quercus robur',
        commonName: 'English Oak',
        family: 'Fagaceae',
        description: 'Large deciduous tree native to Europe, valued for its strong timber and ecological importance.',
        imageUrl: 'https://i.pinimg.com/736x/eb/d1/ee/ebd1ee6817555b3886614f479797fb76.jpg',
        source: 'popular'
      }
    ];

    res.json({ species: popularSpecies });
  } catch (error) {
    console.error('Get popular species error:', error);
    res.status(500).json({
      error: 'Failed to fetch popular species',
      message: 'Could not retrieve species data'
    });
  }
});

// Search species
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        error: 'Missing query parameter',
        message: 'Search query is required'
      });
    }

    // Mock search results - in production, this would call external APIs
    const searchResults = [
      {
        id: `gbif-${Math.random().toString(36).substr(2, 9)}`,
        scientificName: query.charAt(0).toUpperCase() + query.slice(1) + ' species',
        commonName: `Common ${query}`,
        family: 'Various',
        description: `Information about ${query} tree species.`,
        imageUrl: 'https://images.unsplash.com/photo-1570458436416-b8c9ccbd37f9?w=320&h=320&fit=crop',
        source: 'gbif'
      }
    ];

    res.json({ results: searchResults });
  } catch (error) {
    console.error('Search species error:', error);
    res.status(500).json({
      error: 'Failed to search species',
      message: 'Could not search for species'
    });
  }
});

// Get species details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Mock species details - in production, this would fetch from external APIs
    const speciesDetails = {
      id,
      scientificName: 'Species Scientific Name',
      commonName: 'Common Name',
      family: 'Family Name',
      description: 'Detailed description of the species...',
      habitat: 'Native habitat information',
      growthRate: 'Medium',
      matureHeight: '15-25m',
      soilType: 'Well-drained soils',
      waterNeeds: 'Moderate',
      imageUrl: 'https://images.unsplash.com/photo-1570458436416-b8c9ccbd37f9?w=320&h=320&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1570458436416-b8c9ccbd37f9?w=320&h=320&fit=crop'
      ]
    };

    res.json({ species: speciesDetails });
  } catch (error) {
    console.error('Get species details error:', error);
    res.status(500).json({
      error: 'Failed to fetch species details',
      message: 'Could not retrieve species information'
    });
  }
});

export default router;