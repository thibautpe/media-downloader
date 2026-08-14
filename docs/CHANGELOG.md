# Changelog

Ce projet suit le [versionnage sémantique](https://semver.org/lang/fr/) (`MAJEUR.MINEUR.CORRECTIF`) :
- **MAJEUR** : changement qui casse la compatibilité (rare pour une extension personnelle).
- **MINEUR** : nouvelle fonctionnalité, rétrocompatible.
- **CORRECTIF** : correction de bug, sans nouvelle fonctionnalité.

La version actuelle est visible en bas du popup, et dans `manifest.json` (`version`).

## [1.16.1]
### Corrigé
- Les liens WeTransfer courts qui redirigent vers une page de confirmation sont maintenant reconnus comme cas de téléchargement manuel : l'extension essaie d'abord la vraie URL de fichier, puis ouvre la page WeTransfer si le service exige une action utilisateur avant le téléchargement.
### Notes
- Le téléchargement direct reste impossible quand WeTransfer impose un écran de confirmation ou un défi anti-bot ; dans ce cas, l'ouverture de la page est le comportement fiable, sans faux positif de téléchargement bloqué.

## [1.16.2]
### Ajouté
- Tentative automatique d'ouverture de la page WeTransfer et de clic sur le bouton de téléchargement : si le téléchargement peut être déclenché automatiquement, l'onglet est fermé après le démarrage du transfert.
### Corrigé
- Si l'automatisation échoue (page de confirmation, anti-bot), la page WeTransfer est ouverte pour que l'utilisateur complète l'action manuellement.

## [1.17.0]
### Ajouté
- When a WeTransfer shortlink is selected, the extension now creates a small HTML file containing a clickable link saved inside the site's download folder instead of opening new tabs or attempting fragile automated downloads. This ensures the popup keeps focus and the user can open the WeTransfer page from their Downloads folder when needed.
### Modifié
- Cleanup: removed obsolete tab-reuse automation and simplified the WeTransfer flow to avoid background tab manipulation.


## [1.16.0]
### Ajouté
- Support des liens WeTransfer courts (`we.tl/...`) et des redirections VK (`vk.com/away.php?to=...` / `vk.ru/away.php?to=...`) : l'extension décode la cible réelle avant d'analyser le lien et les ajoute à l'onglet Cloud.
### Modifié
- Les liens d'archive temporaires du type `we.tl` sont désormais reconnus comme téléchargement direct lorsqu'ils pointent vers un fichier public ; il n'est pas nécessaire d'ouvrir une page intermédiaire manuellement pour déclencher le téléchargement si la cible autorise le GET direct.
### Notes
- Certains shortlinks publics peuvent encore afficher une page de confirmation ou un défi anti-bot selon le service ; dans ce cas, l'utilisateur peut encore devoir valider une page de protection, mais le cas simple `vk.ru/away.php?to=https://we.tl/...` est maintenant supporté.

## [1.15.1]
### Modifié
- Suppression de la génération automatique de `index.html` lors des téléchargements. L'extension n'écrit plus le fichier récapitulatif dans le dossier du site.

## [1.15.0]
### Ajouté
- Lors des téléchargements depuis Facebook et VK, le dossier créé inclut désormais le nom de la page/blog (ex. `facebook.com_Mon%20Blog`). Améliore l'organisation quand on télécharge depuis plusieurs pages du même site.

## [1.14.1]
### Ajouté
- `.github/copilot-instructions.md` : instructions globales pour GitHub Copilot (versionnage automatique, i18n FR/EN, mise à jour de la documentation, conventions de code, tests). Aucun changement de comportement, documentation uniquement.

## [1.14.0]
### Ajouté
- L'onglet « PDFs » devient **« Documents »** et détecte désormais aussi `.txt`, `.doc`/`.docx`, `.xls`/`.xlsx`, `.ppt`/`.pptx`, `.gpx` et `.gp5` (Guitar Pro), en plus des `.pdf`.
- Icône différenciée par type de fichier dans la liste et dans `index.html` (📄 PDF, 📝 texte, 📃 Word, 📊 Excel, 📽️ PowerPoint, 🗺️ GPX, 🎸 GP5).
### Modifié
- Le sous-dossier de téléchargement pour cette catégorie passe de `pdfs/` à `documents/`, pour refléter la diversité des types désormais gérés.
### Notes
- Si tu avais déjà téléchargé des PDFs avec une version antérieure, ces anciens fichiers restent dans `pdfs/` (les liens dans leur `index.html` d'origine restent valides) ; seuls les nouveaux téléchargements iront dans `documents/`. Pas d'action nécessaire, juste une note pour éviter la surprise si tu regardes le dossier sur le disque.

## [1.13.1]
### Ajouté
- `COMPATIBILITE.md` : tableau détaillé de ce qui est détecté par plateforme (Drive, Dropbox, VK, Facebook, règles génériques, dépliage « Voir plus » multilingue) et de ce qui ne l'est pas encore. Aucun changement de comportement, documentation uniquement.

## [1.13.0]
### Ajouté
- Support de VK (`vk.com`, `vk.ru`, y compris les versions mobiles `m.vk.*`) : les liens vers des documents (`/doc<owner_id>_<doc_id>`, typiquement des PDFs de partitions, tutoriels, etc. dans les sujets de forum) sont détectés et ajoutés à l'onglet Cloud avec une icône dédiée (📎).
- Détection d'images élargie au lazy-loading (`data-src`, `data-original`, `data-lazy-src`, `data-lazy`), fréquent sur les versions mobiles de sites comme VK — une image dont le `src` pointe encore vers un pixel transparent est maintenant repérée via son attribut de chargement différé.

## [1.12.0]
### Ajouté
- Interface bilingue français / anglais : sélecteur FR/EN en haut du popup, préférence mémorisée (`chrome.storage.local`), langue devinée par défaut à partir de la langue du navigateur.
- Tous les libellés, messages de statut et la page `index.html` générée s'adaptent à la langue choisie.
- Nom et description de l'extension localisés (`_locales/fr`, `_locales/en`), affichés automatiquement par Chrome/Edge dans `chrome://extensions` selon la langue du navigateur.

## [1.11.0]
### Ajouté
- Filtre par taille minimale d'image (champ « Taille min. images (px) » dans l'onglet Images) pour écarter facilement logos/icônes/pastilles. Les images dont la taille n'est pas encore connue (pas chargées au moment du scan) ne sont jamais masquées par précaution.
- Détection des images posées en `background-image` CSS (bannières, mosaïques...), en plus des balises `<img>` classiques — regroupées avec les autres images, dimensions estimées d'après la taille affichée à l'écran.
- « Tout sélectionner » / « Tout désélectionner » respectent désormais le filtre de taille actif (n'agissent que sur les images visibles).

## [1.10.0]
### Ajouté
- Numéro de version affiché en bas du popup.
- Ce fichier `CHANGELOG.md`.

## [1.9.0]
### Ajouté
- Mémoire persistante par site (`chrome.storage.local`) : un fichier déjà téléchargé lors d'une session précédente n'est plus retéléchargé.
- L'`index.html` est reconstruit à chaque téléchargement à partir de **tout l'historique connu du site** (pas seulement de la sélection du moment), et écrasé (`conflictAction: "overwrite"`) pour rester unique et à jour.
- Lien « Oublier l'historique de ce site » pour forcer un re-téléchargement complet.

## [1.8.0]
### Ajouté
- Téléchargements organisés par sous-dossier selon le type (`images/`, `videos/`, `pdfs/`, `cloud/`) sous un dossier racine nommé d'après le site scanné.
- Génération d'une page `index.html` récapitulative (vignettes pour les images, icônes/liens pour le reste).
- La sélection de fichiers est désormais conservée en changeant d'onglet dans le popup (plusieurs catégories peuvent être téléchargées en un seul clic).
- Dédoublonnage des noms de fichiers au sein d'un même sous-dossier.

## [1.7.0]
### Ajouté
- Support des liens Dropbox (`/s/`, `/scl/fi/`, `/sh/`), convertis en téléchargement direct, regroupés avec Drive dans l'onglet renommé **Cloud**.
- Décodage des redirections `l.facebook.com/l.php?u=...` pour retrouver l'URL réelle derrière un lien partagé sur Facebook.
### Corrigé
- Détection de « Voir plus » plus tolérante (espaces insécables, points de suspension, éléments cliquables sans `role="button"` explicite) — le bouton n'était pas toujours détecté selon la mise en page.
- Les compteurs d'onglets et la liste se synchronisent désormais en direct pendant le scan avec défilement automatique, au lieu de rester à 0 jusqu'à la fin.

## [1.6.0]
### Ajouté
- Dépliage automatique des textes tronqués (« Voir plus » / « See more » etc.) avant chaque scan, pour révéler les liens qu'ils contiennent.

## [1.5.0]
### Ajouté
- Icône de l'extension (aspirateur), déclinée en 16/32/48/128px.

## [1.4.0]
### Ajouté
- Contrôles Pause / Reprendre / Arrêter pendant un scan avec défilement automatique, via un content script persistant piloté par messages depuis le popup.

## [1.3.0]
### Ajouté
- Mode « Défilement automatique » pour les pages à chargement infini (ex. Facebook) : la page défile par étapes et fusionne les résultats trouvés à chaque palier.

## [1.2.0]
### Ajouté
- Détection des liens Google Drive (`/file/d/{ID}/view` et variantes), convertis en lien de téléchargement direct, affichés dans un onglet dédié.

## [1.1.0]
### Ajouté
- Miniatures/icônes dans la liste de résultats (image réelle, poster vidéo, icône PDF) et affichage du nom de fichier plutôt que de l'URL brute.

## [1.0.0]
### Ajouté
- Version initiale : scan de la page active, détection des images/vidéos/PDFs, sélection et téléchargement via `chrome.downloads`.
