'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Download,
  FileVideo,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface VideoPlayerProps {
  onVideoLoad?: (url: string, fileName?: string) => void;
}

interface AudioTrack {
  id: number;
  language: string;
  label: string;
  channels: number;
}

interface VideoQuality {
  height: number;
  width: number;
  bandwidth: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShakaPlayer = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShakaUI = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShakaModule = any;

export default function VideoPlayer({ onVideoLoad }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ShakaPlayer>(null);
  const uiRef = useRef<ShakaUI>(null);
  const shakaRef = useRef<ShakaModule>(null);

  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [videoQualities, setVideoQualities] = useState<VideoQuality[]>([]);
  const [shakaLoaded, setShakaLoaded] = useState(false);

  const loadVideo = useCallback(async (url: string, fileName?: string) => {
    const player = playerRef.current;
    const video = videoRef.current;
    
    if (!player || !video) return;

    setLoading(true);
    setError('');

    try {
      await player.load(url);
      setLoading(false);
      
      if (onVideoLoad) {
        onVideoLoad(url, fileName);
      }
      
      // Auto-play after loading
      video.play();
    } catch (e) {
      const error = e as Error;
      console.error('Error loading video:', error);
      setError(`Failed to load video: ${error.message || 'Unknown error'}`);
      setLoading(false);
    }
  }, [onVideoLoad]);

  useEffect(() => {
    // Dynamically import Shaka Player only on client side
    const loadShaka = async () => {
      try {
        const shakaModule = await import('shaka-player/dist/shaka-player.ui');
        // Import CSS - TypeScript doesn't recognize CSS imports, but webpack/Next.js does
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await import('shaka-player/dist/controls.css');
        shakaRef.current = shakaModule.default;
        setShakaLoaded(true);
      } catch (err) {
        console.error('Failed to load Shaka Player:', err);
        setError('Failed to load video player library');
      }
    };

    loadShaka();
  }, []);

  useEffect(() => {
    if (!shakaLoaded || !shakaRef.current) return;

    const shaka = shakaRef.current;

    // Check if browser supports Shaka Player
    if (!shaka.Player.isBrowserSupported()) {
      setError('Browser not supported!');
      return;
    }

    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Keyboard controls handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
          break;
        case 'arrowleft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case 'arrowright':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
        case 'arrowup':
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          break;
        case 'm':
          e.preventDefault();
          video.muted = !video.muted;
          break;
        case 'f':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            container.requestFullscreen();
          }
          break;
      }
    };

    // Initialize player asynchronously
    const initPlayer = async () => {
      // Create Shaka Player instance and attach to video
      const player = new shaka.Player();
      await player.attach(video);
      playerRef.current = player;

    // Create UI overlay
    const ui = new shaka.ui.Overlay(player, container, video);
    uiRef.current = ui;

    // Configure UI
    const config = {
      addSeekBar: true,
      addBigPlayButton: true,
      controlPanelElements: [
        'play_pause',
        'time_and_duration',
        'spacer',
        'mute',
        'volume',
        'fullscreen',
        'overflow_menu',
      ],
      overflowMenuButtons: ['playback_rate', 'captions', 'quality', 'language', 'picture_in_picture'],
      seekBarColors: {
        base: 'rgba(255, 255, 255, 0.3)',
        buffered: 'rgba(255, 255, 255, 0.5)',
        played: 'rgb(255, 0, 0)',
      },
    };
    ui.configure(config);

    // Error handling
    player.addEventListener('error', (event: Event) => {
      const errorEvent = event as unknown as { detail: { code: number; message?: string } };
      console.error('Error code', errorEvent.detail.code, 'object', errorEvent.detail);
      setError(`Error: ${errorEvent.detail.code} - ${errorEvent.detail.message || 'Unknown error'}`);
      setLoading(false);
    });

    // Track changes
    player.addEventListener('trackschanged', () => {
      const tracks = player.getVariantTracks();
      const audioTracksList = player.getAudioLanguagesAndRoles();
      
      // Get unique audio tracks
      const uniqueAudio: AudioTrack[] = [];
      const seenLanguages = new Set<string>();
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioTracksList.forEach((track: any, index: number) => {
        const key = `${track.language}-${track.role}`;
        if (!seenLanguages.has(key)) {
          seenLanguages.add(key);
          uniqueAudio.push({
            id: index,
            language: track.language,
            label: track.label || track.language,
            channels: track.channelsCount || 2,
          });
        }
      });
      
      setAudioTracks(uniqueAudio);

      // Get video qualities
       
      const qualities = tracks
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((track: any) => track.height)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((track: any) => ({
          height: track.height!,
          width: track.width!,
          bandwidth: track.bandwidth,
        }))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => b.height - a.height);
      
      // Remove duplicates
       
      const uniqueQualities = qualities.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (quality: any, index: number, self: any[]) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          index === self.findIndex((q: any) => q.height === quality.height)
      );
      
      setVideoQualities(uniqueQualities);
    });
    };

    document.addEventListener('keydown', handleKeyDown);

    // Listen for loadVideoFromHistory event
    const handleLoadFromHistory = (event: Event) => {
      const customEvent = event as CustomEvent<{ url: string; fileName: string }>;
      const { url, fileName } = customEvent.detail;
      setVideoUrl(url);
      // Trigger load after state update
      setTimeout(() => {
        loadVideo(url, fileName);
      }, 100);
    };

    window.addEventListener('loadVideoFromHistory', handleLoadFromHistory);

    initPlayer();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('loadVideoFromHistory', handleLoadFromHistory);
      if (uiRef.current) {
        uiRef.current.destroy();
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [shakaLoaded, loadVideo]);

  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      
      // Check if filename is available in query params
      const filenameParam = urlObj.searchParams.get('filename');
      if (filenameParam) {
        return filenameParam;
      }
      
      // Check response-content-disposition header (common in cloud storage like AWS S3, Cloudflare R2)
      const contentDisposition = urlObj.searchParams.get('response-content-disposition');
      if (contentDisposition) {
        // Extract filename from: attachment; filename="Red.One.mkv"
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=["']?([^"';\n]*)["']?/);
        if (filenameMatch && filenameMatch[1]) {
          return decodeURIComponent(filenameMatch[1]);
        }
      }
      
      // Fall back to extracting from pathname
      return urlObj.pathname.split('/').pop() || 'video';
    } catch {
      return 'video';
    }
  };

  const handleUrlLoad = () => {
    if (videoUrl.trim()) {
      const fileName = getFileNameFromUrl(videoUrl);
      loadVideo(videoUrl, fileName);
    }
  };

  const handleOpenInVLC = () => {
    if (!videoUrl.trim()) return;
    
    // VLC protocol handler - vlc:// opens VLC with network stream
    const vlcUrl = `vlc://${videoUrl}`;
    
    try {
      window.location.href = vlcUrl;
    } catch (error) {
      console.error('Error opening VLC:', error);
      alert('Unable to open VLC. Make sure VLC is installed on your system.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      loadVideo(url, file.name);
    }
  };

  const handleSampleVideo = (type: 'mp4' | 'hls') => {
    if (type === 'mp4') {
      // Sample MP4 video
      loadVideo(
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'BigBuckBunny.mp4'
      );
    } else {
      // Sample HLS with multiple audio tracks
      loadVideo(
        'https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8',
        'angel-one.m3u8'
      );
    }
  };

  const handleDownload = () => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    try {
      // Validate URL before using it
      const url = new URL(videoUrl, window.location.href);
      
      // Only allow http, https, and blob protocols
      if (!['http:', 'https:', 'blob:'].includes(url.protocol)) {
        console.error('Invalid protocol for download');
        return;
      }

      const link = document.createElement('a');
      link.href = url.href;
      link.download = url.pathname.split('/').pop() || 'video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Invalid URL for download:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Video URL Input */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Load Video from URL
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter video URL (HLS, DASH, MP4...)"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleUrlLoad()}
          />
          <button
            onClick={handleUrlLoad}
            disabled={!videoUrl.trim() || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Load'}
          </button>
        </div>
      </div>

      {/* Sample Videos and File Upload */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Quick Actions
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleSampleVideo('mp4')}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-zinc-400 transition-colors"
          >
            <Play size={18} />
            Load Sample MP4
          </button>
          <button
            onClick={() => handleSampleVideo('hls')}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-zinc-400 transition-colors"
          >
            <Play size={18} />
            Load Sample HLS
          </button>
          <label className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer transition-colors">
            <FileVideo size={18} />
            Upload Local File
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {videoUrl && (
            <>
              <button
                onClick={handleOpenInVLC}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                title="Open in VLC Player"
              >
                <ExternalLink size={18} />
                Open in VLC
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Download size={18} />
                Download
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Video Player */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl overflow-hidden">
        <div
          ref={containerRef}
          className="relative bg-black"
          style={{ aspectRatio: '16/9' }}
        >
          <video
            ref={videoRef}
            className="w-full h-full"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect width='1920' height='1080' fill='%23000'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='%23fff' text-anchor='middle' dominant-baseline='middle'%3ELoad a video to start%3C/text%3E%3C/svg%3E"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Additional Info */}
        {(audioTracks.length > 0 || videoQualities.length > 0) && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {audioTracks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                    Audio Tracks ({audioTracks.length})
                  </h3>
                  <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {audioTracks.map((track) => (
                      <div key={track.id} className="flex items-center gap-2">
                        <span className="font-mono">{track.language}</span>
                        <span>•</span>
                        <span>{track.channels} channels</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {videoQualities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">
                    Available Qualities ({videoQualities.length})
                  </h3>
                  <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {videoQualities.map((quality, index) => (
                      <div key={index}>
                        {quality.height}p ({quality.width}x{quality.height})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4 text-sm">
        <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
          Keyboard Controls
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-zinc-600 dark:text-zinc-400">
          <div><kbd className="px-2 py-1 bg-white dark:bg-zinc-800 rounded">Space</kbd> Play/Pause</div>
          <div><kbd className="px-2 py-1 bg-white dark:bg-zinc-800 rounded">←/→</kbd> Seek</div>
          <div><kbd className="px-2 py-1 bg-white dark:bg-zinc-800 rounded">↑/↓</kbd> Volume</div>
          <div><kbd className="px-2 py-1 bg-white dark:bg-zinc-800 rounded">M</kbd> Mute</div>
          <div><kbd className="px-2 py-1 bg-white dark:bg-zinc-800 rounded">F</kbd> Fullscreen</div>
          <div><kbd className="px-2 py-1 bg-white dark:bg-zinc-800 rounded">K</kbd> Play/Pause</div>
        </div>
      </div>
    </div>
  );
}
