/**
 * ExtendScript Host Script for Wedding Song Importer Extension
 * Interacts with Premiere Pro DOM (app.project)
 * 100% Adobe ExtendScript (ES3) Compliant
 **/

if (typeof $ === 'undefined') {
    $ = {};
}

$.weddingImporter = {

    /**
     * Confirms an active project exists in Premiere Pro
     */
    checkActiveProject: function() {
        if (typeof app === 'undefined' || !app.project) {
            return false;
        }
        return true;
    },

    /**
     * Get directory containing current active Premiere Pro project (.prproj)
     * Returns empty string if project is unsaved or closed
     */
    getProjectPath: function() {
        try {
            if (this.checkActiveProject() && app.project.path && app.project.path.length > 0) {
                var pFile = new File(app.project.path);
                if (pFile.parent) {
                    return pFile.parent.fsName;
                }
            }
        } catch (e) {
            // Silently fallback if app.project.path is unavailable
        }
        return "";
    },

    /**
     * Launch native OS folder picker dialog to select custom download destination
     */
    selectFolder: function() {
        try {
            var initialFolderStr = this.getProjectPath();
            var targetFolder = null;
            if (initialFolderStr && initialFolderStr.length > 0) {
                targetFolder = new Folder(initialFolderStr).selectDialog("Select Download Location for Wedding Songs");
            } else {
                targetFolder = Folder.selectDialog("Select Download Location for Wedding Songs");
            }
            if (targetFolder) {
                return targetFolder.fsName;
            }
        } catch (e) {
            // Silently fallback if folder dialog fails
        }
        return "";
    },

    /**
     * Find existing Bin or create new Bin under parentBin
     */
    getOrCreateBin: function(parentBin, binName) {
        if (!parentBin) return null;

        var numItems = parentBin.children.numItems;
        for (var i = 0; i < numItems; i++) {
            var item = parentBin.children[i];
            // 2 corresponds to ProjectItemType.BIN
            if (item && item.type === 2 && item.name === binName) {
                return item;
            }
        }

        return parentBin.createBin(binName);
    },

    /**
     * Main Entry point called from CSInterface evalScript
     * @param {string} jsonPayloadStr - JSON stringified object
     */
    importWeddingAssets: function(jsonPayloadStr) {
        try {
            if (!this.checkActiveProject()) {
                return JSON.stringify({
                    status: "error",
                    message: "No active Premiere Pro project found. Please open or create a project first."
                });
            }

            // Parse JSON payload safely in ES3 environment
            var data = null;
            if (typeof JSON !== 'undefined' && JSON.parse) {
                data = JSON.parse(jsonPayloadStr);
            } else {
                data = eval('(' + jsonPayloadStr + ')');
            }

            var clientName = data.clientName || data.cleanClientName || "Unassigned_Client";
            var notesFile = data.notes_file || "";
            var ritualFiles = data.ritual_files || [];

            var rootItem = app.project.rootItem;
            if (!rootItem) {
                return JSON.stringify({
                    status: "error",
                    message: "Failed to access Project root bin."
                });
            }

            // 1. Create Parent Bin: [Wedding] Client_Name
            var parentBinName = "[Wedding] " + clientName;
            var parentBin = this.getOrCreateBin(rootItem, parentBinName);

            var totalImported = 0;

            // 2. Import Special_Notes.txt into root Parent Bin
            if (notesFile && notesFile.length > 0) {
                var notesFileObj = new File(notesFile);
                if (notesFileObj.exists) {
                    app.project.importFiles([notesFileObj.fsName], false, parentBin, false);
                    totalImported++;
                }
            }

            // 3. Group files by ritual and import into sub-bins
            var ritualGroups = {};
            var ritualNamesList = [];

            for (var i = 0; i < ritualFiles.length; i++) {
                var rf = ritualFiles[i];
                var rName = rf.cleanRitualName || rf.ritualName || "General";
                if (!ritualGroups[rName]) {
                    ritualGroups[rName] = [];
                    ritualNamesList.push(rName);
                }
                ritualGroups[rName].push(rf.filePath);
            }

            // Index counter for ordered ritual sub-bins (e.g., 01_Bride_Entry, 02_Haldi)
            for (var k = 0; k < ritualNamesList.length; k++) {
                var currentRitual = ritualNamesList[k];
                var files = ritualGroups[currentRitual];
                var validFilesToImport = [];

                for (var j = 0; j < files.length; j++) {
                    var fileObj = new File(files[j]);
                    if (fileObj.exists) {
                        validFilesToImport.push(fileObj.fsName);
                    }
                }

                if (validFilesToImport.length > 0) {
                    var indexNum = k + 1;
                    var prefix = (indexNum < 10 ? "0" + indexNum : indexNum) + "_";
                    var subBinName = prefix + currentRitual;
                    var subBin = this.getOrCreateBin(parentBin, subBinName);

                    app.project.importFiles(validFilesToImport, false, subBin, false);
                    totalImported += validFilesToImport.length;
                }
            }

            return JSON.stringify({
                status: "success",
                message: "Successfully imported assets into [Wedding] " + clientName,
                importedCount: totalImported,
                parentBinName: parentBinName
            });

        } catch (e) {
            return JSON.stringify({
                status: "error",
                message: "ExtendScript Error: " + e.toString()
            });
        }
    }
};
