// services/speciesApi.js
/**
 * Fetches species data from multiple APIs with improved Wikipedia & vernacular name support
 */

const speciesCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000;

const POPULAR_SPECIES_IMAGES = {
  'acacia-tortilis': 'https://i.pinimg.com/736x/f6/af/eb/f6afebcd3c3350070a595d0750b2d47e.jpg',
  'adansonia-digitata': 'https://i.pinimg.com/736x/13/e9/06/13e90653f4c62c9dedf1fb976b46d1cb.jpg',
  'quercus-robur': 'https://i.pinimg.com/736x/eb/d1/ee/ebd1ee6817555b3886614f479797fb76.jpg',
  'pinus-sylvestris': 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=320&h=320&fit=crop',
  'eucalyptus-globulus': 'https://i.pinimg.com/736x/05/3f/e0/053fe0119f756964ef026d5e562abd39.jpg',
  'terminalia-brownii': 'https://images.unsplash.com/photo-1570458436416-b8c9ccbd37f9?w=320&h=320&fit=crop',
};

const COMMON_NAME_MAPPING = {
  'acacia': 'Acacia',
  'baobab': 'Adansonia',
  'oak': 'Oak',             // <-- add mapping for oak
  'pine': 'Pine',
  'eucalyptus': 'Eucalyptus',
  'mahogany': 'Mahogany',
  'teak': 'Teak',
  'neem': 'Azadirachta_indica',
  'olive': 'Olive',
  'maple': 'Maple',
  'birch': 'Birch',
  'walnut': 'Walnut',
  'willow': 'Willow',
  'poplar': 'Poplar',
  'cedar': 'Cedar',
  'cypress': 'Cypress',
  'redwood': 'Sequoioideae',
  'sequoia': 'Sequoioideae',
  'magnolia': 'Magnolia',
  'dogwood': 'Cornus',
  'sycamore': 'Platanus'
};

export async function searchSpecies(query) {
  const key = `search-${query.toLowerCase()}`;
  const cached = speciesCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    console.log(`searchSpecies: query = "${query}"`);

    // Clean the query
    const cleanQuery = cleanScientificName(query);

    // Call GBIF: we include vernacular names matching, not just scientific names
    const gbifResults = await searchGBIFSpecies(query, cleanQuery);

    // Enhance with Wikipedia where possible
    const enhanced = await Promise.all(
      gbifResults.map(async sp => {
        try {
          const wiki = await getWikipediaDataForSpecies(sp);
          if (wiki) {
            return { ...sp, ...wiki };
          }
        } catch (e) {
          console.warn('Wiki enhance failed for', sp.scientificName, e);
        }
        return sp;
      })
    );

    speciesCache.set(key, { data: enhanced, timestamp: Date.now() });
    return enhanced;

  } catch (err) {
    console.error('searchSpecies error', err);
    return [];
  }
}

async function searchGBIFSpecies(rawQuery, cleanQuery) {
  try {
    const params = new URLSearchParams();
    params.set('q', rawQuery);
    params.set('rank', 'SPECIES');
    params.set('status', 'ACCEPTED');
    params.set('limit', '10');

    const url = `https://api.gbif.org/v1/species/search?${params.toString()}`;
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!resp.ok) {
      throw new Error(`GBIF species search failed: ${resp.status}`);
    }
    
    const json = await resp.json();

    const results = (json.results || [])
      .filter(sp =>
        sp.kingdom === 'Plantae' &&
        sp.taxonomicStatus === 'ACCEPTED' &&
        sp.rank === 'SPECIES'
      )
      .map(sp => ({
        id: sp.key,
        scientificName: sp.scientificName,
        commonName: sp.vernacularName || getBestCommonName(sp.scientificName),
        family: sp.family,
        order: sp.order,
        kingdom: sp.kingdom,
        rank: sp.rank,
        description: `A tree species in family ${sp.family || 'N/A'}.`,
        source: 'gbif',
        imageUrl: null,
        images: [],
        gbifUrl: `https://www.gbif.org/species/${sp.key}`
      }));

    // Fetch images with better error handling
    const withImages = await Promise.all(
      results.map(async sp => {
        try {
          const imgs = await getGBIFImages(sp.id);
          if (imgs && imgs.length) {
            sp.images = imgs;
            sp.imageUrl = imgs[0].url;
          } else {
            const predefined = getPredefinedImage(sp.scientificName, sp.commonName);
            if (predefined) {
              sp.imageUrl = predefined;
            }
          }
        } catch (e) {
          console.warn('Image fetch error for', sp.scientificName, e.message);
        }
        return sp;
      })
    );

    return withImages;
  } catch (error) {
    console.error('GBIF species search error:', error.message);
    return [];
  }
}

async function getWikipediaDataForSpecies(sp) {
  // Try common name first
  if (sp.commonName) {
    const lower = sp.commonName.toLowerCase();
    if (COMMON_NAME_MAPPING[lower]) {
      const mapped = COMMON_NAME_MAPPING[lower];
      const wiki = await fetchWikipediaSummary(mapped);
      if (wiki) return wiki;
    }
  }
  // Next try genus
  const genus = sp.scientificName.split(' ')[0];
  const wiki = await fetchWikipediaSummary(genus);
  if (wiki) return wiki;
  return null;
}

async function fetchWikipediaSummary(title) {
  try {
    const resp = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return {
      description: data.extract,
      imageUrl: data.thumbnail?.source,
      wikipediaUrl: data.content_urls?.desktop?.page
    };
  } catch (e) {
    return null;
  }
}

async function getGBIFImages(speciesKey) {
  try {
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const resp = await fetch(`https://api.gbif.org/v1/species/${speciesKey}/media`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!resp.ok) {
      if (resp.status === 400) {
        console.warn(`GBIF API returned 400 for species ${speciesKey}, likely invalid key`);
        return [];
      }
      throw new Error(`GBIF API error: ${resp.status}`);
    }
    
    const js = await resp.json();
    return (js.results || [])
      .filter(m => m.type === 'StillImage' && m.identifier)
      .slice(0, 3)
      .map(m => ({
        url: m.identifier,
        source: m.publisher,
        license: m.license,
        creator: m.creator
      }));
  } catch (e) {
    if (e.name === 'TimeoutError') {
      console.warn(`GBIF image fetch timeout for species ${speciesKey}`);
    } else {
      console.warn(`GBIF image fetch error for species ${speciesKey}:`, e.message);
    }
    return [];
  }
}

function cleanScientificName(name) {
  if (!name) return '';
  return name
    .replace(/\([^)]*\)/g, '')
    .replace(/subsp\..*$/, '')
    .replace(/var\..*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getBestCommonName(scientificName) {
  const genus = scientificName.split(' ')[0].toLowerCase();
  const map = {
    'quercus': 'Oak',
    'acacia': 'Acacia',
    'pinus': 'Pine',
    'eucalyptus': 'Eucalyptus',
    'ficus': 'Fig',
    'terminalia': 'Terminalia',
    'commiphora': 'Myrrh',
    'adansonia': 'Baobab',
    'swietenia': 'Mahogany',
    'tectona': 'Teak',
    'azadirachta': 'Neem',
    'olea': 'Olive',
    'juglans': 'Walnut',
    'betula': 'Birch',
    'acer': 'Maple',
    'populus': 'Poplar',
    'salix': 'Willow'
  };
  return map[genus] || scientificName;
}

function getPredefinedImage(scientificName, commonName) {
  const key = scientificName.toLowerCase().replace(/\s+/g, '-');
  if (POPULAR_SPECIES_IMAGES[key]) {
    return POPULAR_SPECIES_IMAGES[key];
  }
  if (commonName) {
    const ck = commonName.toLowerCase().replace(/\s+/g, '-');
    if (POPULAR_SPECIES_IMAGES[ck]) {
      return POPULAR_SPECIES_IMAGES[ck];
    }
  }
  return null;
}

/**
 * Return a list of popular species
 */
export function getPopularSpecies() {
  return [
    {
      id: 'acacia-tortilis',
      scientificName: 'Acacia tortilis',
      commonName: 'Umbrella Thorn',
      family: 'Fabaceae',
      description: 'Drought-resistant tree native to Africa, known for its distinctive umbrella-shaped canopy.',
      imageUrl: POPULAR_SPECIES_IMAGES['acacia-tortilis'],
      source: 'popular'
    },
    {
      id: 'adansonia-digitata',
      scientificName: 'Adansonia digitata',
      commonName: 'Baobab',
      family: 'Malvaceae',
      description: 'Iconic African tree with a massive trunk that stores water.',
      imageUrl: POPULAR_SPECIES_IMAGES['adansonia-digitata'],
      source: 'popular'
    },
    {
      id: 'quercus-robur',
      scientificName: 'Quercus robur',
      commonName: 'English Oak',
      family: 'Fagaceae',
      description: 'Large deciduous tree native to Europe, valued for its strong timber and ecological importance.',
      imageUrl: POPULAR_SPECIES_IMAGES['quercus-robur'],
      source: 'popular'
    },
    {
      id: 'pinus-sylvestris',
      scientificName: 'Pinus sylvestris',
      commonName: 'Scots Pine',
      family: 'Pinaceae',
      description: 'Hardy coniferous tree tolerant of poor soils and cold climates.',
      imageUrl: POPULAR_SPECIES_IMAGES['pinus-sylvestris'],
      source: 'popular'
    },
    {
      id: 'eucalyptus-globulus',
      scientificName: 'Eucalyptus globulus',
      commonName: 'Blue Gum',
      family: 'Myrtaceae',
      description: 'Fast-growing tree native to Australia, used for timber.',
      imageUrl: POPULAR_SPECIES_IMAGES['eucalyptus-globulus'],
      source: 'popular'
    },
    {
      id: 'terminalia-brownii',
      scientificName: 'Terminalia brownii',
      commonName: 'Terminalia',
      family: 'Combretaceae',
      description: 'African tree species valued for timber and soil stabilization.',
      imageUrl: POPULAR_SPECIES_IMAGES['terminalia-brownii'],
      source: 'popular'
    }
  ];
}

export async function getSpeciesDetails(speciesId, speciesData) {
  const cacheKey = `details-${speciesId}`;
  const cached = speciesCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const details = { ...speciesData };

  // Always try to fetch more images
  try {
    const imgs = await getGBIFImages(speciesId);
    if (imgs && imgs.length) {
      details.images = imgs;
      if (!details.imageUrl) {
        details.imageUrl = imgs[0].url;
      }
    }
  } catch (e) {
    console.warn('getSpeciesDetails image fetch error', e);
  }

  // Try Wikipedia if better description/thumbnail
  try {
    const wiki = await getWikipediaDataForSpecies(details);
    if (wiki) {
      if (wiki.description) {
        details.description = wiki.description;
      }
      if (wiki.imageUrl && !details.imageUrl) {
        details.imageUrl = wiki.imageUrl;
      }
      if (wiki.wikipediaUrl) {
        details.wikipediaUrl = wiki.wikipediaUrl;
      }
    }
  } catch (e) {
    console.warn('getSpeciesDetails wiki error', e);
  }

  // fallback image
  if (!details.imageUrl) {
    const predefined = getPredefinedImage(details.scientificName, details.commonName);
    if (predefined) {
      details.imageUrl = predefined;
    }
  }

  speciesCache.set(cacheKey, { data: details, timestamp: Date.now() });
  return details;
}
