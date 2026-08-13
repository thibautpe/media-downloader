# Media Downloader — extension de navigateur

Scanne la page active et permet de télécharger en un clic les images, vidéos et PDFs qui s'y trouvent.

## Installation (mode développeur)

1. Ouvre `chrome://extensions` (ou `edge://extensions` sur Edge).
2. Active le **mode développeur** (interrupteur en haut à droite).
3. Clique sur **Charger l'extension non empaquetée**.
4. Sélectionne le dossier `media-downloader`.
5. L'icône de l'extension apparaît dans la barre d'outils.

Sur Firefox : ouvre `about:debugging#/runtime/this-firefox` → **Charger un module complémentaire temporaire** → sélectionne `manifest.json`. (Firefox nécessite quelques ajustements de manifest pour une installation permanente, voir plus bas.)

## Utilisation

1. Va sur la page contenant les fichiers à télécharger.
2. Clique sur l'icône de l'extension.
3. Clique sur **Scanner la page**.
4. Bascule entre les onglets Images / Vidéos / PDFs, coche ce que tu veux.
5. Clique sur **Télécharger la sélection**.

Les fichiers sont téléchargés via l'API native `chrome.downloads`, donc ils arrivent dans ton dossier de téléchargement habituel et apparaissent dans la barre de téléchargements du navigateur.

## Filtre par taille minimale + détection background-image

Dans l'onglet **Images**, un champ **« Taille min. images (px) »** permet d'écarter les petits éléments graphiques (logos, icônes, pastilles) qui polluent souvent les résultats. Mets par exemple `200` pour ne garder que les images d'au moins 200×200 px. `0` désactive le filtre.

Le filtre compare la **taille réelle du fichier** (`naturalWidth`/`naturalHeight`, pas la taille affichée à l'écran qui peut être réduite par du CSS). Si la taille n'est pas encore connue au moment du scan (image pas encore chargée, variante `srcset`), l'image **n'est jamais masquée par précaution** — mieux vaut un faux négatif qu'un vrai logo raté par erreur.

L'extension détecte aussi les images posées en **`background-image` CSS** (bannières, mosaïques de miniatures, avatars en fond...), invisibles aux sélecteurs `<img>` classiques. Leur taille est estimée d'après la taille affichée à l'écran de l'élément qui les porte.

**Limites connues sur ce point :**
- Les images CSS posées via des pseudo-éléments (`::before`, `::after`) ne sont pas détectées.
- Seuls les éléments visibles à l'écran au moment précis du scan sont analysés pour `background-image` (par souci de performance sur les grandes pages) — combine avec le défilement automatique pour couvrir toute la page.
- « Tout sélectionner » / « Tout désélectionner » n'agissent que sur les images actuellement affichées (donc déjà filtrées par la taille minimale).

## Langue de l'interface (français / anglais)

Un sélecteur **FR | EN** en haut du popup permet de basculer la langue à tout moment. Le choix est mémorisé (`chrome.storage.local`) et réappliqué à chaque ouverture du popup. Par défaut, l'extension devine la langue à partir de celle du navigateur (français si la langue du navigateur commence par « fr », anglais sinon).

Ce que la langue affecte :
- Tous les libellés et boutons du popup (onglets, statuts, bouton de téléchargement...).
- La page `index.html` générée (titres de section, texte source/date, attribut `lang` du document).

Ce qu'elle n'affecte **pas** :
- La détection des boutons « Voir plus » / « See more » sur la page scannée — l'extension reconnaît déjà plusieurs langues (FR, EN, DE, ES, PT) indépendamment de la langue de l'interface, car il s'agit de la langue du site visité, pas de celle de l'extension.
- Le nom et la description de l'extension dans `chrome://extensions`, qui suivent la langue du navigateur (mécanisme standard `_locales`/`chrome.i18n`, séparé du sélecteur du popup).

## Version

Le numéro de version courant est affiché en bas du popup, et visible aussi dans `chrome://extensions` sous le nom de l'extension. L'historique complet des changements est dans [`docs/CHANGELOG.md`](./docs/CHANGELOG.md).

Pour publier une nouvelle version après une modification : incrémente le champ `version` dans `manifest.json` (format `MAJEUR.MINEUR.CORRECTIF`) et ajoute une entrée en tête de `docs/CHANGELOG.md`.

## Défilement automatique (pages à chargement infini)

Certains sites (Facebook, Instagram, Twitter/X...) chargent le contenu au fur et à mesure du scroll, et **suppriment parfois du DOM** les posts déjà vus plus haut (virtualisation) pour économiser de la mémoire — un scan classique ne verrait donc que ce qui est visible à l'instant du clic.

Coche la case **« Défilement automatique »** avant de scanner : l'extension fait défiler la page par étapes (jusqu'à 40 étapes, avec une pause de 0,7s entre chaque pour laisser le contenu se charger), et fusionne les résultats trouvés à chaque étape plutôt que de les écraser. Le défilement s'arrête automatiquement si la hauteur de la page ne change plus après 3 étapes consécutives (fin du contenu atteinte).

Pendant un scan avec défilement automatique, deux boutons apparaissent :
- **⏸ Pause / ▶ Reprendre** : suspend le défilement à tout moment (utile si tu veux vérifier manuellement quelque chose sur la page, ou si le site affiche un pop-up bloquant à traiter avant de continuer). Le scan reprend exactement où il s'était arrêté.
- **⏹ Arrêter** : termine le scan immédiatement et affiche les résultats déjà collectés jusque-là (rien n'est perdu).

Le scan tourne dans un **content script persistant** injecté dans l'onglet : il continue même si tu fermes le popup entre-temps (mais tu ne pourras piloter pause/stop ou voir la progression qu'en rouvrant le popup pendant que l'onglet est toujours ouvert et non rechargé).

**Notes :**
- Le scan peut prendre 15 à 30 secondes selon la longueur de la page — l'onglet scrollera visiblement, c'est normal.
- Un rechargement de l'onglet (F5) réinitialise le content script et donc l'état du scan en cours.
- Sur des pages très longues (des centaines de posts), augmente `maxScrolls` dans `popup.js` (`options: { autoScroll, maxScrolls: 40, ... }`) si le scan s'arrête avant la fin.

## Pas de doublons entre plusieurs sessions, index toujours consolidé

Si tu scannes et télécharges deux fois la même page (ex. après avoir fait défiler plus loin, ou le lendemain), l'extension retient ce qui a déjà été récupéré pour chaque site :

- **Déduplication** : chaque fichier est identifié par son URL source. Un fichier déjà téléchargé lors d'une session précédente pour ce même site n'est **pas re-téléchargé** — il est simplement compté comme « déjà présent, ignoré » dans le message de statut. Seuls les éléments réellement nouveaux depuis la dernière fois sont récupérés.
- **Index consolidé** : `index.html` est reconstruit à chaque téléchargement à partir de **tout l'historique connu pour ce site** (anciennes + nouvelles sessions), pas seulement de la sélection du moment — et le fichier est explicitement écrasé (`conflictAction: "overwrite"`) pour ne jamais se retrouver avec `index (1).html`, `index (2).html`, etc. Il y a donc toujours un seul `index.html` à jour et complet.
- Cet historique est stocké localement par l'extension (`chrome.storage.local`), par nom de site — pas de connexion réseau, pas de compte, rien d'envoyé nulle part.
- Un lien **« Oublier l'historique de ce site »** sous le bouton de téléchargement permet de tout réinitialiser si tu veux forcer un re-téléchargement complet.

**Limite à connaître** : la déduplication se fait sur l'URL exacte du fichier. Si un site change l'URL derrière une même image/vidéo/PDF (CDN avec URL tournante, lien Drive régénéré, etc.), l'extension le traitera comme un nouveau fichier — ça reste un doublon de contenu, difficile à détecter sans télécharger et comparer les fichiers eux-mêmes.

## Compatibilité par site

La liste détaillée de ce qui est détecté pour chaque plateforme (Google Drive, Dropbox, VK, Facebook...) et de ce qui ne l'est pas encore est dans [`docs/COMPATIBILITE.md`](./docs/COMPATIBILITE.md).

## Support de VK

Les liens vers des documents VK (`vk.com/doc<owner_id>_<doc_id>`, `vk.ru/doc...`, versions mobiles `m.vk.com`/`m.vk.ru`) sont détectés et regroupés dans l'onglet **Cloud** avec l'icône 📎. C'est le format utilisé par VK pour les fichiers joints (PDFs, partitions, documents divers) dans les sujets de forum, messages et publications.

L'extension navigue directement vers l'URL du document pour le téléchargement (comme pour tout autre lien) — sur VK, cette URL sert généralement le fichier brut plutôt qu'une page de prévisualisation, donc ça fonctionne pour la majorité des cas sans traitement supplémentaire.

La détection d'images (`<img>`) a aussi été élargie pour couvrir le **lazy-loading** (chargement différé au scroll), une technique très utilisée sur les versions mobiles de sites comme VK : si l'attribut `src` d'une image pointe encore vers un pixel transparent (le `src` réel n'est posé qu'au moment où l'image entre dans le viewport), l'extension regarde aussi `data-src`, `data-original`, `data-lazy-src` et `data-lazy`.

**Limite connue** : les vidéos VK utilisent un lecteur personnalisé (pas une balise `<video>` standard) et ne sont pas détectées pour l'instant.

## Organisation en dossiers + page d'index

Le bouton **"Télécharger la sélection"** téléchargeait auparavant les fichiers en vrac dans le dossier de téléchargement par défaut. Il organise maintenant tout dans une arborescence par site :

```
Téléchargements/
└── www.facebook.com/          ← nom du site scanné
    ├── index.html              ← page récapitulative avec vignettes/liens
    ├── images/
    │   ├── photo.jpg
    │   └── photo (2).jpg       ← suffixe auto en cas de doublon de nom
    ├── videos/
    ├── documents/               ← PDFs, .txt, Word, Excel, PowerPoint, .gpx, .gp5
    └── cloud/                  ← fichiers Drive et Dropbox
```

**Comportement important : la sélection est conservée en changeant d'onglet.** Tu peux cocher des images, puis basculer sur l'onglet Vidéos et en cocher aussi, etc. — le compteur du bouton "Télécharger la sélection" cumule tout, et un seul clic télécharge l'ensemble, organisé par catégorie, avec un `index.html` unique qui référence tous les fichiers téléchargés (vignettes pour les images, icône + lien pour le reste).

**Notes :**
- Le nom du dossier racine reprend le nom d'hôte du site scanné (ex. `www.facebook.com`), assaini pour rester un nom de dossier valide.
- Les noms de fichiers sont nettoyés des caractères interdits (`: * ? " < > |`) et dédupliqués automatiquement si plusieurs fichiers partagent le même nom.
- L'`index.html` est un fichier statique généré côté extension (aucune connexion réseau requise pour l'ouvrir) — double-clique dessus pour parcourir visuellement ce qui a été récupéré.
- "Tout sélectionner" / "Tout désélectionner" agissent uniquement sur l'onglet actuellement affiché.

## Dépliage automatique des textes tronqués

Facebook (et d'autres sites) tronquent les longs textes avec un bouton **"Voir plus"** — tant que ce n'est pas déplié, les liens contenus dans le texte masqué (comme tes liens Drive/Dropbox) ne sont pas dans le DOM et ne peuvent pas être détectés.

L'extension clique automatiquement sur tous les boutons "Voir plus" visibles avant chaque scan (et à chaque étape du défilement automatique), dans plusieurs langues (FR, EN, DE, ES, PT). La détection tolère les espaces insécables et points de suspension que Facebook insère parfois dans le texte du bouton, et couvre aussi les éléments cliquables sans `role="button"` explicite.

## Résultats affichés en direct

Les compteurs des onglets (Images/Vidéos/PDFs/Cloud) et la liste se mettent maintenant à jour **pendant** le scan avec défilement automatique, pas seulement à la fin. Si tu cliques sur un onglet en cours de scan, tu verras les résultats trouvés jusque-là (ta sélection en cours n'est jamais écrasée par une mise à jour en arrière-plan — seule la première apparition de résultats dans un onglet encore vide se rafraîchit automatiquement).

## Dropbox et redirections Facebook

Deux problèmes fréquents sur Facebook empêchaient certains liens (notamment Dropbox) d'être détectés :

1. **Redirection cachée** : Facebook enveloppe parfois les liens externes dans une URL de redirection du type `l.facebook.com/l.php?u=<url encodée>`. L'extension décode maintenant automatiquement cette URL pour retrouver le vrai lien cible avant de l'analyser.
2. **Pas de support Dropbox** : les liens `dropbox.com/s/...`, `/scl/fi/...`, `/sh/...` sont maintenant détectés et convertis en lien de téléchargement direct (ajout de `dl=1` à l'URL), au même titre que Google Drive. Ils apparaissent dans l'onglet **Cloud**, avec une icône 📦 pour les distinguer des fichiers Drive (🗂️).

**Mêmes limites que pour Drive** : le fichier doit être partagé publiquement, sinon Dropbox affichera une page de connexion au lieu du fichier lors du téléchargement.

## Liens Google Drive

L'extension détecte aussi les liens `drive.google.com/file/d/{ID}/view` (et variantes `open?id=`, `uc?id=`, `docs.google.com/.../d/{ID}`) et les convertit automatiquement en lien de téléchargement direct (`drive.google.com/uc?export=download&id={ID}`), affichés dans l'onglet **Cloud** aux côtés des liens Dropbox.

**Conditions pour que ça fonctionne :**
- Le fichier doit être partagé publiquement ("Tous les utilisateurs disposant du lien" ou public), sinon Google renvoie une page de connexion au lieu du fichier.
- Pour les fichiers volumineux (~25 Mo et plus), Google peut afficher une page d'avertissement antivirus au lieu du fichier lui-même — l'extension télécharge alors cette page HTML par erreur. Dans ce cas, mieux vaut ouvrir le lien "Voir" manuellement et cliquer sur "Télécharger quand même".

## Limites connues

- **Images en `background-image` CSS** : non détectées (seulement `<img>`, `<picture>`, `srcset`). Peut être ajouté si besoin.
- **Vidéos en streaming (HLS/DASH, type `.m3u8`)** : le tag `<video>` pointe souvent vers un flux fragmenté que `chrome.downloads` ne saura pas assembler correctement. Fonctionne bien pour des fichiers vidéo directs (`.mp4`, `.webm`).
- **PDFs ouverts dans une visionneuse intégrée au site** (pas de lien `<a>` ni `<embed>` direct) : peuvent ne pas être détectés selon l'implémentation du site.
- **Contenu généré dynamiquement après le scan** (lazy-load au scroll) : relance un scan après avoir fait défiler la page.
- **CORS / droits d'accès** : `chrome.downloads.download` navigue directement vers l'URL ; si le fichier nécessite une authentification que le navigateur ne fournit pas automatiquement, le téléchargement peut échouer.

## Pistes d'évolution

- Ajouter un raccourci clavier pour lancer le scan.
- Filtrer par taille d'image minimale (éviter les icônes/logos).
- Ajouter la détection des `background-image` CSS.
- Renommer automatiquement les fichiers téléchargés (`filename` dans `chrome.downloads.download`).
- Ajouter un mode "scan automatique à l'ouverture du popup".

## Structure du projet

```
media-downloader/
├── manifest.json   # Configuration de l'extension (Manifest V3)
├── popup.html      # Interface du popup
├── popup.js        # Logique du popup : i18n, pilotage du scan, affichage, téléchargements
├── content.js      # Content script injecté dans la page : scan + défilement + pause/stop
├── _locales/       # Nom/description localisés (fr, en) pour chrome://extensions
├── .github/
│   └── copilot-instructions.md  # Conventions du projet pour GitHub Copilot
├── icons/          # Icônes de l'extension
├── docs/
│   ├── CHANGELOG.md    # Historique des versions
│   ├── COMPATIBILITE.md # Détail de ce qui est détecté par plateforme
│   └── compatibilite.html # synthèse visuelle de la compatibilité
├── README.md       # Accueil du projet et usage général
└── .gitignore
```
