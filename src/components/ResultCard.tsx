'use client';

interface ResultCardProps {
  title: string;
  artist?: string;
  downloadUrl?: string;
  source?: string;
  thumbnail?: string;
  duration?: number;
}

export function ResultCard({ 
  title, 
  artist, 
  downloadUrl, 
  source, 
  thumbnail, 
  duration 
}: ResultCardProps) {
  return (
    <div className="p-4 border rounded-md hover:shadow-md transition-shadow">
      {thumbnail && (
        <div className="mb-3">
          <img 
            src={thumbnail} 
            alt={`${title} thumbnail`} 
            className="w-full h-36 object-cover rounded"
          />
        </div>
      )}
      
      <div className="font-medium text-lg mb-1">{title}</div>
      
      {artist && (
        <div className="text-sm text-gray-600 mb-2">{artist}</div>
      )}
      
      {source && (
        <div className="text-xs text-gray-500 mb-2">Source: {source}</div>
      )}
      
      {duration && (
        <div className="text-xs text-gray-500 mb-3">
          {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
        </div>
      )}
      
      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          Open Link
        </a>
      )}
      
      {!downloadUrl && (
        <button
          className="w-full text-center px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
        >
          No Download Available
        </button>
      )}
    </div>
  );
}