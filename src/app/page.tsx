'use client';

import { useRef } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoHistory from '@/components/VideoHistory';

export default function Home() {
  const playerRef = useRef<HTMLDivElement>(null);

  const handleVideoLoad = (url: string, fileName?: string) => {
    // Dispatch custom event for history tracking
    const event = new CustomEvent('videoLoaded', {
      detail: { url, fileName: fileName || url.split('/').pop() || 'video' },
    });
    window.dispatchEvent(event);
  };

  const handleHistoryVideoLoad = (url: string, fileName: string) => {
    // Programmatically load video from history
    // This would need to be implemented in VideoPlayer with a ref method
    console.log('Loading from history:', url, fileName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Advanced Video Player
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Powered by Shaka Player - Supports HLS, DASH, MP4, and more
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          <VideoPlayer ref={playerRef} onVideoLoad={handleVideoLoad} />
          <VideoHistory onLoadVideo={handleHistoryVideoLoad} />
        </div>

        {/* Features Footer */}
        <footer className="mt-12 bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            Supported Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>HLS with multiple audio tracks</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Quality switching (HD/UHD)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>MPEG-DASH content</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Local file playback</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Video download capability</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Surround sound (5.1, 7.1)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Dolby Audio support</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>DRM support (if available)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Mobile & desktop friendly</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Keyboard controls</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Chapters support</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Content Steering & MPD features</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
