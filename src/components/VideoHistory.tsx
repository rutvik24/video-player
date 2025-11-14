'use client';

import { useEffect, useState, useCallback } from 'react';
import { Copy, Trash2, Play, ExternalLink, Clock } from 'lucide-react';

interface VideoHistoryItem {
  id: string;
  url: string;
  fileName: string;
  timestamp: number;
}

interface VideoHistoryProps {
  onLoadVideo: (url: string, fileName: string) => void;
}

export default function VideoHistory({ onLoadVideo }: VideoHistoryProps) {
  const [history, setHistory] = useState<VideoHistoryItem[]>([]);

  const addToHistory = useCallback((url: string, fileName: string) => {
    const newItem: VideoHistoryItem = {
      id: Date.now().toString(),
      url,
      fileName: fileName || url.split('/').pop() || 'video',
      timestamp: Date.now(),
    };

    setHistory((currentHistory) => {
      const updatedHistory = [newItem, ...currentHistory.filter((item) => item.url !== url)].slice(0, 50);
      
      try {
        localStorage.setItem('videoHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Error saving history:', error);
      }
      
      return updatedHistory;
    });
  }, []);

  useEffect(() => {
    // Load history from localStorage
    const loadHistory = () => {
      try {
        const saved = localStorage.getItem('videoHistory');
        if (saved) {
          setHistory(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };

    loadHistory();

    // Listen for custom event when new video is loaded
    const handleVideoLoaded = (event: Event) => {
      const customEvent = event as CustomEvent<{ url: string; fileName: string }>;
      addToHistory(customEvent.detail.url, customEvent.detail.fileName);
    };

    window.addEventListener('videoLoaded', handleVideoLoaded);
    return () => {
      window.removeEventListener('videoLoaded', handleVideoLoaded);
    };
  }, [addToHistory]);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      // Could add a toast notification here
      alert('URL copied to clipboard!');
    });
  };

  const hasTimeBasedParams = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      
      // Common time-based parameter names
      const timeParams = [
        'current_time', 'currentTime', 'time', 'start_time', 'startTime', 
        'expiry', 'expires', 'exp', 'timestamp',
        'X-Amz-Date' // AWS/Cloudflare R2 signature timestamp
      ];
      
      return timeParams.some(param => params.has(param));
    } catch {
      return false;
    }
  };

  const copyUrlWithUpdatedTime = (url: string) => {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      
      // Get current UTC time
      const now = new Date();
      const currentTimeUTC = Math.floor(now.getTime() / 1000); // Unix timestamp in seconds
      
      // Common time-based parameter names and their variations
      const timeParams = ['current_time', 'currentTime', 'time', 'start_time', 'startTime'];
      const expiryParams = ['expiry', 'expires', 'exp'];
      
      // Update time parameters
      timeParams.forEach(param => {
        if (params.has(param)) {
          params.set(param, currentTimeUTC.toString());
        }
      });
      
      // Update expiry parameters (set to 1 hour from now)
      const expiryTime = currentTimeUTC + 3600; // 1 hour from now
      expiryParams.forEach(param => {
        if (params.has(param)) {
          params.set(param, expiryTime.toString());
        }
      });
      
      // Check for timestamp parameter (might be in milliseconds)
      if (params.has('timestamp')) {
        params.set('timestamp', Date.now().toString());
      }
      
      // Handle AWS/Cloudflare R2 signature parameters (X-Amz-Date format)
      if (params.has('X-Amz-Date')) {
        // Format: YYYYMMDDTHHmmssZ (e.g., 20251112T162406Z)
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        const amzDate = `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
        
        params.set('X-Amz-Date', amzDate);
        
        // Also update X-Amz-Credential date if present (format: YYYYMMDD)
        if (params.has('X-Amz-Credential')) {
          const credential = params.get('X-Amz-Credential') || '';
          const credentialParts = credential.split('/');
          if (credentialParts.length >= 2) {
            credentialParts[1] = `${year}${month}${day}`;
            params.set('X-Amz-Credential', credentialParts.join('/'));
          }
        }
      }
      
      const updatedUrl = urlObj.toString();
      
      navigator.clipboard.writeText(updatedUrl).then(() => {
        alert('URL with updated time copied to clipboard!');
      });
    } catch (error) {
      console.error('Error updating URL time:', error);
      alert('Failed to update URL time parameters');
    }
  };

  const openInVLC = (url: string) => {
    // VLC protocol handler - vlc:// opens VLC with network stream
    const vlcUrl = `vlc://${url}`;
    
    try {
      window.location.href = vlcUrl;
    } catch (error) {
      console.error('Error opening VLC:', error);
      alert('Unable to open VLC. Make sure VLC is installed on your system.');
    }
  };

  const deleteItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    
    try {
      localStorage.setItem('videoHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      localStorage.removeItem('videoHistory');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Video History
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-center py-8">
          No videos in history yet. Load a video to see it here!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Video History
        </h2>
        <button
          onClick={clearHistory}
          className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {item.fileName}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                {item.url}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                {formatDate(item.timestamp)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLoadVideo(item.url, item.fileName)}
                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                title="Load video"
              >
                <Play size={18} />
              </button>
              <button
                onClick={() => openInVLC(item.url)}
                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded transition-colors"
                title="Open in VLC Player"
              >
                <ExternalLink size={18} />
              </button>
              <button
                onClick={() => copyUrl(item.url)}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                title="Copy URL"
              >
                <Copy size={18} />
              </button>
              {hasTimeBasedParams(item.url) && (
                <button
                  onClick={() => copyUrlWithUpdatedTime(item.url)}
                  className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition-colors"
                  title="Copy URL with updated time"
                >
                  <Clock size={18} />
                </button>
              )}
              <button
                onClick={() => deleteItem(item.id)}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
