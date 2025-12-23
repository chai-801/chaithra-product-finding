
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayerSource, DetectedObject } from './types';
import DetectionOverlay from './components/DetectionOverlay';
import PlayerControls from './components/PlayerControls';
import { detectObjectsInFrame } from './services/geminiService';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const App: React.FC = () => {
  const [source, setSource] = useState<PlayerSource | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [detections, setDetections] = useState<DetectedObject[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize YouTube API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
    } else {
      window.onYouTubeIframeAPIReady = () => setIsApiReady(true);
    }
  }, []);

  const extractFrameAndDetect = useCallback(async () => {
    setIsDetecting(true);
    setDetections([]);

    try {
      if (source?.type === 'file' && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
          const results = await detectObjectsInFrame(base64);
          setDetections(results);
        }
      } else if (source?.type === 'youtube') {
        // Due to CORS restrictions on YouTube iFrames, JS cannot grab frames via canvas directly.
        // For a production app, we would use a backend to fetch the frame at this timestamp 
        // or a simulated approach. For this demo, we'll explain the limitation 
        // or use a placeholder detection if we can't grab pixels.
        // NOTE: In a real world scenario, you'd proxy the YouTube video through a server
        // or use the YouTube Data API to get thumbnails if available, or just focus on File upload.
        console.warn("YouTube frame capture is limited by browser CORS. Switch to local file for best AI experience.");
        
        // Let's at least show a placeholder or try to simulate the detection logic
        // if we could somehow get a frame. 
        setTimeout(() => {
          setIsDetecting(false);
        }, 1000);
      }
    } catch (err) {
      console.error("Frame capture error:", err);
    } finally {
      setIsDetecting(false);
    }
  }, [source]);

  // Handle Video Events
  const onPlayerStateChange = (event: any) => {
    // 2 is Paused
    if (event.data === 2) {
      setIsPaused(true);
      extractFrameAndDetect();
    } else if (event.data === 1) { // 1 is Playing
      setIsPaused(false);
      setDetections([]);
    }
  };

  const handleSourceSelect = (newSource: { type: 'youtube' | 'file', value: string | File }) => {
    if (newSource.type === 'youtube') {
      const url = newSource.value as string;
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      const videoId = match ? match[1] : null;
      if (videoId) {
        setSource({ type: 'youtube', url: videoId });
        setDetections([]);
      }
    } else {
      const file = newSource.value as File;
      setSource({ type: 'file', url: URL.createObjectURL(file), file });
      setDetections([]);
    }
  };

  // Re-initialize YT Player when source changes
  useEffect(() => {
    if (source?.type === 'youtube' && isApiReady && ytContainerRef.current) {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
      }
      ytPlayerRef.current = new window.YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: source.url,
        events: {
          'onStateChange': onPlayerStateChange,
        },
      });
    }
  }, [source, isApiReady]);

  const handleNativePause = () => {
    setIsPaused(true);
    extractFrameAndDetect();
  };

  const handleNativePlay = () => {
    setIsPaused(false);
    setDetections([]);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent mb-4">
          VisionShop AI
        </h1>
        <p className="text-gray-400 text-lg">
          Pause the video to identify items. Click on objects to shop instantly.
        </p>
      </div>

      {/* Main Player Area */}
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800">
        {!source && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-gray-500">
            <svg className="w-16 h-16 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="font-medium">Upload or paste a link to start</p>
          </div>
        )}

        {source?.type === 'youtube' && (
          <div ref={ytContainerRef} className="w-full h-full">
            <div id="yt-player"></div>
          </div>
        )}

        {source?.type === 'file' && (
          <video
            ref={videoRef}
            src={source.url}
            className="w-full h-full"
            controls
            onPause={handleNativePause}
            onPlay={handleNativePlay}
          />
        )}

        {/* AI Overlay Layer - only active on pause */}
        {isPaused && (
          <DetectionOverlay objects={detections} isLoading={isDetecting} />
        )}

        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls / Uploader */}
      <PlayerControls onSourceSelect={handleSourceSelect} />

      {/* Info Notice */}
      <div className="mt-12 text-center max-w-3xl">
        <div className="bg-blue-900/20 border border-blue-800 p-6 rounded-xl">
          <h4 className="text-blue-300 font-bold mb-2 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
            How it works
          </h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            VisionShop uses <span className="text-blue-400 font-semibold">Gemini 3 Flash</span> to understand the visual context of your video.
            When you pause, we capture the current frame and identify physical products, clothing, or gadgets. 
            Clicking a detected box will instantly search for that exact item on Google Shopping.
          </p>
          <p className="text-yellow-500/80 text-xs mt-3 italic">
            Note: YouTube iframe security prevents direct frame capture in most browsers. Use local file upload for the full AI experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
