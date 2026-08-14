# 🎬 Wedding Song Importer — Adobe Premiere Pro CEP Extension

The **Wedding Song Importer** is a native Adobe Premiere Pro CEP Panel Extension that allows wedding video editors to browse client soundtrack submissions directly inside Premiere Pro, download high-quality 320kbps MP3s, generate custom editing timestamp notes (`Special_Notes.txt`), and automatically create organized Bins (Folders) in the Project panel.

---

## ⚡ Installation Instructions

### macOS Users
Run in Terminal:
```bash
cd premiere-extension
chmod +x install.sh
./install.sh
```

### Windows Users
Double-click `install.bat` inside the `premiere-extension` directory.

---

## 🚀 How to Use in Premiere Pro

1. Open **Adobe Premiere Pro**.
2. Go to top menu: `Window` > `Extensions` > `Wedding Song Importer`.
3. The panel will dock cleanly into your workspace layout.
4. Ensure the **Local Agent** (`http://localhost:5050`) is running.
5. Click **"📥 Download & Import to Premiere Pro"** on any client submission card.

---

## 📁 Automatic Premiere Pro Bin Hierarchy Created

```text
Project Panel
└── [Wedding] Rohan_and_Priya/
    ├── Special_Notes.txt (Contains timestamps & editing instructions)
    ├── 01_Bride_Entry/
    │   └── Jasleen_Royal_Din_Shagna_Da.mp3
    ├── 02_Groom_Entry/
    │   └── Tenu_Leke_Dilwale.mp3
    └── 03_Haldi/
        └── Kabira_Encore.mp3
```
