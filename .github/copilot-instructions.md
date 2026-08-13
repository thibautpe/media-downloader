# Instructions pour GitHub Copilot — Media Downloader

## Contexte du projet

Extension de navigateur (Chrome/Edge, Manifest V3) qui scanne la page active pour détecter images, vidéos, documents (PDF, txt, Office, GPX, GP5) et liens vers du stockage cloud (Google Drive, Dropbox, VK), puis les télécharge de façon organisée (dossiers par type + `index.html` récapitulatif), avec déduplication entre sessions.

Fichiers principaux :
- `manifest.json` — configuration Manifest V3, permissions minimales.
- `popup.html` / `popup.js` — interface utilisateur, orchestration du scan, téléchargements, i18n, mémoire persistante (`chrome.storage.local`).
- `content.js` — script injecté dans la page cible (contexte isolé), fait le scan DOM réel et le défilement automatique ; communique avec le popup uniquement par `chrome.runtime` messages (`mediaDownloaderStart`/`Pause`/`Resume`/`Stop`/`Progress`/`Done`).
- `_locales/{fr,en}/messages.json` — nom/description de l'extension localisés (mécanisme `chrome.i18n`, indépendant du sélecteur de langue du popup).
- `CHANGELOG.md`, `COMPATIBILITE.md`, `README.md` — documentation à tenir à jour à chaque changement (voir règles ci-dessous).

## Règle n°1 — Versionnage automatique (obligatoire)

**Toute modification qui change le comportement pour l'utilisateur doit s'accompagner d'un incrément de version.** Ne jamais livrer un changement de code sans :

1. Incrémenter `"version"` dans `manifest.json`, en suivant le [versionnage sémantique](https://semver.org/lang/fr/) `MAJEUR.MINEUR.CORRECTIF` :
   - **CORRECTIF** (`x.y.Z+1`) : correction de bug, documentation seule, pas de nouveau comportement visible.
   - **MINEUR** (`x.Y+1.0`) : nouvelle fonctionnalité rétrocompatible (nouveau site supporté, nouveau filtre, etc.) — c'est le cas le plus fréquent sur ce projet.
   - **MAJEUR** (`X+1.0.0`) : changement qui casse la compatibilité (rare pour une extension personnelle — ex. structure de stockage incompatible sans migration).
2. Ajouter une entrée **en tête** de `CHANGELOG.md`, avec le même numéro de version entre crochets (`## [x.y.z]`), et des sous-sections `### Ajouté` / `### Modifié` / `### Corrigé` / `### Notes` selon ce qui s'applique. Rédiger en français, phrases courtes, décrire le comportement utilisateur plutôt que l'implémentation.
3. Ne jamais modifier le numéro de version sans entrée de changelog correspondante, ni l'inverse.

Le numéro de version est affiché dynamiquement dans le popup via `chrome.runtime.getManifest().version` (voir `versionInfo` dans `popup.js`) — ne jamais le coder en dur ailleurs.

## Règle n°2 — Internationalisation (FR/EN)

Toute chaîne de caractères visible par l'utilisateur (libellé, bouton, message de statut, contenu de `index.html` généré) doit passer par le système `t()` défini en tête de `popup.js` :

- Ajouter la clé dans **les deux** dictionnaires `translations.fr` et `translations.en`.
- Utiliser une fonction `(args...) => \`...\`` pour les chaînes paramétrées, une chaîne simple sinon.
- Ne jamais coder en dur du texte français ou anglais directement dans le DOM ou dans un template literal en dehors du dictionnaire.
- Exception assumée : les phrases de détection du bouton « Voir plus »/« See more » dans `content.js` (variable `expandPhrases`) concernent la langue du **site scanné**, pas celle de l'interface — ne pas les fusionner avec le système `t()`.

## Règle n°3 — Documentation à jour

- **`COMPATIBILITE.md`** : toute nouvelle plateforme (site, format de lien) ou tout nouveau type de fichier détecté doit être ajouté au tableau correspondant (avec exemples d'URL), et retiré de la section « Non couvert à ce jour » si c'était listé là.
- **`README.md`** : toute nouvelle fonctionnalité visible par l'utilisateur mérite une section dédiée avec explication du fonctionnement et des limites connues. Mettre à jour l'arborescence du projet si des fichiers sont ajoutés/renommés.
- Ne jamais surpromettre : documenter honnêtement les limites connues (ex. flux HLS non gérés, contenu privé nécessitant authentification, pseudo-éléments CSS non couverts).

## Conventions de code

- **JavaScript vanilla**, sans framework ni dépendance externe — cohérent avec une extension légère chargée en mode développeur.
- Commentaires en français, identifiants (variables, fonctions) en anglais.
- `content.js` tourne dans un monde isolé injecté dynamiquement (`chrome.scripting.executeScript`) — toute fonction qui y est injectée doit être autonome (pas de référence à des variables du popup).
- Respecter le principe déjà en place : ne jamais filtrer/exclure un résultat sur la base d'une donnée inconnue ou non chargée (ex. taille d'image à 0) — préférer un faux positif affiché à un vrai résultat masqué par erreur.
- Permissions du `manifest.json` : rester minimal, ne demander une nouvelle permission que si strictement nécessaire à la fonctionnalité ajoutée, et l'expliquer dans le changelog.

## Tests

Il n'y a pas de framework de test dans ce projet (extension légère, usage personnel). Avant de proposer un changement :

1. Valider la syntaxe de chaque fichier JS modifié : `node --check content.js` / `node --check popup.js`.
2. Valider le JSON : `python3 -c "import json; json.load(open('manifest.json'))"` (idem pour les fichiers `_locales/*/messages.json`).
3. Pour toute logique non triviale (regex de détection, dédoublonnage de noms de fichiers, transformation d'URL), écrire un test isolé rapide en Node (script jetable) avant de livrer, plutôt que de supposer que ça fonctionne.

## Ce que Copilot ne doit pas faire

- Ne pas introduire de bibliothèque/framework externe sans qu'on en discute (garder l'extension légère et sans dépendances).
- Ne pas relâcher les permissions du manifest « au cas où ».
- Ne pas modifier le comportement de déduplication entre sessions (`chrome.storage.local`, clé = URL source) sans préserver la rétrocompatibilité avec les manifestes déjà stockés chez l'utilisateur.
- Ne pas oublier la règle n°1 (versionnage) : c'est la règle la plus souvent oubliée et la plus facile à automatiser via une checklist de revue.
