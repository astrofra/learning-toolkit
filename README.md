# learning-toolkit

Outils interactifs pour enseigner et apprendre les bases de l’informatique.

## Atelier binaire

Le premier écran, « Pourquoi deux états ? », est disponible dans [`binary/index.html`](binary/index.html). Il propose un interrupteur qui synchronise une lampe et un bit, un défi corrigé sur la convention de représentation, un mode projection et un réglage de mouvement réduit. La présentation reprend les logos ATI/Paris 8, Roboto et les couleurs des supports.

### Lancer l’aperçu

Avec Python 3, depuis la racine du dépôt :

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory binary
```

Ouvrir **http://127.0.0.1:4173/**. Avec Node.js installé, `npm run dev` lance le même serveur. Aucun paquet npm ni compilation n’est nécessaire pour utiliser l’application.

Les modules JavaScript nécessitent un serveur HTTP : utiliser cette commande plutôt que d’ouvrir le HTML par double-clic.

### Organisation

- `binary/index.html` : structure accessible du premier écran.
- `binary/js/app.js` : initialisation et préférences d’affichage.
- `binary/js/screens/` : comportement propre à chaque écran ; le premier est `two-states.js`.
- `binary/styles/` : polices, styles communs, présentation de l’écran et animations.
- `binary/assets/` : images et logos, directement à la racine du dossier.
- `binary/fonts/` : polices locales et licences.
- `binary/tests/` : tests d’interaction et de mise en page dans le navigateur.
- `binary/documentation/` : supports source et [étude de faisabilité](binary/documentation/etude-faisabilite-roadmap.md).

Les préférences de projection et de mouvement sont conservées sur cet appareil lorsque le stockage est disponible. L’expérience et le défi repartent de zéro au rechargement. Seul le premier écran est implémenté ; les autres modules restent décrits dans la roadmap.

Pour ajouter un écran, créer son module dans `js/screens/` et réutiliser les styles communs. Le moteur de navigation entre plusieurs écrans sera ajouté avec le deuxième écran.

### Vérifier

Les tests utilisent Node.js, Python 3 et Google Chrome :

```sh
npm ci
npm test
```

Playwright lance un serveur de test distinct sur le port 4174. Les tests couvrent clavier, correction du défi, réinitialisation, préférences, stockage indisponible, ressources locales et plusieurs largeurs d’écran.

### Héberger sur GitHub Pages

L’application utilise uniquement des fichiers statiques et des chemins relatifs. Le dossier publié doit contenir `index.html`, `js/`, `styles/`, `assets/` et `fonts/`, issus de `binary/`. Il peut être placé à la racine du site Pages ou sous un préfixe. La publication GitHub Pages n’est pas configurée dans ce prototype.
