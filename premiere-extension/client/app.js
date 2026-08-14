/**
 * CEP Panel Logic Application Controller for Premiere Pro
 * Includes Auto-Spawning Supervisor for Local Agent (Port 5050)
 */

var csInterface = new CSInterface();
var LOCAL_AGENT_URL = "http://localhost:5050";
var CLOUD_API_URL = "https://wedding-song-importer.vercel.app/api/submissions";

var submissions = [];
var isAgentConnected = false;
var isSpawning = false;
var activeProjectFolder = "";
var customDownloadFolder = localStorage.getItem("wedding_download_folder") || "";

document.addEventListener("DOMContentLoaded", function() {
    initApp();
});

function logMessage(msg, isError) {
    var consoleEl = document.getElementById("logConsole");
    if (!consoleEl) return;
    var div = document.createElement("div");
    div.className = "log-entry" + (isError ? " error" : "");
    var time = new Date().toLocaleTimeString();
    div.textContent = "[" + time + "] " + msg;
    consoleEl.appendChild(div);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

function updateFolderUI() {
    var textEl = document.getElementById("folderPathText");
    if (!textEl) return;

    if (activeProjectFolder && activeProjectFolder.length > 0) {
        textEl.textContent = "Project: " + activeProjectFolder;
        textEl.title = "Active Premiere Pro project directory: " + activeProjectFolder;
    } else if (customDownloadFolder && customDownloadFolder.length > 0) {
        textEl.textContent = "Custom: " + customDownloadFolder;
        textEl.title = "Selected download location: " + customDownloadFolder;
    } else {
        textEl.textContent = "Default: Wedding_Projects";
        textEl.title = "Default base directory";
    }
}

function refreshTargetDirectory(callback) {
    csInterface.evalScript("$.weddingImporter.getProjectPath()", function(res) {
        if (res && res !== "evalScript error." && res.length > 0) {
            activeProjectFolder = res;
        } else {
            activeProjectFolder = "";
        }
        updateFolderUI();
        if (callback) callback(getActiveDownloadDir());
    });
}

function getActiveDownloadDir() {
    if (activeProjectFolder && activeProjectFolder.length > 0) {
        return activeProjectFolder;
    }
    if (customDownloadFolder && customDownloadFolder.length > 0) {
        return customDownloadFolder;
    }
    return "";
}

function handleSelectFolder() {
    csInterface.evalScript("$.weddingImporter.selectFolder()", function(res) {
        if (res && res !== "evalScript error." && res.length > 0) {
            customDownloadFolder = res;
            localStorage.setItem("wedding_download_folder", res);
            logMessage("Selected custom download folder: " + res);
            updateFolderUI();
        }
    });
}

function getSavedStudioId() {
    return localStorage.getItem("wedding_studio_id") || "trpworld";
}

function getClientFormUrl() {
    var studioId = getSavedStudioId();
    return "https://wedding-song-importer.vercel.app/" + encodeURIComponent(studioId);
}

function updateClientUrlDisplay() {
    var urlInput = document.getElementById("clientUrlDisplay");
    if (urlInput) {
        var url = getClientFormUrl();
        urlInput.value = url;
        urlInput.title = url;
    }
}

function handleCopyLink() {
    var url = getClientFormUrl();
    var btn = document.getElementById("btnCopyLink");

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url);
    } else {
        var urlInput = document.getElementById("clientUrlDisplay");
        if (urlInput) {
            urlInput.select();
            document.execCommand("copy");
        }
    }

    if (btn) {
        btn.textContent = "✅ Copied!";
        setTimeout(function() {
            btn.textContent = "📋 Copy";
        }, 2000);
    }

    logMessage("Copied client link: " + url);
}

function handleShareWhatsApp() {
    var url = getClientFormUrl();
    var shareMsg = "Please select your wedding songs here: " + url;
    var waUrl = "https://api.whatsapp.com/send?text=" + encodeURIComponent(shareMsg);

    if (csInterface && csInterface.openURLInDefaultBrowser) {
        csInterface.openURLInDefaultBrowser(waUrl);
    } else {
        window.open(waUrl, "_blank");
    }

    logMessage("Opened WhatsApp share link.");
}

function initApp() {
    logMessage("Initializing Wedding Song Importer Extension...");

    var studioInput = document.getElementById("studioIdInput");
    if (studioInput) {
        studioInput.value = getSavedStudioId();
        studioInput.addEventListener("input", function() {
            var val = studioInput.value.trim() || "trpworld";
            localStorage.setItem("wedding_studio_id", val);
            updateClientUrlDisplay();
        });
    }

    updateClientUrlDisplay();

    var btnStudio = document.getElementById("btnSaveStudio");
    if (btnStudio) {
        btnStudio.addEventListener("click", function() {
            var val = studioInput ? studioInput.value.trim() : "trpworld";
            if (!val) val = "trpworld";
            localStorage.setItem("wedding_studio_id", val);
            updateClientUrlDisplay();
            logMessage("Saved Studio ID: " + val + ". Syncing queue...");
            fetchSubmissionsData();
        });
    }

    var btnCopy = document.getElementById("btnCopyLink");
    if (btnCopy) {
        btnCopy.addEventListener("click", function() {
            handleCopyLink();
        });
    }

    var btnWA = document.getElementById("btnShareWhatsApp");
    if (btnWA) {
        btnWA.addEventListener("click", function() {
            handleShareWhatsApp();
        });
    }

    // Bind UI actions
    document.getElementById("btnRefresh").addEventListener("click", function() {
        checkAgentAndFetchData();
    });

    document.getElementById("searchInput").addEventListener("input", function(e) {
        renderSubmissions(e.target.value);
    });

    var btnFolder = document.getElementById("btnSelectFolder");
    if (btnFolder) {
        btnFolder.addEventListener("click", function() {
            handleSelectFolder();
        });
    }

    refreshTargetDirectory();

    // Run auto-spawning supervisor
    ensureAgentRunning();
}

/**
 * Auto-Spawning Supervisor:
 * Checks if http://localhost:5050/health is alive.
 * If offline, uses Node.js child_process.spawn to silently launch agent.py in background.
 */
function ensureAgentRunning(retryCount) {
    retryCount = retryCount || 0;
    var pill = document.getElementById("statusPill");
    var text = document.getElementById("statusText");

    fetch(LOCAL_AGENT_URL + "/health")
        .then(function(res) {
            if (res.ok) return res.json();
            throw new Error("HTTP " + res.status);
        })
        .then(function(data) {
            if (data.status === "ok") {
                isAgentConnected = true;
                isSpawning = false;
                if (pill) pill.className = "status-pill online";
                if (text) text.textContent = "🟢 Agent Active";
                logMessage("Local Agent active on port 5050 (PID " + (data.pid || "Daemon") + ")");
                fetchSubmissionsData();
            } else {
                throw new Error("Invalid status payload");
            }
        })
        .catch(function() {
            isAgentConnected = false;

            if (retryCount === 0 && !isSpawning) {
                isSpawning = true;
                if (pill) pill.className = "status-pill spawning";
                if (text) text.textContent = "🟡 Spawning Local Downloader...";
                logMessage("Local Agent offline. Auto-spawning background daemon process...");

                spawnLocalAgentProcess(function(spawnSuccess) {
                    if (spawnSuccess) {
                        setTimeout(function() {
                            ensureAgentRunning(1);
                        }, 600);
                    } else {
                        if (pill) pill.className = "status-pill offline";
                        if (text) text.textContent = "🔴 Agent Offline";
                        logMessage("Failed to auto-spawn agent. Please check local environment.", true);
                        fetchSubmissionsData();
                    }
                });
            } else if (retryCount > 0 && retryCount < 6) {
                if (pill) pill.className = "status-pill spawning";
                if (text) text.textContent = "🟡 Connecting (" + retryCount + "/5)...";
                setTimeout(function() {
                    ensureAgentRunning(retryCount + 1);
                }, 400);
            } else {
                isSpawning = false;
                if (pill) pill.className = "status-pill offline";
                if (text) text.textContent = "🔴 Agent Offline";
                logMessage("Could not verify agent connection after spawn attempts.", true);
                fetchSubmissionsData();
            }
        });
}

/**
 * Uses CEP Node.js runtime (require('child_process')) to silently launch local-agent/agent.py
 */
function spawnLocalAgentProcess(callback) {
    try {
        if (typeof require === "undefined") {
            logMessage("Node.js runtime unavailable in CEP environment.", true);
            callback(false);
            return;
        }

        var cp = require("child_process");
        var path = require("path");
        var fs = require("fs");

        var extensionPath = "";
        try {
            extensionPath = csInterface.getSystemPath(CSInterface.prototype.SystemPath.EXTENSION);
        } catch(e) {
            extensionPath = process.cwd();
        }
        
        var possibleAgentPaths = [
            path.join(extensionPath, "local-agent", "agent.py"),
            path.join(extensionPath, "..", "local-agent", "agent.py"),
            "/Volumes/4TB SSD/ASSETS/MY WEDDING SYSTAM/local-agent/agent.py"
        ];

        var agentScript = "";
        for (var i = 0; i < possibleAgentPaths.length; i++) {
            if (fs.existsSync(possibleAgentPaths[i])) {
                agentScript = possibleAgentPaths[i];
                break;
            }
        }

        if (!agentScript) {
            logMessage("Could not locate agent.py script file.", true);
            callback(false);
            return;
        }

        var agentDir = path.dirname(agentScript);
        var isWin = process.platform === "win32";

        var pythonBin = isWin
            ? path.join(agentDir, "venv", "Scripts", "python.exe")
            : path.join(agentDir, "venv", "bin", "python");

        if (!fs.existsSync(pythonBin)) {
            pythonBin = isWin ? "python.exe" : "python3";
        }

        logMessage("Spawning background process: " + pythonBin + " " + agentScript);

        var child = cp.spawn(pythonBin, [agentScript], {
            cwd: agentDir,
            detached: true,
            stdio: "ignore",
            windowsHide: true
        });

        child.unref();
        callback(true);

    } catch (e) {
        logMessage("Exception during process spawn: " + e.message, true);
        callback(false);
    }
}

function checkAgentAndFetchData() {
    ensureAgentRunning();
}

function fetchSubmissionsData() {
    var studioId = getSavedStudioId();
    logMessage("Fetching submissions for Studio ID [" + studioId + "]...");

    var studioParam = "?studioId=" + encodeURIComponent(studioId);

    var cloudUrls = [
        CLOUD_API_URL + studioParam,
        "http://localhost:3000/api/submissions" + studioParam,
        "http://localhost:3001/api/submissions" + studioParam
    ];

    function tryFetch(index) {
        if (index >= cloudUrls.length) {
            logMessage("Failed to fetch submissions from endpoints.", true);
            return;
        }
        fetch(cloudUrls[index])
            .then(function(res) { return res.json(); })
            .then(function(json) {
                if (json.success && Array.isArray(json.data)) {
                    submissions = json.data;
                    renderSubmissions();
                    logMessage("Loaded " + submissions.length + " client submission(s).");
                } else {
                    tryFetch(index + 1);
                }
            })
            .catch(function() {
                tryFetch(index + 1);
            });
    }

    tryFetch(0);
}

function renderSubmissions(query) {
    var container = document.getElementById("contentArea");
    container.innerHTML = "";

    var searchQuery = (query || "").toLowerCase();

    var filtered = submissions.filter(function(sub) {
        var matchName = (sub.client_name || "").toLowerCase().indexOf(searchQuery) !== -1;
        var matchSong = (sub.songs || []).some(function(s) {
            return (s.ritualName || "").toLowerCase().indexOf(searchQuery) !== -1;
        });
        return matchName || matchSong;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="card text-center"><p style="color:#888;">No submissions found.</p></div>';
        return;
    }

    filtered.forEach(function(sub) {
        var card = document.createElement("div");
        card.className = "card";

        var cardHeader = document.createElement("div");
        cardHeader.className = "card-header";

        var nameEl = document.createElement("span");
        nameEl.className = "couple-name";
        nameEl.textContent = sub.client_name;

        var dateEl = document.createElement("span");
        dateEl.className = "card-date";
        dateEl.textContent = sub.event_date;

        cardHeader.appendChild(nameEl);
        cardHeader.appendChild(dateEl);

        var infoEl = document.createElement("div");
        infoEl.className = "card-info";
        infoEl.innerHTML = '<span class="info-tag">🎵 ' + (sub.songs ? sub.songs.length : 0) + ' Tracks</span>' +
                           '<span class="info-tag">📌 Status: ' + sub.status + '</span>';

        // Ritual track list
        var listEl = document.createElement("div");
        listEl.className = "ritual-list";

        (sub.songs || []).forEach(function(song) {
            var itemEl = document.createElement("div");
            itemEl.className = "ritual-item";
            itemEl.innerHTML = '<span class="ritual-name">' + song.ritualName + '</span>' +
                               '<span class="ritual-note">' + (song.notes || "No notes") + '</span>';
            listEl.appendChild(itemEl);
        });

        // Action Button
        var btnImport = document.createElement("button");
        btnImport.className = "btn btn-primary";
        btnImport.style.width = "100%";

        if (sub.status === "Completed" || sub.is_downloaded) {
            btnImport.innerHTML = "✅ Imported (Click to Re-Import)";
        } else {
            btnImport.innerHTML = "📥 Download & Import to Premiere Pro";
        }

        btnImport.addEventListener("click", function() {
            handleDownloadAndImport(sub, btnImport);
        });

        card.appendChild(cardHeader);
        card.appendChild(infoEl);
        card.appendChild(listEl);
        card.appendChild(btnImport);

        container.appendChild(card);
    });
}

function handleDownloadAndImport(sub, btnElement) {
    if (!isAgentConnected) {
        logMessage("Attempting auto-spawn before download...", true);
        ensureAgentRunning();
        alert("Local Downloader Agent is starting up.\n\nPlease click Download again in 2 seconds.");
        return;
    }

    btnElement.disabled = true;
    btnElement.textContent = "⏳ Downloading Tracks & Notes...";
    logMessage("Triggering download for " + sub.client_name + " via Local Agent...");

    refreshTargetDirectory(function(targetDir) {
        fetch(LOCAL_AGENT_URL + "/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: sub.id,
                clientName: sub.client_name,
                eventDate: sub.event_date,
                phone: sub.phone || "",
                general_notes: sub.general_notes || "",
                downloadDir: targetDir,
                songs: sub.songs
            })
        })
        .then(function(res) { return res.json(); })
        .then(function(result) {
            if (result.status === "success") {
                logMessage("Download completed! Triggering Premiere Pro ExtendScript Bin Importer...");
                btnElement.textContent = "🎬 Importing to Bins...";

                var payloadStr = JSON.stringify(result);
                var escapedPayload = payloadStr.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
                var jsxScript = "$.weddingImporter.importWeddingAssets('" + escapedPayload + "')";

                csInterface.evalScript(jsxScript, function(evalResult) {
                    try {
                        var resObj = JSON.parse(evalResult);
                        if (resObj.status === "success") {
                            logMessage("🎉 SUCCESS: " + resObj.message + " (" + resObj.importedCount + " files)");
                            btnElement.textContent = "✅ Imported to " + resObj.parentBinName;

                            // Mark submission completed in cloud queue
                            fetch(LOCAL_AGENT_URL + "/status", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: sub.id, status: "Completed", is_downloaded: true })
                            }).then(function() {
                                fetchSubmissionsData();
                            });
                        } else {
                            logMessage("ExtendScript Error: " + resObj.message, true);
                            btnElement.disabled = false;
                            btnElement.textContent = "⚠️ Import Retry";
                        }
                    } catch(ex) {
                        logMessage("Raw ExtendScript Result: " + evalResult);
                        btnElement.disabled = false;
                        btnElement.textContent = "📥 Download & Import";
                    }
                });
            } else {
                throw new Error(result.message || "Failed to download tracks");
            }
        })
        .catch(function(err) {
            logMessage("Download & Import Error: " + err.message, true);
            btnElement.disabled = false;
            btnElement.textContent = "📥 Download & Import";
        });
    });
}
