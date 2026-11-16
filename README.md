# Sous Couverture

Jeu de mots et de bluff à jouer à plusieurs sur un seul téléphone, qui passe de main en main.

- **Civils** : reçoivent tous le même mot.
- **Undercover** : reçoivent un mot voisin, sans savoir qu'ils sont Undercover.
- **Page Blanche** : ne reçoit aucun mot et doit bluffer.

## Ce que fait l'appli

- 3 à 20 joueurs, noms et scores conservés d'une partie à l'autre.
- Répartition des rôles libre : seule contrainte, au moins 2 Civils et 1 infiltré. On peut mettre autant
  d'Undercover que de Civils, ou davantage.
- 17 thèmes et 827 paires de mots (`js/words.js`) : accessible à tous, culture générale, France, manga, anime,
  foot, sport, technologie, personnages cultes, cinéma et séries, jeux vidéo, musique, cuisine, animaux,
  voyages, métiers, internet.
- Une paire déjà jouée ne ressort pas tant que les thèmes choisis ne sont pas épuisés.
- Partie en cours restaurée après un rechargement ; jouable hors ligne une fois installée.

## Lancer

Aucune dépendance, aucun build. Servez le dossier en HTTP :

```sh
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

Le workflow `.github/workflows/pages.yml` publie le jeu sur GitHub Pages à chaque push sur `main`
(réglage unique : Settings > Pages > Source > GitHub Actions). Ouvrez ensuite l'adresse sur téléphone puis
« Ajouter à l'écran d'accueil » pour l'installer.

## Tests

```sh
node --test tests/*.test.js
```

## Organisation

| Fichier | Rôle |
| --- | --- |
| `js/words.js` | Thèmes et paires de mots (`'Mot A|Mot B'`) |
| `js/game.js` | Règles pures : répartition, tirage, victoire, points |
| `js/app.js` | Écrans, état et sauvegarde locale |
| `styles.css` | Thème clair et sombre |
| `sw.js`, `manifest.webmanifest` | Installation et mode hors ligne |

Pour ajouter un thème, ajoutez un objet `{ id, name, desc, pairs }` dans `js/words.js`.
