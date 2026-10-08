# learning-toolkit

Outils interactifs pour enseigner et apprendre les bases de l’informatique.

Adresse de publication : **[astrofra.github.io/learning-toolkit](https://astrofra.github.io/learning-toolkit/)**.

## Atelier binaire

Cinq écrans sont disponibles dans [`binary/index.html`](binary/index.html) :

- **01 — Pourquoi deux états ?** : interrupteur, lampe et bit synchronisés, puis défi sur la convention de représentation.
- **02 — Un bit, plusieurs bits** : deux bits manipulables, collection des quatre motifs sans doublon, puis défi sur la position des bits.
- **26 — Décalage ou rotation** : comparaison d’un décalage logique et d’une rotation circulaire sur 8 bits, motif de départ modifiable, choix du sens, suivi du bit sortant et du bit entrant, puis défi de transfert.
- **27 — Adresse et contenu** : mémoire de 16 octets, sélection d’une adresse, lecture en binaire/hexadécimal/décimal et écriture bit par bit ou en hexadécimal, puis défi sur la distinction adresse/contenu.
- **28 — Lecture, calcul, écriture** : machine simplifiée avec un registre d’adresse et deux registres de données, deux lectures, une addition et une écriture à suivre pas à pas, puis défi sur l’emplacement du résultat avant son stockage.

Les flèches en haut de la page parcourent les écrans disponibles : **01 → 02 → 26 → 27 → 28**. Les numéros correspondent à la roadmap. Les écrans partagent le mode projection, le réglage de mouvement réduit et la présentation issue des supports : logos ATI/Paris 8, Roboto et couleurs.

### Lancer l’aperçu

Avec Python 3, depuis la racine du dépôt :

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory binary
```

Ouvrir **http://127.0.0.1:4173/**. Avec Node.js installé, `npm run dev` lance le même serveur. Aucun paquet npm ni compilation n’est nécessaire pour utiliser l’application.

Accès direct au deuxième écran : **http://127.0.0.1:4173/#module-a/ecran-02**. Chaque écran possède son fragment d’URL ; les boutons précédent/suivant du navigateur fonctionnent aussi.

Accès direct aux déplacements : **http://127.0.0.1:4173/#module-e/ecran-26**. Le départ est `10000000` (`0x80`), avec un déplacement vers la gauche. Un clic donne `00000000` pour le décalage logique et `00000001` pour la rotation circulaire. Les deux colonnes évoluent ensuite à partir de leurs résultats respectifs. On peut aller jusqu’à huit déplacements : le décalage aboutit à zéro et la rotation retrouve le motif initial. Les bits du départ et le sens sont modifiables ; chaque changement repart de l’étape zéro. Les flèches montrent le trajet des bits, avec leur valeur perdue ou réinjectée. « Étape précédente » restaure l’historique, sans prétendre inverser un décalage destructif. « Recommencer » rétablit `0x80`, le sens gauche et le défi. La notion est validée après une manipulation et une réponse correcte au défi.

Accès direct à l’écran mémoire : **http://127.0.0.1:4173/#module-f/ecran-27**. Les 16 octets sont présentés sur une ligne, avec leurs adresses au-dessus des cases. Le ruban défile horizontalement sur petit écran ; les flèches gauche/droite du clavier parcourent les adresses. Une écriture accepte de `00` à `FF`, avec un préfixe `0x` facultatif ; les saisies hors plage sont refusées sans modifier la mémoire. **« Reset memory » met les 16 octets à `00`**, en conservant l’adresse sélectionnée. « Recommencer » restaure l’exemple initial et le défi.

Accès direct à la machine : **http://127.0.0.1:4173/#module-f/ecran-28**. « Étape suivante » exécute une commande : lire `mémoire[0x0A]` dans A (`0x3C`), lire `mémoire[0x03]` dans B (`0x10`), additionner dans A (`0x4C`), puis copier A vers `mémoire[0x0C]`. Le registre d’adresse utilise 4 bits et les données sont des octets non signés. Cette séquence fixe ne produit aucun dépassement. La mémoire reste inchangée jusqu’à la dernière étape ; lire et stocker sont des copies. « Étape précédente » restaure exactement l’état antérieur, y compris avant une écriture. La mémoire de cet exemple est indépendante de celle de l’écran 27. « Recommencer » réinitialise la séquence et le défi. La notion est validée après avoir parcouru les quatre étapes et réussi le défi ; revenir en arrière ne retire pas cette validation.

Les modules JavaScript nécessitent un serveur HTTP : utiliser cette commande plutôt que d’ouvrir le HTML par double-clic.

### Organisation

- `binary/index.html` : structure accessible des écrans et navigation commune.
- `binary/js/app.js` : initialisation et préférences d’affichage.
- `binary/js/deck.js` : navigation par URL, focus et conservation des écrans pendant la session.
- `binary/js/screens/` : comportements des écrans `two-states.js`, `two-bits.js`, `shift-rotate.js`, `memory.js` et `machine.js`.
- `binary/js/widgets/` : composants partagés, dont l’ouverture et la correction des défis.
- `binary/styles/` : polices, styles communs, présentation de l’écran et animations.
- `binary/assets/` : images et logos, directement à la racine du dossier.
- `binary/fonts/` : polices locales et licences.
- `binary/tests/` : tests d’interaction et de mise en page dans le navigateur.
- `binary/documentation/` : supports source et [étude de faisabilité](binary/documentation/etude-faisabilite-roadmap.md).

Les préférences de projection et de mouvement sont conservées sur cet appareil lorsque le stockage est disponible. Les manipulations, collections, octets modifiés et réponses restent conservés pendant les allers-retours entre écrans ; ils repartent de zéro au rechargement. Les autres écrans restent décrits dans la roadmap.

Pour ajouter un écran, créer sa section `data-screen` dans le HTML et son module dans `js/screens/`, puis l’enregistrer dans la liste transmise à `mountDeck` dans `js/app.js`, avec son numéro, son fragment d’URL, son titre et son module pédagogique (`chapter` et `chapterTitle`). Le comportement est initialisé une seule fois ; il reçoit `onStatusChange` pour mettre à jour le pied de page et retourne `getStatus` pour restaurer ce statut à chaque visite.

### Vérifier

Les tests locaux utilisent Node.js 20 ou plus, Python 3 et Google Chrome :

```sh
npm ci
npm test
```

Playwright prépare les fichiers à publier avec `npm run build`, puis lance un serveur de test distinct sur le port 4174. Les exercices sont testés sous `/learning-toolkit/`, comme sur GitHub Pages. Les tests couvrent clavier, défis, réinitialisation, collection sans doublons, lecture/écriture mémoire et validation des octets, séquence de la machine et retour arrière, navigation et historique, préférences, stockage indisponible, ressources locales et plusieurs largeurs d’écran. Sur GitHub Actions, ils utilisent Chromium installé par Playwright.

### Héberger sur GitHub Pages

Le workflow [GitHub Pages](.github/workflows/pages.yml) teste puis publie l’atelier à chaque push sur `main`. Les pull requests exécutent les mêmes tests sans publication. Un lancement manuel est aussi disponible dans l’onglet **Actions → GitHub Pages → Run workflow**.

Pour la première publication :

1. Dans les [réglages Pages du dépôt](https://github.com/astrofra/learning-toolkit/settings/pages), choisir **GitHub Actions** dans **Build and deployment → Source**.
2. Pousser les modifications sur `main`, ou relancer le workflow s’il a déjà été exécuté avant l’activation de Pages.
3. Attendre la réussite du workflow, puis ouvrir **https://astrofra.github.io/learning-toolkit/**.

Accès directs aux exercices :

- [01 — Pourquoi deux états ?](https://astrofra.github.io/learning-toolkit/#module-a/ecran-01)
- [02 — Un bit, plusieurs bits](https://astrofra.github.io/learning-toolkit/#module-a/ecran-02)
- [26 — Décalage ou rotation](https://astrofra.github.io/learning-toolkit/#module-e/ecran-26)
- [27 — Adresse et contenu](https://astrofra.github.io/learning-toolkit/#module-f/ecran-27)
- [28 — Lecture, calcul, écriture](https://astrofra.github.io/learning-toolkit/#module-f/ecran-28)

L’application utilise uniquement des fichiers statiques et des chemins relatifs. `npm run build` copie `index.html`, `js/`, `styles/`, `assets/` et `fonts/` depuis `binary/` vers `dist/learning-toolkit/`. Seul le contenu de ce dossier est publié à la racine du site Pages ; les tests et les supports PDF sont exclus. Les fichiers source restent dans `binary/`.

Pour vérifier localement la version destinée à GitHub Pages, lancer `npm run preview`, puis ouvrir **http://127.0.0.1:4173/learning-toolkit/**. Cette préparation ne demande aucune dépendance npm ; Node.js et Python 3 suffisent.
