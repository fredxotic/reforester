// services/pdfGenerator.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Colors for the PDF
const COLORS = {
  primary: '#059669',    // Emerald
  secondary: '#D97706',  // Amber
  accent: '#0369A1',     // Blue
  dark: '#1F2937',       // Gray-800
  light: '#6B7280',      // Gray-500
  background: '#F9FAFB'  // Gray-50
};

// Complete section mapping with ALL corrupted patterns
const SECTION_MAPPING = {
  // Species sections
  'RECOMMENDED NATIVE SPECIES': { icon: '🌳', name: 'RECOMMENDED NATIVE SPECIES' },
  '❷<B3': { icon: '🌳', name: 'RECOMMENDED NATIVE SPECIES' },
  
  // Planting strategy
  'PLANTING STRATEGY': { icon: '📋', name: 'PLANTING STRATEGY' },
  '❸=ÚÉ': { icon: '📋', name: 'PLANTING STRATEGY' },
  '❸=ÜÈ': { icon: '📋', name: 'PLANTING STRATEGY' },
  
  // Soil preparation
  'SOIL PREPARATION': { icon: '🌱', name: 'SOIL PREPARATION' },
  '❹<B1': { icon: '🌱', name: 'SOIL PREPARATION' },
  
  // Water management
  'WATER MANAGEMENT': { icon: '💧', name: 'WATER MANAGEMENT' },
  '❺=Ú§': { icon: '💧', name: 'WATER MANAGEMENT' },
  '❺=Ü§': { icon: '💧', name: 'WATER MANAGEMENT' },
  
  // Maintenance plan
  'MAINTENANCE PLAN': { icon: '🛠️', name: 'MAINTENANCE PLAN' },
  '❻=Pàp': { icon: '🛠️', name: 'MAINTENANCE PLAN' },
  'Ø=Pàp': { icon: '🛠️', name: 'MAINTENANCE PLAN' },
  '✔=Pàp': { icon: '🛠️', name: 'MAINTENANCE PLAN' },
  
  // Expected benefits
  'EXPECTED BENEFITS': { icon: '✅', name: 'EXPECTED BENEFITS' },
  
  // Monitoring
  'MONITORING RECOMMENDATIONS': { icon: '📊', name: 'MONITORING RECOMMENDATIONS' },
  'Ø=ÚË': { icon: '📊', name: 'MONITORING RECOMMENDATIONS' },
  '✔=ÚË': { icon: '📊', name: 'MONITORING RECOMMENDATIONS' },
  'Ø=ÜÊ': { icon: '📊', name: 'MONITORING RECOMMENDATIONS' },
  
  // Climate
  'CLIMATE CONSIDERATIONS': { icon: '⚠️', name: 'CLIMATE CONSIDERATIONS' },
  '& p': { icon: '⚠️', name: 'CLIMATE CONSIDERATIONS' },
  '& þ': { icon: '⚠️', name: 'CLIMATE CONSIDERATIONS' },
  
  // Contact
  'CONTACT LOCAL EXPERTS': { icon: '📍', name: 'CONTACT LOCAL EXPERTS' },
  'Ø=ÚÍ': { icon: '📍', name: 'CONTACT LOCAL EXPERTS' },
  'Ø=ÜÍ': { icon: '📍', name: 'CONTACT LOCAL EXPERTS' },
  '✔=ÜÎ': { icon: '📍', name: 'CONTACT LOCAL EXPERTS' }
};

/**
 * Generates a professional PDF report from analysis data
 */
export async function generatePDFReport(analysisData) {
  return new Promise((resolve, reject) => {
    try {
      // Validate required data
      if (!analysisData || !analysisData.coordinates) {
        throw new Error('Missing coordinates in analysis data');
      }

      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        info: {
          Title: 'ReForester Analysis Report',
          Author: 'ReForester AI',
          Subject: 'Professional Reforestation Strategy Report',
          CreationDate: new Date()
        }
      });

      // Create buffers to store PDF
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Cover Page
      createCoverPage(doc, analysisData.coordinates, analysisData.timestamp);
      
      // Location Analysis
      doc.addPage();
      createLocationAnalysisPage(doc, analysisData.coordinates, analysisData.dataSources);
      
      // Environmental Data
      doc.addPage();
      createEnvironmentalDataPage(doc, analysisData.soil, analysisData.weather);
      
      // Reforestation Strategy
      doc.addPage();
      createReforestationStrategyPage(doc, analysisData.recommendation);

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Creates an attractive cover page
 */
function createCoverPage(doc, coordinates, timestamp) {
  // Validate coordinates
  if (!coordinates || typeof coordinates.lat === 'undefined' || typeof coordinates.lon === 'undefined') {
    throw new Error('Invalid coordinates provided to createCoverPage');
  }

  // Background
  doc.rect(0, 0, doc.page.width, doc.page.height)
     .fill(COLORS.primary);
  
  // Main title
  doc.fillColor('#FFFFFF')
     .fontSize(36)
     .font('Helvetica-Bold')
     .text('REFORESTER', 50, 150, { align: 'center' });
  
  doc.fontSize(18)
     .text('AI-Powered Reforestation Analysis', 50, 200, { align: 'center' });
  
  // Decorative element
  doc.fillColor('#FFFFFF')
     .opacity(0.1)
     .circle(doc.page.width / 2, 350, 100)
     .fill();
  
  // Coordinates
  doc.fillColor('#FFFFFF')
     .fontSize(14)
     .font('Helvetica')
     .text(`Location: ${coordinates.lat.toFixed(6)}, ${coordinates.lon.toFixed(6)}`, 0, 450, { align: 'center' });
  
  // Date
  const displayDate = timestamp ? formatDate(timestamp) : formatDate(new Date());
  doc.fontSize(11)
     .text(`Generated on ${displayDate}`, 0, 480, { align: 'center' });
  
  // Simple disclaimer at bottom
  doc.fillColor('#FFFFFF')
     .fontSize(9)
     .opacity(0.8)
     .text('Professional Reforestation Strategy Report • For demonstration purposes', 0, doc.page.height - 40, { align: 'center' });
}

/**
 * Creates location analysis page
 */
function createLocationAnalysisPage(doc, coordinates, dataSources) {
  // Header
  doc.fillColor(COLORS.dark)
     .fontSize(24)
     .font('Helvetica-Bold')
     .text('Location Analysis', 50, 100);
  
  // Coordinates section
  doc.fillColor(COLORS.primary)
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('Selected Coordinates', 50, 160);
  
  doc.fillColor(COLORS.dark)
     .fontSize(14)
     .font('Helvetica')
     .text(coordinates.lat.toFixed(6), 70, 195);
  doc.text(coordinates.lon.toFixed(6), 70, 220);
  
  // Data sources
  doc.fillColor(COLORS.dark)
     .fontSize(16)
     .font('Helvetica-Bold')
     .text('Data Sources', 50, 280);
  
  const sources = [
    { label: 'Soil Data', value: cleanDataSource(dataSources?.soil || 'api') },
    { label: 'Weather Data', value: cleanDataSource(dataSources?.weather || 'api') },
    { label: 'AI Analysis', value: cleanDataSource(dataSources?.ai || 'Mock AI (No API Key)') }
  ];
  
  sources.forEach((source, index) => {
    const y = 320 + (index * 25);
    doc.fillColor(COLORS.dark)
       .fontSize(12)
       .font('Helvetica')
       .text(`• ${source.label}: ${source.value}`, 70, y);
  });
}

/**
 * Creates environmental data page
 */
function createEnvironmentalDataPage(doc, soil, weather) {
  // Header
  doc.fillColor(COLORS.dark)
     .fontSize(24)
     .font('Helvetica-Bold')
     .text('Environmental Data', 50, 100);
  
  // Soil Composition
  doc.fillColor(COLORS.secondary)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('Soil Composition', 50, 160);
  
  const soilData = soil || { clay: 20, sand: 55, silt: 25 };
  const soilComponents = [
    { name: 'Clay', value: soilData.clay },
    { name: 'Sand', value: soilData.sand },
    { name: 'Silt', value: soilData.silt }
  ];
  
  soilComponents.forEach((component, index) => {
    const y = 200 + (index * 25);
    doc.fillColor(COLORS.dark)
       .fontSize(12)
       .font('Helvetica')
       .text(`• ${component.name}: ${component.value}%`, 70, y);
  });
  
  // Weather Conditions
  doc.fillColor(COLORS.accent)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('Weather Conditions', 50, 300);
  
  const weatherData = weather || { temperature: 25, precipitation: 0, minTemperature: 20, maxTemperature: 30 };
  const weatherInfo = [
    `Temperature: ${weatherData.temperature}°C`,
    `Precipitation: ${weatherData.precipitation}mm`,
    `Temperature Range: ${weatherData.minTemperature}°C - ${weatherData.maxTemperature}°C`
  ];
  
  weatherInfo.forEach((item, index) => {
    const y = 340 + (index * 25);
    doc.fillColor(COLORS.dark)
       .fontSize(12)
       .font('Helvetica')
       .text(`• ${item}`, 70, y);
  });
}

/**
 * Creates reforestation strategy page
 */
function createReforestationStrategyPage(doc, recommendation) {
  let yPosition = 100;

  // Header
  doc.fillColor(COLORS.dark)
     .fontSize(24)
     .font('Helvetica-Bold')
     .text('Reforestation Strategy', 50, yPosition);
  
  yPosition += 50;

  // Source information
  const source = recommendation?.source || 'Mock AI (No API Key)';
  const model = recommendation?.model || 'mock-biome-based';
  
  doc.fillColor(COLORS.light)
     .fontSize(11)
     .font('Helvetica')
     .text(`Analysis provided by ${source}`, 50, yPosition);
  
  yPosition += 20;
  
  doc.text(`Model: ${model}`, 50, yPosition);
  yPosition += 40;

  // Process sections with improved cleaning
  const sections = parseSectionsRobust(recommendation?.text || 'No recommendation text available');
  
  for (const section of sections) {
    // Check if we need a new page (leave room at bottom)
    const sectionHeight = estimateSectionHeight(doc, section);
    if (yPosition + sectionHeight > doc.page.height - 50) {
      doc.addPage();
      yPosition = 100;
    }
    
    // Add section header with proper emoji
    doc.fillColor(COLORS.primary)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(`${section.icon} ${section.name}:`, 50, yPosition);
    
    yPosition += 25;
    
    // Add section content with better formatting
    const formattedContent = formatSectionContent(section.content);
    doc.fillColor(COLORS.dark)
       .fontSize(11)
       .font('Helvetica')
       .text(formattedContent, 50, yPosition, {
         align: 'left',
         width: doc.page.width - 100,
         lineGap: 5
       });
    
    const textHeight = doc.heightOfString(formattedContent, {
      width: doc.page.width - 100,
      lineGap: 5
    });
    
    yPosition += textHeight + 30;
  }
}

/**
 * Format section content for better readability
 */
function formatSectionContent(content) {
  return content
    .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
    .replace(/^- /gm, '• ')     // Standardize bullet points
    .replace(/^•\s*$/gm, '')    // Remove empty bullet points
    .trim();
}

/**
 * Estimate section height
 */
function estimateSectionHeight(doc, section) {
  const headerHeight = 25;
  const formattedContent = formatSectionContent(section.content);
  const contentHeight = doc.heightOfString(formattedContent, {
    width: doc.page.width - 100,
    lineGap: 5
  });
  const spacing = 30;
  
  return headerHeight + contentHeight + spacing;
}

/**
 * Robust section parsing
 */
function parseSectionsRobust(text) {
  if (!text) return [];
  
  const sections = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentSection = null;
  let currentContent = [];
  
  for (const line of lines) {
    const matchedSection = findMatchingSection(line);
    
    if (matchedSection) {
      if (currentSection) {
        sections.push({
          icon: currentSection.icon,
          name: currentSection.name,
          content: currentContent.join('\n')
        });
      }
      
      currentSection = matchedSection;
      currentContent = [];
    } else if (currentSection) {
      const cleanLine = cleanContentLine(line);
      if (cleanLine && !isSectionHeader(cleanLine)) {
        currentContent.push(cleanLine);
      }
    } else if (!currentSection && isPotentialFirstSection(line)) {
      // Handle case where we start with content without a section header
      currentSection = SECTION_MAPPING['RECOMMENDED NATIVE SPECIES'];
      const cleanLine = cleanContentLine(line);
      if (cleanLine) {
        currentContent.push(cleanLine);
      }
    }
  }
  
  if (currentSection && currentContent.length > 0) {
    sections.push({
      icon: currentSection.icon,
      name: currentSection.name,
      content: currentContent.join('\n')
    });
  }
  
  return sections;
}

/**
 * Check if line might be a section header we missed
 */
function isSectionHeader(line) {
  return Object.keys(SECTION_MAPPING).some(pattern => 
    line.includes(pattern) && line.length < 100
  );
}

/**
 * Check if this might be the first section content
 */
function isPotentialFirstSection(line) {
  return line.includes('Acacia') || line.includes('Commiphora') || line.includes('Terminalia');
}

/**
 * Finds matching section for a line
 */
function findMatchingSection(line) {
  // Try exact matches first
  for (const [pattern, section] of Object.entries(SECTION_MAPPING)) {
    if (line.includes(pattern)) {
      return section;
    }
  }
  return null;
}

/**
 * Cleans content lines with improved filtering
 */
function cleanContentLine(line) {
  if (!line || line.trim().length === 0) return '';
  
  let clean = line
    .replace(/^[-•*]\s*/, '• ')
    .replace(/^#+\s*/, '') // Remove markdown headers
    .replace(/---+/g, '')  // Remove horizontal rules
    .trim();
  
  // Remove corrupted characters but keep basic text, bullet points, and common punctuation
  clean = clean.replace(/[^\x20-\x7E•\u00A0-\u00FF–—'"()]/g, '');
  
  // Fix common species name typos
  clean = clean
    .replace(/Terminalia brownili/g, 'Terminalia brownii')
    .replace(/Terminalia browni/g, 'Terminalia brownii')
    .replace(/Faidherbia/g, 'Faidherbia')
    .replace(/Comniphora/g, 'Commiphora');
  
  return clean.trim();
}

/**
 * Clean data source values
 */
function cleanDataSource(source) {
  if (!source) return 'Not available';
  
  const clean = source
    .replace(/<[^>]*>/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const mapping = {
    'api': 'API Data',
    'mock ai': 'Mock AI (No API Key)',
    '': 'API Data'
  };
  
  return mapping[clean.toLowerCase()] || clean || 'API Data';
}

/**
 * Format date for display
 */
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Generates a filename for the PDF
 */
export function generateFilename(coordinates) {
  const lat = coordinates?.lat?.toFixed(4) || '0.0000';
  const lon = coordinates?.lon?.toFixed(4) || '0.0000';
  const date = new Date().toISOString().split('T')[0];
  return `reforestation-plan-${lat}-${lon}-${date}.pdf`;
}