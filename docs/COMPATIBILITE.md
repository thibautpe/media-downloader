# Compatibilité — sites et types de contenu pris en charge

Ce document liste, par plateforme, ce que l'extension sait détecter aujourd'hui. Il sert de référence rapide pour savoir « est-ce que ça devrait marcher sur X ? » et pour situer où ajouter un nouveau cas dans `content.js` si besoin.

Toutes les règles ci-dessous s'appliquent **en plus** des règles génériques (elles ne sont pas mutuellement exclusives) : une page Facebook bénéficie par exemple à la fois des règles génériques (images, PDFs) et des règles spécifiques Facebook (dépliage « Voir plus », décodage des redirections).

---

## Règles génériques (tous les sites)

| Type de contenu | Ce qui est détecté | Onglet | Fichier / fonction |
|---|---|---|---|
| Images | `<img src="...">` | Images | `scanOnce()` |
| Images (lazy-load) | `<img>` sans `src` valide (vide ou `data:`) : repli sur `data-src`, `data-original`, `data-lazy-src`, `data-lazy` | Images | `scanOnce()` |
| Images (variantes) | `<picture><source srcset>` et `<img srcset>` | Images | `scanOnce()` |
| Images (fond CSS) | `background-image: url(...)` sur tout élément visible à l'écran au moment du scan | Images | `scanOnce()` |
| Vidéos | `<video src>` et `<video><source src></video>` | Vidéos | `scanOnce()` |
| Vidéos (aperçu) | Attribut `poster` du `<video>`, utilisé comme miniature dans la liste | Vidéos | `scanOnce()` |
| Documents | `<a href>` dont l'URL se termine par `.pdf`, `.txt`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.gpx` ou `.gp5` (avant `?`/`#`/fin de chaîne) | Documents | `scanOnce()` |
| Documents (intégrés) | `<embed src>` / `<object data>` pointant vers une de ces extensions | Documents | `scanOnce()` |

**Limite commune à toutes les images** : les pseudo-éléments `::before`/`::after` avec `background-image` ne sont pas détectés.

### Icônes par type de document

| Extension | Icône |
|---|---|
| `.pdf` | 📄 |
| `.txt` | 📝 |
| `.doc` / `.docx` | 📃 |
| `.xls` / `.xlsx` | 📊 |
| `.ppt` / `.pptx` | 📽️ |
| `.gpx` | 🗺️ |
| `.gp5` | 🎸 |

---

## Google Drive

| Format d'URL détecté | Exemple |
|---|---|
| `drive.google.com/file/d/{ID}/view` | `https://drive.google.com/file/d/1abc.../view` |
| `drive.google.com/open?id={ID}` | `https://drive.google.com/open?id=1abc...` |
| `drive.google.com/uc?...id={ID}` | `https://drive.google.com/uc?id=1abc...` |
| `docs.google.com/{type}/d/{ID}` | `https://docs.google.com/document/d/1abc.../edit` |

- Converti en lien de téléchargement direct : `drive.google.com/uc?export=download&id={ID}`.
- Affiché dans l'onglet **Cloud**, icône 🗂️.
- **Condition** : le fichier doit être partagé publiquement, sinon Google affiche une page de connexion à la place du fichier.

## Dropbox

| Format d'URL détecté | Exemple |
|---|---|
| `dropbox.com/s/...` | liens de partage classiques |
| `dropbox.com/scl/fi/...` | liens de partage récents (avec `rlkey`) |
| `dropbox.com/sh/...` | liens de dossier partagé |

- Converti en téléchargement direct en forçant `dl=1` dans l'URL.
- Affiché dans l'onglet **Cloud**, icône 📦.
- **Condition** : fichier partagé publiquement, sinon Dropbox affiche une page de connexion.

## VK (vk.com / vk.ru)

| Format d'URL détecté | Exemple |
|---|---|
| `vk.com/doc{owner_id}_{doc_id}` | `https://vk.com/doc-15164027_679123456` |
| `vk.ru/doc{owner_id}_{doc_id}` | idem sur le domaine `.ru` |
| `m.vk.com/doc...`, `m.vk.ru/doc...` | versions mobiles (préfixe `m.` retiré avant comparaison) |
| `vk.com/away.php?to=...` / `vk.ru/away.php?to=...` | `https://vk.ru/away.php?to=https%3A%2F%2Fwe.tl%2Ft-Rb7J9BWcufPJmWcb&utf=1` |

- `owner_id` peut être négatif (documents postés par un groupe/communauté plutôt qu'un compte personnel) — géré par le motif `-?\d+`.
- Les redirections `away.php?to=` sont décodées avant analyse afin de retrouver l'URL cible réelle (ex. WeTransfer, Dropbox, PDF public, etc.).
- Utilisé tel quel comme URL de téléchargement (VK sert généralement le fichier brut à cette adresse).
- Affiché dans l'onglet **Cloud**, icône 📎.
- **Non couvert** : les vidéos VK (lecteur personnalisé, pas de balise `<video>` standard), l'audio VK.

## WeTransfer

| Format d'URL détecté | Exemple |
|---|---|
| `we.tl/...` | `https://we.tl/t-Rb7J9BWcufPJmWcb` |
| `wetransfer.com/...` | `https://wetransfer.com/...` |

- Détecté comme lien de téléchargement direct dans l'onglet **Cloud**.
- L'URL est conservée telle quelle ; si le service délivre un fichier public, le navigateur peut le récupérer directement via `chrome.downloads` sans passer par la page d'atterrissage de l'utilisateur.
- **Limite** : si le shortlink est protégé ou redirige vers une page de confirmation anti-bot, l'utilisateur peut devoir valider une étape supplémentaire.

## Facebook

| Fonctionnalité | Détail |
|---|---|
| Décodage des redirections | `l.facebook.com/l.php?u=<url encodée>` et `lm.facebook.com/...?u=...` → l'URL réelle est extraite du paramètre `u` avant analyse. Sans ça, un lien externe (ex. Dropbox) enveloppé par Facebook ne matchait aucune règle. |
| Dépliage « Voir plus » | Détecté et cliqué automatiquement avant chaque scan (voir tableau multilingue ci-dessous) pour révéler le texte tronqué et les liens qu'il contient. |
| Défilement automatique | Le mode « Défilement automatique » du popup gère le chargement infini propre à Facebook (et sites similaires), avec fusion des résultats à chaque palier plutôt qu'écrasement. |

---

## Dépliage des textes tronqués (« Voir plus »)

Détection multilingue, utilisée sur n'importe quel site (pas seulement Facebook) :

| Langue | Phrase(s) reconnue(s) |
|---|---|
| Français | `voir plus` |
| Anglais | `see more`, `display more` |
| Allemand | `mehr anzeigen` |
| Espagnol | `ver más` |
| Portugais | `ver mais` |

- La comparaison est tolérante : espaces insécables et points de suspension normalisés, correspondance exacte ou en fin de texte (`text.endsWith(phrase)`).
- Exclusion explicite de `voir moins` / `see less` / `réduire` pour ne jamais recollapser du texte par erreur.
- Ne clique que sur des éléments actuellement visibles à l'écran (`offsetParent !== null`).

*(Cette liste concerne la langue du **site scanné**, à ne pas confondre avec la langue de l'**interface de l'extension** — voir plus bas.)*

---

## Interface de l'extension (indépendant des sites ci-dessus)

| Langue | Statut |
|---|---|
| Français | ✅ Complet (libellés, statuts, `index.html` généré) |
| Anglais | ✅ Complet (libellés, statuts, `index.html` généré) |

Basculable via le sélecteur FR/EN en haut du popup — voir le README, section « Langue de l'interface ».

---

## Non couvert à ce jour

- Vidéos en streaming fragmenté (HLS/`.m3u8`) : la balise `<video>` pointe vers un flux que `chrome.downloads` ne sait pas réassembler.
- Vidéos VK (lecteur non standard).
- Audio (VK, SoundCloud embarqué, etc.).
- Contenus nécessitant une authentification pour être servis (Drive/Dropbox privés, VK docs restreints).
- Pseudo-éléments CSS (`::before`/`::after`) pour `background-image`.
- Autres services de stockage cloud (OneDrive, WeTransfer, Mega, etc.) — pas encore de règle dédiée, seuls les liens `.pdf` génériques qu'ils exposeraient éventuellement seraient captés par la règle générique PDF.

Si tu rencontres un site/format qui ne remonte pas, le plus efficace reste de m'envoyer un exemple de `href` exact (clic droit → Inspecter sur le lien) pour que j'ajoute la règle correspondante ici et dans `content.js`.
