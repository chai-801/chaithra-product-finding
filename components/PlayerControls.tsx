
import React from 'react';

interface PlayerControlsProps {
  onSourceSelect: (source: { type: 'youtube' | 'file', value: string | File }) => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ onSourceSelect }) => {
  const [ytUrl, setYtUrl] = React.useState('');

  const handleYtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ytUrl) {
      onSourceSelect({ type: 'youtube', value: ytUrl });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSourceSelect({ type: 'file', value: file });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-4xl px-4">
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          YouTube Link
        </h3>
        <form onSubmit={handleYtSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Paste YouTube URL here..."
            className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold py-2 px-4 rounded-lg text-sm"
          >
            Load Video
          </button>
        </form>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          Local File
        </h3>
        <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept="video/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          <span className="text-gray-400 text-sm">Click or drop video file</span>
          <span className="text-xs text-gray-500 mt-1">MP4, WEBM, MOV</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
