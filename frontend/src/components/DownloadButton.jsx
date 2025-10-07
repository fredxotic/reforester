// components/DownloadButton.jsx
import React, { useState } from 'react';

export default function DownloadButton({ analysisData }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!analysisData) return;

    setDownloading(true);
    
    try {
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisData }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Generate filename
      const { coordinates } = analysisData;
      const lat = coordinates.lat.toFixed(4);
      const lon = coordinates.lon.toFixed(4);
      const date = new Date().toISOString().split('T')[0];
      a.download = `reforestation-plan-${lat}-${lon}-${date}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading || !analysisData}
      className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
    >
      {downloading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download PDF Report</span>
        </>
      )}
    </button>
  );
}