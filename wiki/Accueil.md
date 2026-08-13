# Accueil — Media Downloader

Extension navigateur (Chrome/Edge, Manifest V3) pour détecter et télécharger images, vidéos, documents et liens de stockage cloud de façon organisée.

## Présentation

Cette page wiki rassemble les informations principales sur l'extension, les règles de contribution et les liens utiles.

## Arborescence du projet

- `manifest.json` — configuration Manifest V3, numéro de version affiché dynamiquement dans le popup.
- `popup.html` / `popup.js` — interface utilisateur, orchestration, traduction et stockage persistant (`chrome.storage.local`).
- `content.js` — script injecté pour scanner la page et piloter le défilement automatique.
- `_locales/{fr,en}/messages.json` — traductions pour le nom et la description de l'extension.
- `CHANGELOG.md`, `COMPATIBILITE.md`, `README.md` — documentation à maintenir.

## Règles importantes (résumé)

1. Versionnage automatique
   - Toute modification changeant le comportement utilisateur doit incrémenter `version` dans `manifest.json` (semver).
   - Ajouter une entrée en tête de `CHANGELOG.md` avec le même numéro et sections `### Ajouté` / `### Modifié` / `### Corrigé` / `### Notes`.

2. Internationalisation (FR/EN)
   - Toutes les chaînes visibles passent par le système `t()` dans `popup.js`.
   - Ajouter les clés dans `translations.fr` et `translations.en` (fonction pour les chaînes paramétrées).

3. Documentation à jour
   - `COMPATIBILITE.md` : lister les nouvelles plateformes/formateurs supportés.
   - `README.md` : documenter les nouvelles fonctionnalités visibles par l'utilisateur.

## Conventions de code

- JavaScript vanilla, pas de dépendances externes.
- Commentaires en français, identifiants en anglais.
- `content.js` injecté dynamiquement doit être autonome.
- Permissions minimales dans `manifest.json`.

## Comment contribuer

1. Ouvrez une issue pour proposer un changement ou signaler un bug.
2. Faites une branche, changez le code, mettez à jour `CHANGELOG.md` si le comportement change.
3. Créez une PR avec description claire et captures éventuelles.

## Liens utiles

- README : `README.md`
- Changelog : `CHANGELOG.md`
- Compatibilité : `COMPATIBILITE.md`

---

*Page créée automatiquement via l'assistant GitHub Copilot.*
