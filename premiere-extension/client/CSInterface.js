/**
  CSInterface - v11.0.0
  Official Adobe Common Extensibility Platform Interface Library
**/

function CSInterface() {}

/**
 * User Colors
 */
function AppSkinInfo(baseFontFamily, baseFontSize, appBarBackgroundColor, panelBackgroundColor, appBarBackgroundColorSRGB, panelBackgroundColorSRGB, systemHighlightColor) {
    this.baseFontFamily = baseFontFamily;
    this.baseFontSize = baseFontSize;
    this.appBarBackgroundColor = appBarBackgroundColor;
    this.panelBackgroundColor = panelBackgroundColor;
    this.appBarBackgroundColorSRGB = appBarBackgroundColorSRGB;
    this.panelBackgroundColorSRGB = panelBackgroundColorSRGB;
    this.systemHighlightColor = systemHighlightColor;
}

/**
 * System Paths
 */
CSInterface.prototype.SystemPath = {
    USER_DATA: "userData",
    COMMON_FILES: "commonFiles",
    MY_DOCUMENTS: "myDocuments",
    APPLICATION: "application",
    EXTENSION: "extension",
    HOST_APPLICATION: "hostApplication"
};

/**
 * EvalScript - Evaluate ExtendScript in Premiere Pro Host Engine
 */
CSInterface.prototype.evalScript = function(script, callback) {
    if (window.__adobe_cep__) {
        window.__adobe_cep__.evalScript(script, callback || function() {});
    } else {
        console.warn("[CSInterface Mock] evalScript:", script);
        if (callback) callback("MOCK_OK");
    }
};

/**
 * Get System Path
 */
CSInterface.prototype.getSystemPath = function(pathType) {
    if (window.__adobe_cep__) {
        var path = window.__adobe_cep__.getSystemPath(pathType);
        return path;
    }
    return "";
};

/**
 * Open URL in Default Browser
 */
CSInterface.prototype.openURLInDefaultBrowser = function(url) {
    if (window.__adobe_cep__) {
        window.__adobe_cep__.openURLInDefaultBrowser(url);
    } else {
        window.open(url, "_blank");
    }
};

/**
 * Get Host Environment
 */
CSInterface.prototype.getHostEnvironment = function() {
    if (window.__adobe_cep__) {
        var hostEnvStr = window.__adobe_cep__.getHostEnvironment();
        return JSON.parse(hostEnvStr);
    }
    return {
        appName: "PPRO",
        appVersion: "24.0",
        appLocale: "en_US"
    };
};

/**
 * Register Event Listener
 */
CSInterface.prototype.addEventListener = function(type, listener, obj) {
    if (window.__adobe_cep__) {
        window.__adobe_cep__.addEventListener(type, listener, obj);
    }
};

/**
 * Dispatch Event
 */
CSInterface.prototype.dispatchEvent = function(event) {
    if (window.__adobe_cep__) {
        window.__adobe_cep__.dispatchEvent(event);
    }
};

/**
 * Close Extension Window
 */
CSInterface.prototype.closeExtension = function() {
    if (window.__adobe_cep__) {
        window.__adobe_cep__.closeExtension();
    }
};
