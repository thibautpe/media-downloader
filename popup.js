// --- Internationalisation (FR / EN) --------------------------------------
const translations = {
  fr: {
    appTitle: "Media Downloader",
    autoScrollLabel: "Défilement automatique (pages à chargement infini, ex. Facebook)",
    scanBtn: "Scanner la page",
    pauseBtn: "⏸ Pause",
    resumeBtn: "▶ Reprendre",
    stopBtn: "⏹ Arrêter",
    tabImages: "Images",
    tabVideos: "Vidéos",
    tabPdfs: "PDFs",
    tabDrive: "Cloud",
    selectAll: "Tout sélectionner",
    selectNone: "Tout désélectionner",
    minImageSizeLabel: "Taille min. images (px) :",
    minImageSizeHint: "(0 = désactivé)",
    downloadBtn: "Télécharger la sélection",
    downloadBtnCount: (n) => `Télécharger la sélection (${n})`,
    resetHistory: "Oublier l'historique de ce site (repartir de zéro)",
    initialEmpty: "Clique sur « Scanner la page » pour commencer.",
    emptyCategory: "Rien trouvé dans cette catégorie.",
    emptyFiltered: "Aucune image ne dépasse la taille minimale indiquée.",
    filteredNote: (shown, total) => `${shown} / ${total} affichées (filtre de taille actif).`,
    statusScanPrep: "Préparation du scan...",
    statusScanError: "Impossible de scanner cette page (page protégée par le navigateur ?)",
    statusStopping: "Arrêt en cours... (les résultats déjà trouvés seront affichés)",
    statusPaused: (i, v, p, d) => `⏸ En pause — ${i} images, ${v} vidéos, ${p} PDFs, ${d} Cloud trouvés jusqu'ici.`,
    statusProgress: (idx, i, v, p, d) => `Défilement ${idx}... ${i} images, ${v} vidéos, ${p} PDFs, ${d} Cloud trouvés.`,
    statusDone: (prefix, i, v, p, d) => `${prefix}Trouvé : ${i} images, ${v} vidéos, ${p} PDFs, ${d} fichiers Cloud (Drive/Dropbox).`,
    stoppedPrefix: "Scan arrêté manuellement. ",
    statusCheckingHistory: (folder) => `Vérification de l'historique pour "${folder}/"...`,
    statusDownloadProgress: (n, total, skipped) => `Téléchargement ${n}/${total}... (${skipped} déjà présents, ignorés)`,
    statusDownloadDone: (n, folder, skipNote) => `${n} nouveau(x) fichier(s) téléchargé(s) dans "${folder}/"${skipNote}. index.html mis à jour et consolidé.`,
    skipNote: (n) => ` (${n} déjà présents, ignorés)`,
    resetConfirm: (folder) => `Oublier l'historique de téléchargement pour "${folder}" ?\nLe prochain téléchargement retéléchargera tout et régénérera l'index.html en repartant de zéro.`,
    resetNeedsScan: "Lance d'abord un scan pour identifier le site.",
    resetDone: (folder) => `Historique de "${folder}" oublié.`,
    indexTitle: (site) => `Médias téléchargés — ${site}`,
    indexHeading: "Médias téléchargés",
    indexSource: "Source :",
    indexGenerated: "Généré le",
    indexNone: "Aucun fichier téléchargé.",
    defaultFilename: "fichier",
    defaultFolder: "site",
    categoryTitles: { images: "🖼️ Images", videos: "🎬 Vidéos", pdfs: "📄 PDFs", drive: "☁️ Cloud (Drive / Dropbox)" },
    htmlLang: "fr",
    dateLocale: "fr-FR",
  },
  en: {
    appTitle: "Media Downloader",
    autoScrollLabel: "Auto-scroll (infinite-loading pages, e.g. Facebook)",
    scanBtn: "Scan page",
    pauseBtn: "⏸ Pause",
    resumeBtn: "▶ Resume",
    stopBtn: "⏹ Stop",
    tabImages: "Images",
    tabVideos: "Videos",
    tabPdfs: "PDFs",
    tabDrive: "Cloud",
    selectAll: "Select all",
    selectNone: "Deselect all",
    minImageSizeLabel: "Min. image size (px):",
    minImageSizeHint: "(0 = off)",
    downloadBtn: "Download selection",
    downloadBtnCount: (n) => `Download selection (${n})`,
    resetHistory: "Forget this site's history (start fresh)",
    initialEmpty: 'Click "Scan page" to get started.',
    emptyCategory: "Nothing found in this category.",
    emptyFiltered: "No image is larger than the minimum size.",
    filteredNote: (shown, total) => `${shown} / ${total} shown (size filter active).`,
    statusScanPrep: "Preparing scan...",
    statusScanError: "Couldn't scan this page (browser-protected page?)",
    statusStopping: "Stopping... (results found so far will be shown)",
    statusPaused: (i, v, p, d) => `⏸ Paused — ${i} images, ${v} videos, ${p} PDFs, ${d} Cloud found so far.`,
    statusProgress: (idx, i, v, p, d) => `Scrolling ${idx}... ${i} images, ${v} videos, ${p} PDFs, ${d} Cloud found.`,
    statusDone: (prefix, i, v, p, d) => `${prefix}Found: ${i} images, ${v} videos, ${p} PDFs, ${d} Cloud files (Drive/Dropbox).`,
    stoppedPrefix: "Scan stopped manually. ",
    statusCheckingHistory: (folder) => `Checking history for "${folder}/"...`,
    statusDownloadProgress: (n, total, skipped) => `Downloading ${n}/${total}... (${skipped} already present, skipped)`,
    statusDownloadDone: (n, folder, skipNote) => `${n} new file(s) downloaded to "${folder}/"${skipNote}. index.html updated and consolidated.`,
    skipNote: (n) => ` (${n} already present, skipped)`,
    resetConfirm: (folder) => `Forget download history for "${folder}"?\nThe next download will re-download everything and rebuild index.html from scratch.`,
    resetNeedsScan: "Run a scan first to identify the site.",
    resetDone: (folder) => `History for "${folder}" forgotten.`,
    indexTitle: (site) => `Downloaded media — ${site}`,
    indexHeading: "Downloaded media",
    indexSource: "Source:",
    indexGenerated: "Generated on",
    indexNone: "No file downloaded.",
    defaultFilename: "file",
    defaultFolder: "site",
    categoryTitles: { images: "🖼️ Images", videos: "🎬 Videos", pdfs: "📄 PDFs", drive: "☁️ Cloud (Drive / Dropbox)" },
    htmlLang: "en",
    dateLocale: "en-US",
  },
};

let uiLang = "fr";

function t(key, ...args) {
  const dict = translations[uiLang] || translations.fr;
  const val = dict[key];
  return typeof val === "function" ? val(...args) : val !== undefined ? val : key;
}

function guessDefaultLang() {
  try {
    const browserLang = chrome.i18n.getUILanguage() || navigator.language || "fr";
    return browserLang.toLowerCase().startsWith("fr") ? "fr" : "en";
  } catch {
    return "fr";
  }
}

function applyStaticTranslations() {
  document.getElementById("appTitle").textContent = t("appTitle");
  document.getElementById("autoScrollLabel").textContent = t("autoScrollLabel");
  document.getElementById("scanBtn").textContent = t("scanBtn");
  document.getElementById("pauseBtn").textContent = isPaused ? t("resumeBtn") : t("pauseBtn");
  document.getElementById("stopBtn").textContent = t("stopBtn");
  document.getElementById("tabImagesLabel").textContent = t("tabImages");
  document.getElementById("tabVideosLabel").textContent = t("tabVideos");
  document.getElementById("tabPdfsLabel").textContent = t("tabPdfs");
  document.getElementById("tabDriveLabel").textContent = t("tabDrive");
  document.getElementById("selectAll").textContent = t("selectAll");
  document.getElementById("selectNone").textContent = t("selectNone");
  document.getElementById("minImageSizeLabel").textContent = t("minImageSizeLabel");
  document.getElementById("minImageSizeHint").textContent = t("minImageSizeHint");
  document.getElementById("resetHistory").textContent = t("resetHistory");
  document.documentElement.lang = t("htmlLang");

  const initialEmptyEl = document.getElementById("initialEmpty");
  if (initialEmptyEl) initialEmptyEl.textContent = t("initialEmpty");

  updateDownloadBtn();

  document.getElementById("langFr").style.fontWeight = uiLang === "fr" ? "bold" : "normal";
  document.getElementById("langFr").style.color = uiLang === "fr" ? "#2563eb" : "#94a3b8";
  document.getElementById("langEn").style.fontWeight = uiLang === "en" ? "bold" : "normal";
  document.getElementById("langEn").style.color = uiLang === "en" ? "#2563eb" : "#94a3b8";

  const versionInfoEl = document.getElementById("versionInfo");
  if (versionInfoEl) {
    versionInfoEl.textContent = `${t("appTitle")} v${chrome.runtime.getManifest().version}`;
  }
}

async function setLang(lang) {
  uiLang = lang === "en" ? "en" : "fr";
  await chrome.storage.local.set({ uiLang });
  applyStaticTranslations();
  // Un scan a peut-être déjà rempli la liste : on la ré-affiche dans la nouvelle langue
  // sans perdre les résultats ni la sélection en cours.
  if ((media[currentTab] || []).length > 0 || listEl.querySelector(".empty")) {
    renderList();
  }
}

document.getElementById("langFr").addEventListener("click", () => setLang("fr"));
document.getElementById("langEn").addEventListener("click", () => setLang("en"));

(async () => {
  const stored = await chrome.storage.local.get("uiLang");
  uiLang = stored.uiLang || guessDefaultLang();
  applyStaticTranslations();
})();

// ---------------------------------------------------------------------------

let media = { images: [], videos: [], pdfs: [], drive: [] };
let currentTab = "images";
let activeTabId = null;
let activeTabUrl = null;
let isPaused = false;

// Sélection conservée par catégorie, même en changeant d'onglet dans le popup.
const selected = { images: new Set(), videos: new Set(), pdfs: new Set(), drive: new Set() };

const listEl = document.getElementById("list");
const statusEl = document.getElementById("status");
const downloadBtn = document.getElementById("downloadBtn");
const scanBtn = document.getElementById("scanBtn");
const scrollControls = document.getElementById("scrollControls");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");

document.getElementById("scanBtn").addEventListener("click", startScan);
document.getElementById("downloadBtn").addEventListener("click", downloadSelected);
document.getElementById("resetHistory").addEventListener("click", resetSiteHistory);

document.getElementById("selectAll").addEventListener("click", () => toggleAll(true));
document.getElementById("selectNone").addEventListener("click", () => toggleAll(false));
document.getElementById("minImageSize").addEventListener("input", () => {
  if (currentTab === "images") renderList();
});
pauseBtn.addEventListener("click", togglePause);
stopBtn.addEventListener("click", stopScan);

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.type;
    renderList();
  });
});

// Écoute les messages de progression / fin envoyés par le content script.
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (sender.tab && activeTabId !== null && sender.tab.id !== activeTabId) return;

  if (msg.type === "mediaDownloaderProgress") {
    media = msg.media;
    updateCounts();

    // Si l'onglet affiché est encore vide (l'utilisateur attend), on le peuple dès
    // que des résultats arrivent, sans pour autant écraser une sélection en cours.
    const hasEmptyPlaceholder = listEl.querySelector(".empty") !== null;
    const currentItems = media[currentTab] || [];
    if (hasEmptyPlaceholder && currentItems.length > 0) {
      renderList();
    }

    statusEl.textContent = msg.paused
      ? t("statusPaused", media.images.length, media.videos.length, media.pdfs.length, media.drive.length)
      : t("statusProgress", msg.scrollIndex, media.images.length, media.videos.length, media.pdfs.length, media.drive.length);
  } else if (msg.type === "mediaDownloaderDone") {
    media = msg.media;
    finishScan(msg.stopped);
  }
});

function updateCounts() {
  document.getElementById("countImages").textContent = media.images.length;
  document.getElementById("countVideos").textContent = media.videos.length;
  document.getElementById("countPdfs").textContent = media.pdfs.length;
  document.getElementById("countDrive").textContent = media.drive.length;
}

async function startScan() {
  const autoScroll = document.getElementById("autoScroll").checked;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabId = tab.id;
  activeTabUrl = tab.url;

  scanBtn.disabled = true;
  statusEl.textContent = t("statusScanPrep");
  listEl.innerHTML = "";

  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    await chrome.tabs.sendMessage(tab.id, {
      type: "mediaDownloaderStart",
      options: { autoScroll, maxScrolls: 40, waitMs: 700 },
    });
  } catch (err) {
    statusEl.textContent = t("statusScanError");
    scanBtn.disabled = false;
    return;
  }

  if (autoScroll) {
    isPaused = false;
    pauseBtn.textContent = t("pauseBtn");
    scrollControls.style.display = "flex";
  }
}

function togglePause() {
  if (!activeTabId) return;
  isPaused = !isPaused;
  chrome.tabs.sendMessage(activeTabId, { type: isPaused ? "mediaDownloaderPause" : "mediaDownloaderResume" });
  pauseBtn.textContent = isPaused ? t("resumeBtn") : t("pauseBtn");
}

function stopScan() {
  if (!activeTabId) return;
  chrome.tabs.sendMessage(activeTabId, { type: "mediaDownloaderStop" });
  statusEl.textContent = t("statusStopping");
}

function finishScan(wasStopped) {
  scanBtn.disabled = false;
  scrollControls.style.display = "none";
  isPaused = false;

  updateCounts();

  const prefix = wasStopped ? t("stoppedPrefix") : "";
  statusEl.textContent = t("statusDone", prefix, media.images.length, media.videos.length, media.pdfs.length, media.drive.length);
  renderList();
}

function passesImageSizeFilter(entry) {
  const threshold = parseInt(document.getElementById("minImageSize").value, 10) || 0;
  if (threshold <= 0) return true;
  // Taille inconnue (image pas encore chargée au moment du scan, variante srcset...) :
  // on ne filtre pas par précaution, pour ne jamais masquer une vraie image par erreur.
  if (!entry.width || !entry.height) return true;
  return entry.width >= threshold && entry.height >= threshold;
}

function getDisplayedItems(category) {
  const items = media[category] || [];
  if (category === "images") {
    return items.filter(passesImageSizeFilter);
  }
  return items;
}

function renderList() {
  const allItems = media[currentTab] || [];
  const items = getDisplayedItems(currentTab);
  listEl.innerHTML = "";

  document.getElementById("imageFilterRow").style.display = currentTab === "images" ? "flex" : "none";

  if (allItems.length === 0) {
    listEl.innerHTML = `<div class="empty">${t("emptyCategory")}</div>`;
    updateDownloadBtn();
    return;
  }

  if (items.length === 0) {
    listEl.innerHTML = `<div class="empty">${t("emptyFiltered")}</div>`;
    updateDownloadBtn();
    return;
  }

  if (currentTab === "images" && items.length < allItems.length) {
    const note = document.createElement("div");
    note.style.cssText = "font-size:10px; color:#94a3b8; padding:2px 4px 6px;";
    note.textContent = t("filteredNote", items.length, allItems.length);
    listEl.appendChild(note);
  }

  items.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.url = entry.url;
    checkbox.checked = selected[currentTab].has(entry.url);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selected[currentTab].add(entry.url);
      } else {
        selected[currentTab].delete(entry.url);
      }
      updateDownloadBtn();
    });

    const nameSpan = document.createElement("span");
    nameSpan.className = "url";
    nameSpan.textContent = entry.filename;
    nameSpan.title = entry.url;

    row.appendChild(checkbox);

    if (currentTab === "images") {
      const thumb = document.createElement("img");
      thumb.className = "thumb";
      thumb.src = entry.url;
      thumb.onerror = () => (thumb.style.visibility = "hidden");
      row.appendChild(thumb);
    } else if (currentTab === "videos") {
      if (entry.poster) {
        const thumb = document.createElement("img");
        thumb.className = "thumb";
        thumb.src = entry.poster;
        thumb.onerror = () => thumb.replaceWith(makeIcon("🎬"));
        row.appendChild(thumb);
      } else {
        row.appendChild(makeIcon("🎬"));
      }
    } else if (currentTab === "pdfs") {
      row.appendChild(makeIcon("📄"));
    } else if (currentTab === "drive") {
      row.appendChild(makeIcon(entry.provider === "dropbox" ? "📦" : entry.provider === "vk" ? "📎" : "🗂️"));
    }

    row.appendChild(nameSpan);
    listEl.appendChild(row);
  });

  updateDownloadBtn();
}

function makeIcon(emoji) {
  const span = document.createElement("span");
  span.className = "thumb";
  span.style.display = "flex";
  span.style.alignItems = "center";
  span.style.justifyContent = "center";
  span.style.fontSize = "16px";
  span.textContent = emoji;
  return span;
}

function toggleAll(checked) {
  const items = getDisplayedItems(currentTab);
  if (checked) {
    items.forEach((entry) => selected[currentTab].add(entry.url));
  } else {
    items.forEach((entry) => selected[currentTab].delete(entry.url));
  }
  listEl.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = checked));
  updateDownloadBtn();
}

function updateDownloadBtn() {
  const total = Object.values(selected).reduce((sum, set) => sum + set.size, 0);
  downloadBtn.disabled = total === 0;
  downloadBtn.textContent = total > 0 ? t("downloadBtnCount", total) : t("downloadBtn");
}

function manifestKeyFor(siteFolder) {
  return `manifest:${siteFolder}`;
}

async function loadManifest(siteFolder) {
  const key = manifestKeyFor(siteFolder);
  const stored = await chrome.storage.local.get(key);
  return stored[key] || { images: [], videos: [], pdfs: [], drive: [] };
}

async function saveManifest(siteFolder, manifest) {
  await chrome.storage.local.set({ [manifestKeyFor(siteFolder)]: manifest });
}

async function resetSiteHistory() {
  let siteFolder = t("defaultFolder");
  try {
    siteFolder = sanitizeFolderName(new URL(activeTabUrl).hostname);
  } catch {
    statusEl.textContent = t("resetNeedsScan");
    return;
  }
  if (!confirm(t("resetConfirm", siteFolder))) {
    return;
  }
  await chrome.storage.local.remove(manifestKeyFor(siteFolder));
  statusEl.textContent = t("resetDone", siteFolder);
}

const CATEGORY_FOLDERS = {
  images: "images",
  videos: "videos",
  pdfs: "pdfs",
  drive: "cloud",
};

function sanitizeFilename(name) {
  const cleaned = (name || t("defaultFilename")).replace(/[\\/:*?"<>|\u0000-\u001F]/g, "_").trim();
  return cleaned.slice(0, 150) || t("defaultFilename");
}

function sanitizeFolderName(hostname) {
  return (hostname || t("defaultFolder")).replace(/[^a-zA-Z0-9.-]/g, "_");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildIndexHtml(siteFolder, sourceUrl, downloadedByCategory) {
  const categoryTitles = t("categoryTitles");
  const sections = Object.keys(CATEGORY_FOLDERS)
    .map((key) => {
      const items = downloadedByCategory[key] || [];
      if (items.length === 0) return "";
      const cards = items
        .map((it) => {
          const thumb = it.isImage
            ? `<img src="${escapeHtml(it.relPath)}" alt="${escapeHtml(it.name)}" loading="lazy">`
            : `<div class="icon">${it.icon}</div>`;
          return `<div class="card">
            <a href="${escapeHtml(it.relPath)}" target="_blank" rel="noopener">${thumb}</a>
            <div class="name" title="${escapeHtml(it.name)}">${escapeHtml(it.name)}</div>
          </div>`;
        })
        .join("\n");
      return `<section>
        <h2>${categoryTitles[key]} <span class="count">(${items.length})</span></h2>
        <div class="grid">${cards}</div>
      </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${t("htmlLang")}">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(t("indexTitle", siteFolder))}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { font-size: 12px; color: #64748b; margin-bottom: 24px; word-break: break-all; }
  .meta a { color: #2563eb; }
  h2 { font-size: 15px; margin: 28px 0 12px; }
  .count { color: #94a3b8; font-weight: normal; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
  .card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; text-align: center; }
  .card a { text-decoration: none; color: inherit; display: block; }
  .card img { width: 100%; height: 100px; object-fit: cover; display: block; background: #f1f5f9; }
  .card .icon { width: 100%; height: 100px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: #f1f5f9; }
  .card .name { font-size: 11px; padding: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
</head>
<body>
  <h1>${t("indexHeading")}</h1>
  <p class="meta">${t("indexSource")} <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(sourceUrl)}</a><br>${t("indexGenerated")} ${new Date().toLocaleString(t("dateLocale"))}</p>
  ${sections || `<p>${t("indexNone")}</p>`}
</body>
</html>`;
}

function downloadFile(url, filename, options = {}) {
  return new Promise((resolve) => {
    chrome.downloads.download({ url, filename, saveAs: false, conflictAction: options.conflictAction || "uniquify" }, (downloadId) => {
      if (chrome.runtime.lastError || downloadId === undefined) {
        console.error("Erreur de téléchargement:", chrome.runtime.lastError && chrome.runtime.lastError.message);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

async function downloadSelected() {
  const total = Object.values(selected).reduce((sum, set) => sum + set.size, 0);
  if (total === 0) return;

  downloadBtn.disabled = true;

  let siteFolder = t("defaultFolder");
  try {
    siteFolder = sanitizeFolderName(new URL(activeTabUrl).hostname);
  } catch {
    /* URL absente ou invalide, on garde le nom par défaut */
  }

  statusEl.textContent = t("statusCheckingHistory", siteFolder);

  const manifest = await loadManifest(siteFolder);

  // URLs déjà téléchargées lors d'une session précédente (identité = URL source, pas le nom de fichier).
  const knownUrls = {};
  const usedNames = {};
  for (const category of Object.keys(CATEGORY_FOLDERS)) {
    knownUrls[category] = new Set((manifest[category] || []).map((e) => e.sourceUrl));
    usedNames[category] = new Set((manifest[category] || []).map((e) => e.name.toLowerCase()));
  }

  let newCount = 0;
  let skippedDuplicates = 0;
  const toDownloadTotal = total;

  for (const [category, folder] of Object.entries(CATEGORY_FOLDERS)) {
    const items = (media[category] || []).filter((entry) => selected[category].has(entry.url));

    for (const entry of items) {
      if (knownUrls[category].has(entry.url)) {
        skippedDuplicates++;
        continue; // déjà téléchargé lors d'une session précédente pour ce site
      }

      let name = sanitizeFilename(entry.filename);
      if (usedNames[category].has(name.toLowerCase())) {
        const dot = name.lastIndexOf(".");
        const base = dot > 0 ? name.slice(0, dot) : name;
        const ext = dot > 0 ? name.slice(dot) : "";
        let i = 2;
        let candidate = `${base} (${i})${ext}`;
        while (usedNames[category].has(candidate.toLowerCase())) {
          i++;
          candidate = `${base} (${i})${ext}`;
        }
        name = candidate;
      }
      usedNames[category].add(name.toLowerCase());
      knownUrls[category].add(entry.url);

      const relPath = `${folder}/${name}`;
      statusEl.textContent = t("statusDownloadProgress", newCount + 1, toDownloadTotal - skippedDuplicates, skippedDuplicates);

      const ok = await downloadFile(entry.url, `${siteFolder}/${relPath}`);
      if (ok) {
        newCount++;
        manifest[category] = manifest[category] || [];
        manifest[category].push({
          sourceUrl: entry.url,
          relPath,
          name,
          isImage: category === "images",
          icon: category === "videos" ? "🎬" : category === "pdfs" ? "📄" : entry.provider === "dropbox" ? "📦" : entry.provider === "vk" ? "📎" : "🗂️",
        });
      }
    }
  }

  await saveManifest(siteFolder, manifest);

  // La page d'index est reconstruite à partir du manifeste complet (anciennes + nouvelles
  // sessions confondues), donc toujours consolidée, et on force l'écrasement du fichier
  // précédent pour ne jamais accumuler des index (1).html, index (2).html, etc.
  const indexHtml = buildIndexHtml(siteFolder, activeTabUrl || "", manifest);
  const indexUrl = "data:text/html;charset=utf-8," + encodeURIComponent(indexHtml);
  await downloadFile(indexUrl, `${siteFolder}/index.html`, { conflictAction: "overwrite" });

  downloadBtn.disabled = false;
  const skipNote = skippedDuplicates > 0 ? t("skipNote", skippedDuplicates) : "";
  statusEl.textContent = t("statusDownloadDone", newCount, siteFolder, skipNote);
}
