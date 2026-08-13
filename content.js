// Content script injecté à la demande. Reste actif tant que l'onglet n'est pas rechargé,
// ce qui permet au popup de lui envoyer des commandes (pause/reprise/stop) pendant le scroll.
(() => {
  if (window.__mediaDownloaderInitialized) {
    return; // déjà injecté sur cet onglet, on ne réinitialise pas l'état en cours
  }
  window.__mediaDownloaderInitialized = true;

  const state = { running: false, paused: false, stopped: false };

  // Collections conservées au niveau module pour rester consultables
  // même après la fin du scan (ex: popup rouvert plus tard).
  const images = new Map(); // url -> { width, height } (dimensions max connues)
  const videos = new Set();
  const pdfs = new Set();
  const videoPosters = {};
  const driveFiles = new Map(); // id -> label
  const dropboxFiles = new Map(); // url (sans dl forcé) -> label
  const vkFiles = new Map(); // url -> label

  const toAbsolute = (url) => {
    try {
      return new URL(url, location.href).href;
    } catch {
      return null;
    }
  };

  const filenameFromUrl = (url) => {
    try {
      const path = new URL(url).pathname;
      return decodeURIComponent(path.split("/").filter(Boolean).pop() || url);
    } catch {
      return url;
    }
  };

  // Facebook enveloppe souvent les liens externes (surtout hors domaines "connus" comme
  // Google Drive) dans une redirection l.facebook.com/l.php?u=<url encodée>. Sans ce
  // décodage, l'URL visible ne se termine jamais par .pdf ni ne contient dropbox.com.
  function unwrapFacebookRedirect(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      if ((host === "l.facebook.com" || host === "lm.facebook.com") && u.searchParams.has("u")) {
        return decodeURIComponent(u.searchParams.get("u"));
      }
    } catch {
      /* URL invalide, on renvoie l'originale */
    }
    return url;
  }

  function isDropboxFileLink(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      if (host !== "dropbox.com") {
        return false;
      }
      // Liens de partage typiques : /s/..., /scl/fi/..., /sh/...
      // On exclut la page d'accueil, le login, etc. (chemin quasi vide)
      return u.pathname.length > 3;
    } catch {
      return false;
    }
  }

  // Force le téléchargement direct du fichier au lieu d'ouvrir la visionneuse Dropbox.
  function dropboxDirectUrl(url) {
    try {
      const u = new URL(url);
      u.searchParams.delete("dl");
      u.searchParams.set("dl", "1");
      return u.toString();
    } catch {
      return url;
    }
  }

  function isVkDocLink(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^m\./, "").replace(/^www\./, "");
      if (host !== "vk.com" && host !== "vk.ru") {
        return false;
      }
      // Format des documents VK : /doc<owner_id, parfois négatif>_<doc_id>,
      // ex. /doc-15164027_679123456
      return /^\/doc-?\d+_\d+/.test(u.pathname);
    } catch {
      return false;
    }
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Clique sur les liens "Voir plus" / "See more" pour révéler le texte tronqué
  // (et donc les liens qu'il contient) avant de scanner le DOM.
  //
  // Facebook n'utilise pas toujours un texte strictement égal à "Voir plus" :
  // espaces insécables (\u00a0), points de suspension collés, ou un élément
  // cliquable sans role="button" explicite (juste tabindex="0"). On normalise
  // le texte et on élargit le sélecteur pour couvrir ces cas.
  function expandTruncatedText() {
    const candidates = document.querySelectorAll(
      'div[role="button"], span[role="button"], a[role="button"], [tabindex="0"]'
    );
    let clicked = 0;

    const expandPhrases = ["voir plus", "see more", "display more", "mehr anzeigen", "ver más", "ver mais"];
    const collapsePhrases = ["voir moins", "see less", "réduire"]; // à ne surtout pas cliquer

    candidates.forEach((el) => {
      const raw = el.textContent || "";
      const text = raw
        .replace(/[\u00a0\u2026]/g, " ") // espace insécable + points de suspension -> espace normal
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

      if (!text || text.length > 40) {
        return; // évite de matcher un gros bloc de texte contenant le mot par hasard
      }
      if (collapsePhrases.some((p) => text.includes(p))) {
        return;
      }

      const isExpandLabel = expandPhrases.some((p) => text === p || text.endsWith(p));
      if (!isExpandLabel) {
        return;
      }
      if (el.offsetParent === null) {
        return; // élément caché, on ignore
      }

      try {
        el.click();
        clicked++;
      } catch {
        /* certains éléments peuvent refuser le clic, on continue */
      }
    });

    return clicked;
  }

  // Enregistre une image trouvée en gardant les plus grandes dimensions connues
  // (utile car un même visuel peut apparaître plusieurs fois avec des tailles différentes,
  // ex. srcset ou vignette + version pleine taille).
  function recordImage(url, width, height) {
    const existing = images.get(url);
    const area = (width || 0) * (height || 0);
    const existingArea = existing ? existing.width * existing.height : -1;
    if (!existing || area > existingArea) {
      images.set(url, { width: width || 0, height: height || 0 });
    }
  }

  function scanOnce() {
    document.querySelectorAll("img").forEach((img) => {
      // Beaucoup de sites (dont VK en version mobile) chargent les images en différé :
      // src reste vide (ou pointe vers un pixel transparent en data:) tant que l'image
      // n'a pas défilé dans le viewport, la vraie URL étant dans data-src ou équivalent.
      let raw = img.getAttribute("src");
      if (!raw || raw.startsWith("data:")) {
        raw =
          img.getAttribute("data-src") ||
          img.getAttribute("data-original") ||
          img.getAttribute("data-lazy-src") ||
          img.getAttribute("data-lazy") ||
          raw;
      }
      const url = toAbsolute(raw);
      if (!url) {
        return;
      }
      // naturalWidth/Height = dimensions réelles du fichier (0 si pas encore chargé).
      // width/height = taille affichée à l'écran, utilisée en repli.
      recordImage(url, img.naturalWidth || img.width, img.naturalHeight || img.height);
    });

    document.querySelectorAll("picture source[srcset], img[srcset]").forEach((el) => {
      el.srcset.split(",").forEach((part) => {
        const url = toAbsolute(part.trim().split(" ")[0]);
        if (url && !images.has(url)) {
          recordImage(url, 0, 0); // taille inconnue pour les variantes srcset
        }
      });
    });

    // Images posées en background-image CSS (bannières, logos, mosaïques...), invisibles
    // aux sélecteurs <img>. On ne visite que les éléments visibles à l'écran à l'instant du
    // scan (rect non nul) pour limiter le coût de getComputedStyle sur les grosses pages.
    document.querySelectorAll("*").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) {
        return;
      }

      const bg = getComputedStyle(el).backgroundImage;
      if (!bg || bg === "none") {
        return;
      }

      const matches = bg.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g);
      for (const m of matches) {
        const url = toAbsolute(m[1]);
        if (url) {
          recordImage(url, Math.round(rect.width), Math.round(rect.height));
        }
      }
    });

    document.querySelectorAll("video").forEach((v) => {
      const poster = v.poster ? toAbsolute(v.poster) : null;
      if (v.src) {
        const url = toAbsolute(v.src);
        if (url) {
          videos.add(url);
          if (poster) {
            videoPosters[url] = poster;
          }
        }
      }
      v.querySelectorAll("source[src]").forEach((s) => {
        const url = toAbsolute(s.src);
        if (url) {
          videos.add(url);
          if (poster) {
            videoPosters[url] = poster;
          }
        }
      });
    });

    document.querySelectorAll("a[href]").forEach((a) => {
      const rawHref = a.getAttribute("href") || "";
      let url = toAbsolute(rawHref);
      if (!url) {
        return;
      }

      url = unwrapFacebookRedirect(url); // récupère l'URL réelle si Facebook l'a enveloppée

      if (/\.pdf(\?|#|$)/i.test(url)) {
        pdfs.add(url);
        return;
      }

      const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
        url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/) ||
        url.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/) ||
        url.match(/docs\.google\.com\/\w+\/d\/([a-zA-Z0-9_-]+)/);

      if (driveMatch) {
        const id = driveMatch[1];
        if (!driveFiles.has(id)) {
          const label = (a.textContent || "").trim();
          driveFiles.set(id, label || null);
        }
        return;
      }

      if (isDropboxFileLink(url)) {
        if (!dropboxFiles.has(url)) {
          const label = (a.textContent || "").trim();
          dropboxFiles.set(url, label || null);
        }
        return;
      }

      if (isVkDocLink(url)) {
        if (!vkFiles.has(url)) {
          const label = (a.textContent || "").trim();
          vkFiles.set(url, label || null);
        }
      }
    });

    document.querySelectorAll("embed[src], object[data]").forEach((el) => {
      const src = el.getAttribute("src") || el.getAttribute("data");
      const url = toAbsolute(src);
      if (url && /\.pdf(\?|#|$)/i.test(url)) {
        pdfs.add(url);
      }
    });
  }

  function buildResult() {
    const toEntry = (url) => ({ url, filename: filenameFromUrl(url) });
    const driveEntries = Array.from(driveFiles.entries()).map(([id, label]) => ({
      url: `https://drive.google.com/uc?export=download&id=${id}`,
      viewUrl: `https://drive.google.com/file/d/${id}/view`,
      filename: label || `drive-${id}`,
      provider: "drive",
    }));
    const dropboxEntries = Array.from(dropboxFiles.entries()).map(([url, label]) => ({
      url: dropboxDirectUrl(url),
      viewUrl: url,
      filename: label || filenameFromUrl(url),
      provider: "dropbox",
    }));
    const vkEntries = Array.from(vkFiles.entries()).map(([url, label]) => ({
      url,
      viewUrl: url,
      filename: label || filenameFromUrl(url),
      provider: "vk",
    }));
    return {
      images: Array.from(images.entries()).map(([url, dim]) => ({
        ...toEntry(url),
        width: dim.width,
        height: dim.height,
      })),
      videos: Array.from(videos).map((url) => ({ ...toEntry(url), poster: videoPosters[url] || null })),
      pdfs: Array.from(pdfs).map(toEntry),
      drive: [...driveEntries, ...dropboxEntries, ...vkEntries],
    };
  }

  function sendProgress(scrollIndex) {
    chrome.runtime
      .sendMessage({
        type: "mediaDownloaderProgress",
        scrollIndex,
        paused: state.paused,
        media: buildResult(),
      })
      .catch(() => {}); // le popup peut être fermé, on ignore l'échec
  }

  async function runScan(options) {
    if (state.running) {
      return; // un scan est déjà en cours, on l'ignore
    }

    const autoScroll = Boolean(options.autoScroll);
    const maxScrolls = options.maxScrolls || 40;
    const waitMs = options.waitMs || 700;

    state.running = true;
    state.paused = false;
    state.stopped = false;

    if (expandTruncatedText() > 0) {
      await sleep(200);
    }
    scanOnce();
    sendProgress(0);

    if (autoScroll) {
      let lastHeight = 0;
      let stableCount = 0;

      for (let i = 0; i < maxScrolls; i++) {
        if (state.stopped) {
          break;
        }

        while (state.paused && !state.stopped) {
          await sleep(200); // attente active légère tant que c'est en pause
        }
        if (state.stopped) {
          break;
        }

        window.scrollTo(0, document.body.scrollHeight);
        await sleep(waitMs);
        if (expandTruncatedText() > 0) {
          await sleep(200);
        }
        scanOnce();
        sendProgress(i + 1);

        const newHeight = document.body.scrollHeight;
        if (newHeight === lastHeight) {
          stableCount++;
          if (stableCount >= 3) {
            break; // plus rien de nouveau ne charge
          }
        } else {
          stableCount = 0;
        }
        lastHeight = newHeight;
      }
    }

    state.running = false;
    const wasStopped = state.stopped;
    state.stopped = false;

    chrome.runtime
      .sendMessage({ type: "mediaDownloaderDone", media: buildResult(), stopped: wasStopped })
      .catch(() => {});
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg.type) {
      case "mediaDownloaderStart":
        runScan(msg.options || {});
        sendResponse({ ok: true });
        break;
      case "mediaDownloaderPause":
        state.paused = true;
        sendResponse({ ok: true });
        break;
      case "mediaDownloaderResume":
        state.paused = false;
        sendResponse({ ok: true });
        break;
      case "mediaDownloaderStop":
        state.stopped = true;
        state.paused = false;
        sendResponse({ ok: true });
        break;
      case "mediaDownloaderGetStatus":
        sendResponse({ running: state.running, paused: state.paused, media: buildResult() });
        break;
      default:
        return false;
    }
    return true; // laisse la porte ouverte à une réponse asynchrone
  });
})();
