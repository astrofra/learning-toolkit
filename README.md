# learning-toolkit

Outils interactifs pour enseigner et apprendre les bases de l’informatique.

## Atelier binaire

Trois écrans sont disponibles dans [`binary/index.html`](binary/index.html) :

- **01 — Pourquoi deux états ?** : interrupteur, lampe et bit synchronisés, puis défi sur la convention de représentation.
- **02 — Un bit, plusieurs bits** : deux bits manipulables, collection des quatre motifs sans doublon, puis défi sur la position des bits.
- **27 — Adresse et contenu** : mémoire de 16 octets, sélection d’une adresse, lecture en binaire/hexadécimal/décimal et écriture bit par bit ou en hexadécimal, puis défi sur la distinction adresse/contenu.

Les flèches en haut de la page parcourent les écrans disponibles : **01 → 02 → 27**. Les numéros correspondent à la roadmap. Les écrans partagent le mode projection, le réglage de mouvement réduit et la présentation issue des supports : logos ATI/Paris 8, Roboto et couleurs.

### Lancer l’aperçu

Avec Python 3, depuis la racine du dépôt :

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory binary
```

Ouvrir **http://127.0.0.1:4173/**. Avec Node.js installé, `npm run dev` lance le même serveur. Aucun paquet npm ni compilation n’est nécessaire pour utiliser l’application.

Accès direct au deuxième écran : **http://127.0.0.1:4173/#module-a/ecran-02**. Chaque écran possède son fragment d’URL ; les boutons précédent/suivant du navigateur fonctionnent aussi.

Accès direct à l’écran mémoire : **http://127.0.0.1:4173/#module-f/ecran-27**. Les 16 octets sont présentés sur une ligne, avec leurs adresses au-dessus des cases. Le ruban défile horizontalement sur petit écran ; les flèches gauche/droite du clavier parcourent les adresses. Une écriture accepte de `00` à `FF`, avec un préfixe `0x` facultatif ; les saisies hors plage sont refusées sans modifier la mémoire. **« Reset memory » met les 16 octets à `00`**, en conservant l’adresse sélectionnée. « Recommencer » restaure l’exemple initial et le défi.

Les modules JavaScript nécessitent un serveur HTTP : utiliser cette commande plutôt que d’ouvrir le HTML par double-clic.

### Organisation

- `binary/index.html` : structure accessible des écrans et navigation commune.
- `binary/js/app.js` : initialisation et préférences d’affichage.
- `binary/js/deck.js` : navigation par URL, focus et conservation des écrans pendant la session.
- `binary/js/screens/` : comportements des écrans `two-states.js`, `two-bits.js` et `memory.js`.
- `binary/js/widgets/` : composants partagés, dont l’ouverture et la correction des défis.
- `binary/styles/` : polices, styles communs, présentation de l’écran et animations.
- `binary/assets/` : images et logos, directement à la racine du dossier.
- `binary/fonts/` : polices locales et licences.
- `binary/tests/` : tests d’interaction et de mise en page dans le navigateur.
- `binary/documentation/` : supports source et [étude de faisabilité](binary/documentation/etude-faisabilite-roadmap.md).

Les préférences de projection et de mouvement sont conservées sur cet appareil lorsque le stockage est disponible. Les manipulations, collections, octets modifiés et réponses restent conservés pendant les allers-retours entre écrans ; ils repartent de zéro au rechargement. Les autres écrans restent décrits dans la roadmap.

Pour ajouter un écran, créer sa section `data-screen` dans le HTML et son module dans `js/screens/`, puis l’enregistrer dans la liste transmise à `mountDeck` dans `js/app.js`, avec son numéro, son fragment d’URL, son titre et son module pédagogique (`chapter` et `chapterTitle`). Le comportement est initialisé une seule fois ; il reçoit `onStatusChange` pour mettre à jour le pied de page et retourne `getStatus` pour restaurer ce statut à chaque visite.

### Vérifier

Les tests utilisent Node.js, Python 3 et Google Chrome :

```sh
npm ci
npm test
```

Playwright lance un serveur de test distinct sur le port 4174. Les tests couvrent clavier, défis, réinitialisation, collection sans doublons, lecture/écriture mémoire et validation des octets, navigation et historique, préférences, stockage indisponible, ressources locales et plusieurs largeurs d’écran.

### Héberger sur GitHub Pages

L’application utilise uniquement des fichiers statiques et des chemins relatifs. Le dossier publié doit contenir `index.html`, `js/`, `styles/`, `assets/` et `fonts/`, issus de `binary/`. Il peut être placé à la racine du site Pages ou sous un préfixe. La publication GitHub Pages n’est pas configurée dans ce prototype.
