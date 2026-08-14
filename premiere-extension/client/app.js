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

var DEFAULT_BASE_URL = "https://wedding-song-importer.vercel.app";

function getSavedBaseUrl() {
    var saved = localStorage.getItem("wedding_base_url");
    if (saved && saved.trim()) {
        return saved.trim().replace(/\/+$/, "");
    }
    if (typeof window !== "undefined" && window.location && window.location.origin && window.location.origin.indexOf("http") === 0) {
        return window.location.origin.replace(/\/+$/, "");
    }
    return DEFAULT_BASE_URL;
}

function getSavedStudioId() {
    return localStorage.getItem("wedding_studio_id") || "trpworld";
}

function getClientFormUrl() {
    var baseUrl = getSavedBaseUrl();
    var studioId = getSavedStudioId();
    return baseUrl + "/" + encodeURIComponent(studioId);
}

function getCloudApiUrl(endpoint) {
    var baseUrl = getSavedBaseUrl();
    return baseUrl + "/api/" + endpoint;
}

function updateClientUrlDisplay() {
    var urlInput = document.getElementById("clientUrlDisplay");
    if (urlInput) {
        var url = getClientFormUrl();
        urlInput.value = url;
        urlInput.title = url;
    }

    var baseInput = document.getElementById("baseUrlInput");
    if (baseInput) {
        baseInput.value = getSavedBaseUrl();
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

var currentStudioTemplate = [];

function fetchStudioTemplate() {
    var studioId = getSavedStudioId();
    logMessage("Fetching ritual template for Studio ID [" + studioId + "]...");

    var url = getCloudApiUrl("templates?studioId=" + encodeURIComponent(studioId));

    fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(json) {
            if (json.success && Array.isArray(json.data)) {
                currentStudioTemplate = json.data;
                renderTemplateEditor();
                logMessage("Loaded " + currentStudioTemplate.length + " ritual(s) in template.");
            }
        })
        .catch(function(err) {
            logMessage("Failed to load studio template: " + err.message, true);
        });
}

function renderTemplateEditor() {
    var listEl = document.getElementById("tplRitualList");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (currentStudioTemplate.length === 0) {
        listEl.innerHTML = '<div style="color:#888; font-size:10px; padding:4px;">No custom rituals. Default template will be used.</div>';
        return;
    }

    currentStudioTemplate.forEach(function(item, idx) {
        var row = document.createElement("div");
        row.className = "template-item";

        var nameSpan = document.createElement("span");
        nameSpan.className = "template-item-name";
        nameSpan.textContent = item.name;

        var tagSpan = document.createElement("span");
        tagSpan.className = "template-item-tag";
        tagSpan.textContent = item.englishTag ? " (" + item.englishTag + ")" : "";
        nameSpan.appendChild(tagSpan);

        var delBtn = document.createElement("button");
        delBtn.className = "btn btn-xs";
        delBtn.textContent = "🗑️";
        delBtn.style.padding = "1px 4px";
        delBtn.addEventListener("click", function() {
            deleteRitualFromTemplate(idx);
        });

        row.appendChild(nameSpan);
        row.appendChild(delBtn);
        listEl.appendChild(row);
    });
}

function addRitualToTemplate() {
    var nameInput = document.getElementById("tplRitualName");
    var tagInput = document.getElementById("tplEnglishTag");

    var name = nameInput ? nameInput.value.trim() : "";
    var tag = tagInput ? tagInput.value.trim() : "";

    if (!name) {
        alert("Please enter a ritual name.");
        return;
    }

    currentStudioTemplate.push({
        id: "ritual-" + Date.now(),
        name: name,
        englishTag: tag || name
    });

    if (nameInput) nameInput.value = "";
    if (tagInput) tagInput.value = "";

    renderTemplateEditor();
}

function deleteRitualFromTemplate(idx) {
    if (idx >= 0 && idx < currentStudioTemplate.length) {
        currentStudioTemplate.splice(idx, 1);
        renderTemplateEditor();
    }
}

function saveStudioTemplate() {
    var studioId = getSavedStudioId();
    var btn = document.getElementById("btnSaveTemplate");

    if (btn) btn.disabled = true;
    logMessage("Saving ritual template for [" + studioId + "]...");

    var url = getCloudApiUrl("templates");

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            studio_id: studioId,
            rituals: currentStudioTemplate
        })
    })
    .then(function(res) { return res.json(); })
    .then(function(json) {
        if (btn) btn.disabled = false;
        if (json.success) {
            logMessage("🎉 Saved " + currentStudioTemplate.length + " ritual(s) to Studio ID [" + studioId + "]");
            alert("Studio Template saved successfully!");
        } else {
            throw new Error(json.error || "Failed to save template");
        }
    })
    .catch(function(err) {
        if (btn) btn.disabled = false;
        logMessage("Error saving template: " + err.message, true);
        alert("Error saving template: " + err.message);
    });
}

function resetStudioTemplate() {
    if (confirm("Reset template to default 25 Bengali rituals?")) {
        currentStudioTemplate = [];
        saveStudioTemplate();
        fetchStudioTemplate();
    }
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

    var baseInput = document.getElementById("baseUrlInput");
    var btnSaveBase = document.getElementById("btnSaveBaseUrl");
    if (btnSaveBase) {
        btnSaveBase.addEventListener("click", function() {
            var val = baseInput ? baseInput.value.trim() : "";
            if (val) {
                localStorage.setItem("wedding_base_url", val.replace(/\/+$/, ""));
                updateClientUrlDisplay();
                logMessage("Saved Base Web URL: " + getSavedBaseUrl() + ". Syncing queue...");
                fetchSubmissionsData();
            }
        });
    }

    var btnToggleTpl = document.getElementById("btnToggleTemplate");
    var btnCloseTpl = document.getElementById("btnCloseTemplate");
    var tplSection = document.getElementById("templateBuilderSection");

    if (btnToggleTpl && tplSection) {
        btnToggleTpl.addEventListener("click", function() {
            var isHidden = tplSection.style.display === "none";
            tplSection.style.display = isHidden ? "flex" : "none";
            if (isHidden) {
                fetchStudioTemplate();
            }
        });
    }

    if (btnCloseTpl && tplSection) {
        btnCloseTpl.addEventListener("click", function() {
            tplSection.style.display = "none";
        });
    }

    var btnAddTpl = document.getElementById("btnAddTplRitual");
    if (btnAddTpl) {
        btnAddTpl.addEventListener("click", function() {
            addRitualToTemplate();
        });
    }

    var btnSaveTpl = document.getElementById("btnSaveTemplate");
    if (btnSaveTpl) {
        btnSaveTpl.addEventListener("click", function() {
            saveStudioTemplate();
        });
    }

    var btnResetTpl = document.getElementById("btnResetTemplate");
    if (btnResetTpl) {
        btnResetTpl.addEventListener("click", function() {
            resetStudioTemplate();
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
        getCloudApiUrl("submissions" + studioParam),
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

function startProgressPolling(jobId, subId) {
    var box = document.getElementById("progress-container-" + subId);
    var statusText = document.getElementById("progress-status-" + subId);
    var metaText = document.getElementById("progress-meta-" + subId);
    var barFill = document.getElementById("progress-bar-" + subId);

    if (box) box.style.display = "block";

    var intervalId = setInterval(function() {
        fetch(LOCAL_AGENT_URL + "/progress?job_id=" + encodeURIComponent(jobId))
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (!data) return;
                var pct = Math.min(100, Math.max(0, data.percentage || 0));
                if (barFill) barFill.style.width = pct + "%";
                if (statusText) statusText.textContent = (data.status === "downloading" ? "⬇️ " : "⏳ ") + (data.current_song || "Downloading...");
                if (metaText) metaText.textContent = Math.round(pct) + "% • " + (data.speed || "⚡ 0.0 MB/s") + " (ETA " + (data.eta || "0s") + ")";

                if (data.status === "completed" || pct >= 100) {
                    clearInterval(intervalId);
                    if (barFill) barFill.style.width = "100%";
                    if (statusText) statusText.textContent = "✅ Download Complete! Importing...";
                    if (metaText) metaText.textContent = "100% • Done";
                }
            })
            .catch(function() {});
    }, 300);

    return intervalId;
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
        var subCleanId = (sub.id || "sub-" + Math.random()).replace(/[^a-zA-Z0-9_-]/g, "");

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

        // Dynamic Real-Time Progress Bar Box
        var progBox = document.createElement("div");
        progBox.id = "progress-container-" + subCleanId;
        progBox.className = "progress-box";
        progBox.style.display = "none";
        progBox.innerHTML =
            '<div class="progress-info">' +
                '<span id="progress-status-' + subCleanId + '" class="progress-status-text">⏳ Initializing...</span>' +
                '<span id="progress-meta-' + subCleanId + '" class="progress-meta-text">0% • ⚡ 0.0 MB/s</span>' +
            '</div>' +
            '<div class="progress-bar-bg">' +
                '<div id="progress-bar-' + subCleanId + '" class="progress-bar-fill" style="width: 0%;"></div>' +
            '</div>';

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
            handleDownloadAndImport(sub, btnImport, subCleanId);
        });

        card.appendChild(cardHeader);
        card.appendChild(infoEl);
        card.appendChild(listEl);
        card.appendChild(progBox);
        card.appendChild(btnImport);

        container.appendChild(card);
    });
}

function handleDownloadAndImport(sub, btnElement, subCleanId) {
    if (!isAgentConnected) {
        logMessage("Attempting auto-spawn before download...", true);
        ensureAgentRunning();
        alert("Local Downloader Agent is starting up.\n\nPlease click Download again in 2 seconds.");
        return;
    }

    btnElement.disabled = true;
    btnElement.textContent = "⏳ Downloading Tracks & Notes...";
    logMessage("Triggering high-speed download for " + sub.client_name + " via Local Agent...");

    var jobId = "job-" + Date.now();
    startProgressPolling(jobId, subCleanId || sub.id);

    refreshTargetDirectory(function(targetDir) {
        fetch(LOCAL_AGENT_URL + "/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                job_id: jobId,
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
                            btnElement.textContent = "⚠️ Retry Download";
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
            btnElement.textContent = "⚠️ Retry Download";
        });
    });
}
