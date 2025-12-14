# Advanced Video Player

A professional, feature-rich video player built with [Shaka Player](https://github.com/shaka-project/shaka-player) by Google, supporting HLS, MPEG-DASH, MP4, and advanced streaming features.

![Video Player Interface](https://github.com/user-attachments/assets/e8353c49-cfd8-474c-913f-7c0c5597a81a)

## ✨ Features

### Core Playback
- 🎬 **Multiple Format Support**: HLS, MPEG-DASH, MP4, and more
- 🔊 **Multi-Audio Tracks**: Switch between multiple audio tracks on the fly
- 📺 **Quality Selection**: Automatic and manual quality switching (SD, HD, UHD)
- ⚡ **Playback Speed Control**: Adjust playback speed from 0.5x to 2x
- 📝 **Captions/Subtitles**: Toggle and select from available caption tracks
- 🎵 **Surround Sound**: Support for 5.1 and 7.1 channel audio
- 🎨 **Dolby Audio**: DD 5.1 and DDP 5.1 support
- 🌟 **Dolby Vision**: When available in the content

### Video Loading
- 🔗 **URL Loading**: Load videos from any URL (HLS, DASH, MP4, etc.)
- 📁 **Local Files**: Upload and play local video files in various formats
  - **Supported formats**: MP4, WebM, MKV, AVI, MOV, WMV, FLV, OGG, 3GP, MPEG, and more
- 🚀 **Quick Samples**: Pre-configured MP4 and HLS sample videos

### Advanced Features
- 🔐 **DRM Support**: Play protected content when DRM is available
- 📖 **Chapters**: Navigate through video chapters
- 🔗 **MPD Chaining**: Seamless playlist chaining
- 🧭 **Content Steering**: Dynamic CDN switching
- 🎯 **LCEVC**: Low Complexity Enhancement Video Coding support
- 🔧 **MPD Patch**: Dynamic manifest updates
- 💾 **Video Download**: Secure download capability with protocol validation

### User Experience
- ⌨️ **Keyboard Controls**: Full keyboard navigation support
- 📱 **Responsive Design**: Mobile and desktop friendly
- 🎛️ **Volume Control**: Precise volume adjustment
- 🖥️ **Fullscreen**: Immersive viewing experience
- 📜 **History Tracking**: Keep track of played videos with localStorage
- 🌙 **Dark Mode**: Eye-friendly dark theme support

## 🎮 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` / `K` | Play/Pause |
| `←` / `→` | Seek backward/forward (5 seconds) |
| `↑` / `↓` | Volume up/down |
| `M` | Mute/Unmute |
| `F` | Toggle fullscreen |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- A modern web browser with JavaScript enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rutvik24/video-player.git
cd video-player
```

2. Install dependencies using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### Development

Run the development server:

```bash
bun dev
```

Or with npm:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

Build the application:

```bash
bun run build
```

Or with npm:

```bash
npm run build
```

Start the production server:

```bash
bun start
```

Or with npm:

```bash
npm start
```

## 📁 Project Structure

```
video-player/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main application page
│   │   ├── layout.tsx        # Root layout with metadata
│   │   └── globals.css       # Global styles
│   └── components/
│       ├── VideoPlayer.tsx   # Main video player component
│       └── VideoHistory.tsx  # Video history management
├── public/                    # Static assets
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🎯 Usage

### Loading a Video

1. **From URL**: Enter a video URL (HLS, DASH, or MP4) in the input field and click "Load"
2. **Local File**: Click "Upload Local File" and select a video from your device (supports MP4, WebM, MKV, AVI, MOV, WMV, FLV, OGG, and more)
3. **Sample Videos**: Click "Load Sample MP4" or "Load Sample HLS" for quick testing

### Supported URL Formats

- **HLS**: `https://example.com/playlist.m3u8`
- **DASH**: `https://example.com/manifest.mpd`
- **MP4**: `https://example.com/video.mp4`

### Supported Local File Formats

The player supports a wide range of video formats for local playback:
- **MP4** (`.mp4`) - MPEG-4 Part 14
- **WebM** (`.webm`) - Web Media File Format
- **MKV** (`.mkv`) - Matroska Multimedia Container
- **AVI** (`.avi`) - Audio Video Interleave
- **MOV** (`.mov`) - QuickTime File Format
- **WMV** (`.wmv`) - Windows Media Video
- **FLV** (`.flv`) - Flash Video
- **OGG** (`.ogg`, `.ogv`) - Ogg Vorbis/Theora
- **3GP** (`.3gp`, `.3g2`) - 3GPP Multimedia
- **MPEG** (`.mpeg`, `.mpg`) - MPEG Video

*Note: Actual playback support depends on your browser's codec support. Modern browsers like Chrome, Firefox, and Safari support most common formats.*

### Video History

The player automatically tracks successfully played videos:
- View filename, URL, and timestamp
- Replay videos from history
- Copy URLs to clipboard
- Delete individual entries or clear all history

## 🛠️ Technologies Used

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[Shaka Player](https://github.com/shaka-project/shaka-player)** - Google's video player library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager

## 🔒 Security

- **XSS Prevention**: URL validation in download handler
- **Protocol Validation**: Only http, https, and blob protocols allowed
- **Input Sanitization**: All user inputs are properly validated
- **CodeQL Verified**: Zero security vulnerabilities

## 📱 Browser Support

The player works on all modern browsers that support:
- HTML5 Video API
- Media Source Extensions (MSE)
- Encrypted Media Extensions (EME) for DRM content

Recommended browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Shaka Player](https://github.com/shaka-project/shaka-player) by Google
- [Next.js](https://nextjs.org/) by Vercel
- [Tailwind CSS](https://tailwindcss.com/) by Tailwind Labs

## 📧 Support

For issues, questions, or suggestions, please [open an issue](https://github.com/rutvik24/video-player/issues) on GitHub.

---

Built with ❤️ using Shaka Player
