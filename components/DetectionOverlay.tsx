
import React from 'react';
import { DetectedObject } from '../types';

interface DetectionOverlayProps {
  objects: DetectedObject[];
  isLoading: boolean;
}

const DetectionOverlay: React.FC<DetectionOverlayProps> = ({ objects, isLoading }) => {
  const handleShop = (label: string) => {
    const query = encodeURIComponent(label);
    window.open(`https://www.google.com/search?q=${query}&tbm=shop`, '_blank');
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white font-medium bg-black/50 px-4 py-2 rounded-full">Analyzing frame...</p>
          </div>
        </div>
      )}

      {objects.map((obj) => {
        const { xmin, ymin, xmax, ymax } = obj.box_2d;
        // Gemini boxes are 0-1000
        const left = `${xmin / 10}%`;
        const top = `${ymin / 10}%`;
        const width = `${(xmax - xmin) / 10}%`;
        const height = `${(ymax - ymin) / 10}%`;

        return (
          <div
            key={obj.id}
            className="absolute border-2 border-blue-400 group pointer-events-auto transition-all duration-300 hover:border-blue-200 hover:bg-blue-400/10 cursor-pointer"
            style={{ left, top, width, height }}
            onClick={(e) => {
              e.stopPropagation();
              handleShop(obj.label);
            }}
          >
            <div className="absolute -top-8 left-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Shop {obj.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DetectionOverlay;
