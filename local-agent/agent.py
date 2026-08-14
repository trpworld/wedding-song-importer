import os
import sys
import re
import glob
import json
import socket
import subprocess
import urllib.request
from flask import Flask, request, jsonify
from flask_cors import CORS

import threading
import time

app = Flask(__name__)
CORS(app)

PORT = 5050
AGENT_DIR = os.path.dirname(os.path.abspath(__file__))

# Thread-safe job progress store
progress_store = {}
progress_lock = threading.Lock()

# Environment setup preserving system network/proxy variables
current_env = os.environ.copy()
additional_paths = ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "C:\\ffmpeg\\bin"]
current_path = current_env.get("PATH", "")
for p in additional_paths:
    if os.path.exists(p) and p not in current_path:
        current_path = p + os.pathsep + current_path
current_env["PATH"] = current_path
current_env["LANG"] = "en_US.UTF-8"
current_env["LC_ALL"] = "en_US.UTF-8"

# Default base directory for downloaded wedding projects
if os.name == 'nt' and os.path.exists("D:\\"):
    DEFAULT_BASE_DIR = "D:\\Wedding_Projects"
else:
    DEFAULT_BASE_DIR = os.path.abspath(os.path.join(AGENT_DIR, "..", "Wedding_Projects"))

def sanitize_filename(name):
    """Sanitize string to be safe for filenames and folder paths across OS."""
    if not name:
        return "Unknown"
    cleaned = re.sub(r'[\\/*?:"<>|]', "", name)
    cleaned = re.sub(r'[^\w\s-]', "", cleaned)
    cleaned = cleaned.strip()
    return cleaned if cleaned else "Ritual_Track"

def is_port_in_use(port):
    """Check if port 5050 is already bound by an active agent instance."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        return s.connect_ex(('127.0.0.1', port)) == 0

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "service": "Wedding Song Local Downloader & Premiere Agent",
        "version": "2.2.0",
        "download_dir": DEFAULT_BASE_DIR,
        "pid": os.getpid()
    })

@app.route('/progress', methods=['GET'])
def get_progress():
    job_id = request.args.get('job_id') or request.args.get('id')
    if not job_id:
        return jsonify({"status": "error", "message": "Missing job_id parameter"}), 400

    with progress_lock:
        data = progress_store.get(job_id)
        if not data:
            return jsonify({
                "status": "idle",
                "percentage": 0,
                "speed": "0.0 MB/s",
                "eta": "0s",
                "current_song": "",
                "downloaded_count": 0,
                "total_songs": 0
            })
        return jsonify(data)

@app.route('/status', methods=['PATCH', 'POST'])
def update_status():
    data = request.get_json() or {}
    sub_id = data.get('id')
    status = data.get('status', 'Completed')
    is_downloaded = data.get('is_downloaded', True)
    custom_target = data.get('target_url') or data.get('cloud_api_url')

    if not sub_id:
        return jsonify({"status": "error", "message": "Missing submission ID"}), 400

    endpoints = []
    if custom_target:
        endpoints.append(custom_target)

    endpoints.extend([
        "https://wedding-song-importer.vercel.app/api/submissions",
        "http://localhost:3000/api/submissions",
        "http://localhost:3001/api/submissions",
        "https://temporary-rushing-bromine-uy4xsfg.vercel.app/api/submissions"
    ])

    success = False
    last_err = ""
    for ep in endpoints:
        try:
            req = urllib.request.Request(
                ep,
                data=json.dumps({"id": sub_id, "status": status, "is_downloaded": is_downloaded}).encode('utf-8'),
                headers={"Content-Type": "application/json"},
                method="PATCH"
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    success = True
                    break
        except Exception as e:
            last_err = str(e)
            continue

    if success:
        return jsonify({"status": "success", "message": "Status updated successfully in queue"})
    else:
        return jsonify({"status": "warning", "message": f"Status patch notice: {last_err}"}), 200

@app.route('/download', methods=['POST'])
def download_songs():
    data = request.get_json() or {}
    client_name = data.get('clientName', 'Unassigned_Client')
    event_date = data.get('eventDate', 'N/A')
    songs = data.get('songs', [])
    sub_id = data.get('id')

    if not songs:
        return jsonify({"status": "error", "message": "No songs provided in payload"}), 400

    clean_client = sanitize_filename(client_name)
    download_dir_override = data.get('downloadDir') or data.get('targetDir') or data.get('projectDir')

    if download_dir_override and isinstance(download_dir_override, str) and len(download_dir_override.strip()) > 0:
        target_base = download_dir_override.strip()
        try:
            os.makedirs(target_base, exist_ok=True)
            base_dir = target_base
        except Exception:
            base_dir = DEFAULT_BASE_DIR
    else:
        base_dir = DEFAULT_BASE_DIR

    client_folder = os.path.join(base_dir, clean_client)
    os.makedirs(client_folder, exist_ok=True)

    # 1. Generate Special_Notes.txt inside client folder
    notes_file_path = os.path.join(client_folder, "Special_Notes.txt")
    try:
        with open(notes_file_path, "w", encoding="utf-8") as f:
            f.write("====================================================\n")
            f.write(f" 🎬 WEDDING SOUNDTRACK EDITING NOTES\n")
            f.write(f" Client / Couple: {client_name}\n")
            f.write(f" Event Date: {event_date}\n")
            if data.get('phone'):
                f.write(f" Phone / WhatsApp: {data.get('phone')}\n")
            f.write("====================================================\n\n")
            if data.get('general_notes'):
                f.write("📌 GENERAL PROJECT NOTES:\n")
                f.write(f"{data.get('general_notes')}\n\n")
                f.write("----------------------------------------------------\n\n")
            for song in songs:
                r_name = song.get('ritualName', 'General')
                url = song.get('url', 'N/A')
                note = song.get('notes', 'None')
                f.write(f"[{r_name}]\n")
                f.write(f"URL: {url}\n")
                f.write(f"Instructions: {note if note else 'Play standard track'}\n\n")
    except Exception as ne:
        print(f"Warning writing notes file: {ne}")

    job_id = data.get('job_id') or sub_id or f"job-{int(time.time()*1000)}"
    valid_songs_list = [s for s in songs if s.get('url')]
    total_songs = len(valid_songs_list)

    with progress_lock:
        progress_store[job_id] = {
            "percentage": 5.0,
            "speed": "Initializing...",
            "eta": "calculating...",
            "status": "downloading",
            "current_song": "Preparing downloads...",
            "downloaded_count": 0,
            "total_songs": total_songs
        }

    downloaded_count = 0
    errors = []
    ritual_files = []

    # Locate yt-dlp binary executable
    venv_bin_dir = os.path.dirname(sys.executable)
    yt_dlp_bin = os.path.join(venv_bin_dir, "yt-dlp" if os.name != 'nt' else "yt-dlp.exe")
    if not os.path.exists(yt_dlp_bin):
        yt_dlp_bin = "yt-dlp"

    for idx, song in enumerate(valid_songs_list):
        ritual_name = song.get('ritualName', 'General')
        url = song.get('url', '')
        note = song.get('notes', '')

        if not url:
            continue

        current_pct = round(10.0 + ((idx / max(total_songs, 1)) * 80.0), 1)
        with progress_lock:
            progress_store[job_id] = {
                "percentage": current_pct,
                "speed": "⚡ 4.2 MB/s",
                "eta": f"{max(1, (total_songs - idx) * 3)}s",
                "status": "downloading",
                "current_song": ritual_name,
                "downloaded_count": idx,
                "total_songs": total_songs
            }

        clean_ritual = sanitize_filename(ritual_name)
        ritual_folder = os.path.join(client_folder, clean_ritual)
        os.makedirs(ritual_folder, exist_ok=True)

        output_template = os.path.join(ritual_folder, '%(title)s.%(ext)s')

        cmd = [
            yt_dlp_bin,
            "--no-cache-dir",
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", "0",
            "--concurrent-fragments", "4",
            "--extractor-args", "youtube:player_client=android,web",
            "-o", output_template,
            "--no-playlist",
            url
        ]

        cmd_fallback = [
            yt_dlp_bin,
            "--no-cache-dir",
            "-f", "bestaudio/best",
            "--extractor-args", "youtube:player_client=android,web",
            "-o", output_template,
            "--no-playlist",
            url
        ]

        download_success = False
        try:
            print(f"Downloading [{clean_ritual}]: {url} -> {ritual_folder}")
            subprocess.run(cmd, capture_output=True, text=True, env=current_env, check=True)
            download_success = True
            downloaded_count += 1
        except subprocess.CalledProcessError as e:
            print(f"MP3 conversion warning: {e.stderr}. Trying raw audio fallback...")
            try:
                subprocess.run(cmd_fallback, capture_output=True, text=True, env=current_env, check=True)
                download_success = True
                downloaded_count += 1
            except Exception as ex:
                err_msg = f"Failed to download {ritual_name} ({url}): {e.stderr or str(ex)}"
                print(err_msg)
                errors.append(err_msg)
        except Exception as e:
            err_msg = f"Failed to download {ritual_name} ({url}): {str(e)}"
            print(err_msg)
            errors.append(err_msg)

        if download_success:
            audio_files = glob.glob(os.path.join(ritual_folder, "*.*"))
            for af in audio_files:
                if not af.endswith(".txt"):
                    ritual_files.append({
                        "ritualName": ritual_name,
                        "cleanRitualName": clean_ritual,
                        "filePath": os.path.abspath(af),
                        "notes": note
                    })

    with progress_lock:
        progress_store[job_id] = {
            "percentage": 100.0,
            "speed": "Completed",
            "eta": "0s",
            "status": "completed",
            "current_song": "Done",
            "downloaded_count": downloaded_count,
            "total_songs": total_songs
        }

    if downloaded_count > 0 or os.path.exists(notes_file_path):
        return jsonify({
            "status": "success",
            "message": f"Successfully downloaded {downloaded_count} tracks for {client_name}.",
            "id": sub_id,
            "clientName": client_name,
            "cleanClientName": clean_client,
            "downloaded_count": downloaded_count,
            "folder": client_folder,
            "notes_file": os.path.abspath(notes_file_path) if os.path.exists(notes_file_path) else "",
            "ritual_files": ritual_files,
            "errors": errors
        })
    else:
        return jsonify({
            "status": "error",
            "message": "Failed to download tracks.",
            "errors": errors
        }), 500

if __name__ == '__main__':
    os.makedirs(DEFAULT_BASE_DIR, exist_ok=True)
    
    if is_port_in_use(PORT):
        print(f"ℹ️ Local Agent is already active on port {PORT}. Exiting duplicate instance.")
        sys.exit(0)

    print("=" * 60)
    print(" 🚀 WEDDING SONG LOCAL DOWNLOADER & PREMIERE AGENT v2.2.0")
    print(f" 📁 Base Download Directory: {DEFAULT_BASE_DIR}")
    print(f" 🌐 Server running on http://localhost:{PORT}")
    print("=" * 60)
    app.run(host='0.0.0.0', port=PORT, debug=False)
