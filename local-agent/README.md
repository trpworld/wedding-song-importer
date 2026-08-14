# 🎧 Wedding Song Local Downloader Agent

The **Local Downloader Agent** is a lightweight Python Flask service that runs on `http://localhost:5050`. It communicates directly with your Admin Dashboard and automatically downloads high-bitrate 320kbps MP3 audio files into organized client folders on your hard drive.

---

## 📁 Automatic Folder Output Structure

Downloads are saved into:
- **Windows:** `D:\Wedding_Projects\<Client_Name>\<Ritual_Name>\` (or `./Wedding_Projects` if `D:\` is unavailable)
- **macOS / Linux:** `./Wedding_Projects/<Client_Name>/<Ritual_Name>/`

Example:
```
D:\Wedding_Projects\Rahul_and_Ananya\
├── Bride_Entry\
│   └── Jasleen_Royal_Din_Shagna_Da.mp3
├── Groom_Entry\
│   └── Tenu_Leke_Dilwale.mp3
└── Haldi\
    └── Kabira_Encore.mp3
```

---

## 🚀 Quick Setup & Usage

### Windows Users
Double-click `setup.bat` or run in CMD:
```cmd
cd local-agent
setup.bat
```

### macOS / Linux Users
Run in Terminal:
```bash
cd local-agent
chmod +x setup.sh
./setup.sh
```

---

## ⚡ Prerequisites

1. **Python 3.8+** installed (`python3 --version`).
2. **ffmpeg** installed (required for MP3 extraction & 320kbps encoding):
   - **macOS:** `brew install ffmpeg`
   - **Windows:** Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add `bin` to PATH.
   - **Linux:** `sudo apt install ffmpeg`

---

## 🌐 Endpoints

- `GET http://localhost:5050/health` -> Health check & folder status
- `POST http://localhost:5050/download` -> Download tracks for a client submission
