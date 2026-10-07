# Apprendre le binaire par la manipulation

Étude de faisabilité et roadmap — 7 octobre 2026  
Public : enseignement supérieur, initiation ou consolidation avant des travaux pratiques en C/C++.  
Statut : proposition de conception ; les charges et les critères pédagogiques restent à éprouver par un prototype.

Avancement : les écrans 01 « Pourquoi deux états ? », 02 « Un bit, plusieurs bits » et 27 « Adresse et contenu » sont implémentés dans [l’application](../index.html). Ils proposent l’interrupteur, une collection des quatre motifs de deux bits, une mémoire de 16 octets lisibles et modifiables, des défis corrigés et une navigation conservant les manipulations pendant la session. Les [instructions de lancement](../../README.md) permettent de les essayer localement. Les autres écrans et la publication restent à réaliser.

## 1. Recommandation

**Le projet est réalisable avec du JavaScript vanilla, du HTML, du SVG et des animations CSS légères, hébergés sur GitHub Pages.** Une application statique suffit pour présenter les cours, manipuler les bits, corriger les exercices et conserver une progression sur l’appareil de l’étudiant. GitHub Pages publie précisément ce type de fichiers depuis un dépôt : [présentation officielle](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

Le format recommandé est un **diaporama interactif organisé en sept modules**, utilisable en projection et individuellement. Chaque notion suit le même mouvement : une question, une prédiction de l’étudiant, une manipulation, une explication, puis un exercice de transfert vers le code.

L’identité graphique prolonge celle des supports : **logos ATI et Université Paris 8, Roboto pour les textes, Roboto Mono pour les nombres et le code, fond gris clair et bits actifs jaune vif**. La section 8 précise cette direction et son adaptation aux interactions web.

La première version complète proposée comprend **40 écrans courts**, dont plusieurs réutilisent les mêmes outils. Un écran peut comporter plusieurs étapes, mais conserve un seul objectif pédagogique. Un prototype de six écrans précède cette version pour vérifier la compréhension, la lisibilité en salle et la difficulté de réalisation des interactions.

La principale difficulté est pédagogique : rendre visibles la position des bits, les retenues et les changements d’interprétation, tout en préparant correctement aux règles du C/C++. Les calculs et le volume de données sont modestes.

**Ordre de grandeur : 23 à 35 jours de travail pour la première version complète, soit 28 à 42 jours avec une réserve d’environ 20 %.** Cela représente environ six à neuf semaines à temps plein pour une personne expérimentée en développement web, avec une disponibilité régulière de l’enseignant. Le détail et les hypothèses figurent dans la roadmap.

## 2. Ce que les supports existants apportent

L’étude s’appuie sur les deux PDF de ce dossier, dont les premières pages indiquent « Programmation Graphique C++ — ATI M1 » :

- [Computer Science Foundations — Part 1_FR](<Computer Science Foundations - Part 1_FR.pptx.pdf>) : 28 pages, de la numération à l’architecture et au stockage.
- [Computer Science Foundations — Part 2_FR](<Computer Science Foundations - Part 2_FR.pptx.pdf>) : 34 pages, des opérations logiques aux manipulations de couleurs.

Les numéros ci-dessous désignent les pages des PDF, page de titre comprise.

| Matériau existant | Localisation | Adaptation proposée |
| --- | --- | --- |
| Bases, bits, octets, puissances de deux | Partie 1, p. 3–9 | Registre cliquable, compteur et décomposition de la valeur |
| Correspondance binaire/décimal/hexadécimal | Partie 1, p. 10–11 ; partie 2, p. 19–20 | Trois représentations synchronisées ; sélection d’un quartet et du chiffre hexa associé |
| Architecture, bus, adresses, mémoire | Partie 1, p. 12–20 | Petite mémoire adressable et trajet d’une lecture/écriture |
| ET, OU, NON, XOR | Partie 2, p. 3–6 | Tables de vérité que l’étudiant construit, puis opérations sur un octet |
| Décalages et rotations | Partie 2, p. 7–10 | Déplacement explicite des bits, avec visualisation des bits perdus |
| Complément à deux et valeurs signées | Partie 2, p. 11–17 | Changement d’interprétation d’un même motif ; inversion et ajout de 1 |
| RVB, masques, réduction de précision | Partie 2, p. 21–34 | Atelier de composition et d’extraction des composantes, puis petit algorithme C/C++ |
| Histoire des supports et exemple audio | Partie 1, p. 21–28 ; partie 2, p. 16–17 | Capsules facultatives, après acquisition du socle |

La continuité avec la programmation graphique est particulièrement utile : une valeur hexadécimale devient une couleur visible, puis un assemblage de champs que l’on peut extraire et recombiner.

Le principal ajout sera **l’arithmétique expliquée colonne par colonne** : compter, additionner avec retenue, comprendre la largeur finie, puis soustraire avec le complément à deux. Les supports abordent déjà plusieurs de ces idées, mais pas sous la forme d’un parcours de manipulation complet.

### Corrections à intégrer avant adaptation

Ces points proviennent de la lecture des supports et, pour les exemples RVB, de la vérification visuelle des diapositives concernées.

| Passage | Correction ou précision |
| --- | --- |
| Partie 1, p. 15 : ROM « 8 ko », de `0000` à `3FFF` | Cette plage contient `0x4000 = 16 384` adresses, soit 16 Kio si chaque adresse désigne un octet. |
| Partie 1, p. 18–19 : largeur d’adresse et limite de 3 Go | Présenter `n` bits comme permettant `2^n` adresses. La capacité en octets dépend de l’unité adressable ; l’espace accessible à un processus dépend aussi du système et de sa configuration. Écarter « 3 Go maximum » comme règle générale. |
| Partie 1, p. 6 et 20 : byte, octet, mot, long | Un octet contient toujours 8 bits. Pour le modèle du cours, annoncer des bytes de 8 bits ; les tailles des types C/C++ et du « mot machine » doivent être précisées séparément. |
| Partie 2, p. 7–8 : décalages | La multiplication peut perdre des bits à largeur finie ; la division d’un entier non signé élimine le reste. Les valeurs signées demandent un traitement distinct. |
| Partie 2, p. 11–14 : signe et complément à deux | Le bit de poids fort a un poids négatif en complément à deux. Le motif ne se lit pas comme un signe suivi d’une valeur absolue ; zéro appartient aussi aux valeurs non signées. |
| Partie 2, p. 22 : trois composantes à `FF` | L’expression affichée répète le champ vert. Pour obtenir le blanc annoncé par trois composantes maximales : `0xFF0000 \| 0x00FF00 \| 0x0000FF = 0xFFFFFF`. |
| Partie 2, p. 23–24 : assemblage RVB | Utiliser `0x0000E9` et `0x000048` comme termes bleus. Les termes affichés `0x00FFE9` et `0x00FF48` modifient aussi le vert. |
| Partie 2, p. 29 : `0xEDA27B` | Cette valeur correspond à RVB `(237, 162, 123)`. RVB `(227, 162, 120)` correspond à `0xE3A278`. |
| Partie 2, p. 29–31 : RVB12 | Distinguer le code compact `0xEA7` de sa reconstruction pour l’affichage. Avec ajout de quatre zéros par composante : `(224, 160, 112)` ; avec répétition du quartet : `(238, 170, 119)`. Annoncer la convention choisie. |
| Partie 2, p. 34 : pseudo-code du mélange | Corriger la parenthèse surnuméraire de `Bm` et ajouter les variables `Rb`, `Gb`, `Bb` à la déclaration. |

Les précisions sur les types et les opérations seront relues à partir du [projet de norme C N1570, notamment §6.2.5, §6.3.1.1 et §6.5.7](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf) et des [règles des types fondamentaux du projet de norme C++](https://eel.is/c++draft/basic.fundamental). Les capsules historiques pourront être vérifiées séparément lors de leur rédaction.

## 3. Public, objectifs et usage en cours

Hypothèse retenue : étudiants du supérieur, jusqu’au niveau M1 des supports, ayant déjà rencontré les variables et les expressions arithmétiques, mais sans maîtrise préalable du binaire. Le parcours commence sans prérequis en électronique ; les encadrés C/C++ arrivent progressivement.

À l’issue du parcours, l’étudiant doit pouvoir :

1. Construire un entier non signé à partir des poids de ses bits et expliquer la plage représentable.
2. Passer du binaire à l’hexadécimal par groupes de quatre bits, dans les deux sens.
3. Expliquer une addition, une retenue et la conservation des seuls bits d’un registre de largeur donnée.
4. Interpréter un motif en non signé ou en complément à deux, puis réaliser une soustraction.
5. Choisir une opération bit à bit pour tester, activer, effacer ou inverser un bit.
6. Anticiper les effets d’un décalage et les bits perdus.
7. Distinguer une adresse, un contenu mémoire et une valeur interprétée.
8. Lire et compléter un court programme C/C++ de manipulation de bits, notamment sur une couleur RVB.

**Format de départ proposé : trois séances de 90 minutes**, exercices compris : bases et hexa ; opérations et arithmétique ; mémoire, C/C++ et application graphique. Prévoir ensuite un TP de programmation de 60 à 90 minutes. Ces durées sont des hypothèses de préparation à ajuster après observation des étudiants.

Deux présentations du même contenu sont prévues :

- **Projection** : caractères larges, commandes visibles, résultats révélés à la demande, accès direct à une notion.
- **Travail individuel** : consignes détaillées, réponse avant correction, indices progressifs et reprise locale de la progression.

Le passage d’un mode à l’autre ne modifie ni les exemples ni leurs résultats. Une synchronisation entre l’ordinateur de l’enseignant et ceux des étudiants relève d’une évolution ultérieure.

## 4. Proposition de parcours : 40 écrans

Le nombre d’écrans décrit un scénario initial. Les essais pourront conduire à scinder un écran trop chargé ou à fusionner deux explications, sans modifier les compétences attendues.

| Écran | Notion | Interaction proposée | Preuve de compréhension |
| --- | --- | --- | --- |
| **A — 01** | Pourquoi deux états ? | Basculer un interrupteur et associer ses états à 0/1 | Distinguer l’état physique de sa convention de représentation |
| 02 | Un bit, plusieurs bits | Composer les quatre motifs sur 2 bits | Trouver tous les motifs sans doublon |
| 03 | Poids des positions | Activer des cases portant les poids 1, 2, 4, 8 | Expliquer pourquoi `1000` vaut 8 |
| 04 | Compter | Prédire puis déclencher `0111 → 1000` | Expliquer les quatre changements de bits |
| 05 | Largeur et intervalle | Passer de 4 à 8 bits ; relever le maximum | Distinguer 256 valeurs de la valeur maximale 255 |
| **B — 06** | Une valeur, plusieurs écritures | Relier décimal, binaire et hexa pour une même valeur | Identifier ce qui change et ce qui reste identique |
| 07 | Les chiffres 0 à F | Compléter une correspondance sur 4 bits | Associer `1010` à `A`, puis `1111` à `F` |
| 08 | Un octet, deux quartets | Sélectionner les groupes de `1001 0001` | Construire `0x91` sans passer par le décimal |
| 09 | Conversion inverse | Déplier `0x3C` en deux groupes | Produire `0011 1100` |
| 10 | Défi de conversion | Saisir la représentation manquante | Réussir des exemples nouveaux, dont `00`, `0F` et `80` |
| **C — 11** | ET / AND | Actionner deux entrées puis deux rangées de bits | Prédire les bits conservés par un masque |
| 12 | OU / OR | Superposer deux motifs | Expliquer pourquoi `1 OR 1` reste 1 |
| 13 | OU exclusif / XOR | Comparer et inverser des bits | Distinguer XOR de OR et de l’addition |
| 14 | NON / NOT | Inverser un registre de largeur affichée | Expliquer pourquoi cette largeur est nécessaire |
| 15 | Tester un bit | Choisir un masque pour un indicateur | Distinguer le résultat masqué du test « non nul » |
| 16 | Modifier des indicateurs | Activer, effacer, puis inverser un indicateur | Choisir OR, AND avec masque inversé, puis XOR |
| **D — 17** | Addition sur un bit | Manipuler les deux entrées et séparer somme/retenue | Expliquer `1 + 1 = 10` |
| 18 | Addition sur plusieurs bits | Avancer colonne par colonne avec une retenue entrante | Calculer `00000111 + 00000001` |
| 19 | Registre de largeur finie | Ajouter 1 à `11111111` | Montrer les 8 bits stockés et la retenue sortante |
| 20 | Interprétation signée | Changer la lecture du même motif | Lire `11111111` comme 255 ou −1 |
| 21 | Complément à deux et soustraction | Inverser, ajouter 1, puis calculer `5 − 3` | Expliquer l’addition de `5` et du motif représentant `−3` |
| 22 | Retenue et dépassement signé | Comparer `255 + 1` et `127 + 1` sur 8 bits | Distinguer les deux indicateurs du modèle |
| **E — 23** | Décalage à gauche | Déplacer les bits d’une position | Prédire le double lorsque celui-ci tient dans le registre |
| 24 | Bits perdus | Décaler `10000001` à gauche sur 8 bits | Obtenir `00000010` et identifier le bit éliminé |
| 25 | Décalage à droite | Répéter l’opération sur 13 | Obtenir 6 puis 3 et identifier les restes perdus |
| 26 | Décalage ou rotation | Comparer deux déplacements de `10000000` | Distinguer insertion d’un zéro et réinjection du bit |
| **F — 27** | Adresse et contenu | Choisir une case parmi 16 octets | Distinguer l’adresse `0x0A` de la valeur qu’elle contient |
| 28 | Lecture, calcul, écriture | Charger un registre, ajouter, stocker | Décrire le trajet des données dans la machine simplifiée |
| 29 | Plusieurs octets pour une valeur | Ranger `0x1234` dans deux cases selon un ordre annoncé | Reconstituer la valeur à partir des octets |
| 30 | Du code aux étapes machine | Relier une affectation à une séquence illustrative | Expliquer le rôle des registres et de la mémoire |
| **G — 31** | Types et largeur en C/C++ | Comparer des déclarations et leurs domaines | Identifier la largeur annoncée sans supposer celle de `int` |
| 32 | Opérateurs bit à bit et logiques | Comparer `a & b` avec `a && b` sur des valeurs choisies | Expliquer, par exemple, le cas `a = 2`, `b = 1` |
| 33 | Promotions entières | Prédire `x + 1` puis son rangement dans un `uint8_t` | Distinguer calcul de l’expression et conversion au stockage |
| 34 | Limites des exemples C/C++ | Classer de petits fragments avec leur type indiqué | Repérer un décalage invalide ou un dépassement arithmétique signé |
| 35 | Une couleur sur 24 bits | Modifier trois composantes R, V, B | Associer chaque octet à sa composante |
| 36 | Extraire une composante | Choisir masque et décalage | Retrouver le vert de `0x98A5E9` |
| 37 | Recomposer une couleur | Replacer les trois composantes et appliquer OR | Reconstruire exactement `0x98A5E9` |
| 38 | Réduire la précision | Conserver quatre bits par composante | Transformer `0xEDA27B` en RVB12 `0xEA7` |
| 39 | Compléter un algorithme | Remplir les masques et décalages d’une fonction | Réussir les cas de vérification fournis |
| 40 | Défi final et bilan | Décoder une couleur, modifier un champ, expliquer le résultat | Mobiliser hexa, masque, décalage et type sans guidage pas à pas |

Les écrans 17–22 couvrent addition et soustraction. Les écrans 23–25 introduisent multiplication et division par des puissances de deux. La multiplication binaire générale et la division posée restent des extensions : les intégrer immédiatement augmenterait sensiblement la longueur du parcours.

## 5. Interactions à concevoir en priorité

### 5.1. Le registre manipulable

Un composant réutilisable affiche 4, 8 ou 16 bits, leurs indices et leurs poids. Les exemples RVB utilisent trois groupes de 8 bits. Le bit 0 se trouve à droite ; les zéros de tête restent visibles. Un clic, une activation clavier ou une saisie numérique met à jour les représentations associées.

Exemple : construire 145 en activant 128, 16 et 1 ; observer `10010001` et `0x91`. Dans un exercice, l’étudiant valide sa proposition avant de voir la décomposition complète. Dans l’exploration libre, les représentations se mettent à jour immédiatement.

**Retour attendu :** « Tu as activé le poids 32 à la place du poids 16 », accompagné de l’emplacement concerné. Une simple indication « faux » serait insuffisante.

### 5.2. Le compteur et l’addition avec retenues

Le compteur montre les bits qui changent lors d’une incrémentation. L’additionneur comporte deux opérandes, une ligne de retenues et une ligne de résultat. Chaque étape précise la colonne traitée et le calcul local ; une vue détaillée relie somme et retenue aux opérations XOR, AND et OR déjà étudiées.

Trois cas doivent être particulièrement lisibles :

- `00000111 + 00000001 = 00001000` : propagation de retenues.
- `11111111 + 00000001` : résultat stocké `00000000`, retenue sortante 1 ; en lecture signée, `−1 + 1 = 0`.
- `01111111 + 00000001` : résultat stocké `10000000`, retenue sortante 0, dépassement de l’intervalle signé sur 8 bits.

Les commandes « étape suivante », « étape précédente », « rejouer » et « réinitialiser » sont disponibles. L’étudiant doit pouvoir expliquer une étape même lorsque les animations sont désactivées.

### 5.3. Une interprétation signée explicite

Un sélecteur « non signé / signé en complément à deux » conserve les bits et change leur interprétation. Pour `11111101`, les deux lectures sont 253 et −3. La formule signée sur 8 bits met en évidence le poids `−128` du bit de poids fort.

L’atelier « fabriquer −3 » expose successivement `00000011`, `11111100`, puis `11111101`. Un exercice sur 4 bits montre aussi pourquoi `−8` est représentable alors que `+8` ne l’est pas dans ce format signé.

### 5.4. L’atelier des masques et des couleurs

L’étudiant voit simultanément une couleur, `0xRRGGBB` et les trois octets. La sélection de `0x00FF00` désigne le champ vert ; le décalage de 8 positions le ramène à une valeur de 0 à 255.

Le défi consiste ensuite à modifier le vert en conservant rouge et bleu, puis à recomposer la valeur. Le code C/C++ apparaît à côté de la manipulation une fois que celle-ci est comprise. La réduction RVB24 vers RVB12 réutilise le même composant et montre les bits abandonnés.

### 5.5. La petite machine pédagogique

Une mémoire de 16 cases de 8 bits, un registre d’adresse de 4 bits, deux registres de données de 8 bits et une unité de calcul suffisent pour une première explication. Une lecture sélectionne une adresse et copie son contenu dans un registre ; une écriture modifie la case sélectionnée.

Le parcours illustre « charger, calculer, stocker » avec une séquence fictive clairement étiquetée. Les commandes sont fixes et prédéfinies. Une affectation C/C++ peut ainsi être rapprochée d’opérations machine, sans présenter cette séquence comme la sortie garantie d’un compilateur réel.

L’activité sur `0x1234` introduit l’ordre des octets, ou *endianness*. Elle distingue cet ordre en mémoire de l’ordre d’écriture des bits à l’intérieur d’un octet.

## 6. Contrat de précision pour le C/C++

Chaque activité annonce sa largeur, son interprétation et sa règle de calcul. Trois niveaux doivent rester identifiables : le nombre mathématique, le registre simulé, puis l’expression C/C++ avec ses types.

Les exemples de programmation viseront **C11 et C++17**, sur une cible de TP disposant de `uint8_t` et `uint32_t`, avec des bytes de 8 bits. Les règles dépendant d’une version ultérieure seront identifiées comme telles. Ce choix permet d’utiliser largement les environnements d’enseignement existants, sans faire dépendre le socle d’une fonctionnalité récente.

- Un registre non signé de `n` bits contient `2^n` motifs, interprétés de 0 à `2^n − 1`. Le modèle conserve le résultat modulo `2^n`.
- Le complément à deux constitue le modèle signé enseigné. En C/C++, un dépassement d’addition signée ne doit pas être présenté comme un bouclage garanti.
- `uint8_t`, lorsqu’il est disponible, impose bien une largeur de 8 bits ; une expression utilisant cette variable peut néanmoins être calculée dans un type plus large après promotion. Exemple : avec `uint8_t x = 255`, `x + 1` vaut 256 dans le type promu ; la conversion vers `uint8_t` donne ensuite 0.
- Les premiers décalages en code portent sur des valeurs non signées, avec un nombre de positions valide pour le type après promotion. Un registre visuel de 8 bits et l’expression `x << 1` ne sont donc pas automatiquement le même calcul.
- Distinguer `&` de `&&`, `|` de `||`, `~` de `!` ; rappeler que `^` représente XOR, pas une puissance.
- Préférer les constantes hexadécimales dans les exemples communs C11/C++17 ; présenter les motifs binaires visuels séparément de la syntaxe acceptée par chaque langage.

Ces règles s’appuient sur le [projet C N1570, §6.3.1.1, §6.3.1.3, §6.5 et §7.20.1.1](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf) et les [promotions entières du projet C++](https://eel.is/c++draft/conv.prom). Les [règles de décalage du projet C++ actuel](https://eel.is/c++draft/expr.shift) doivent être distinguées des règles des versions antérieures pour les valeurs signées ; le parcours initial évite cette dépendance en utilisant des valeurs non signées.

Chaque fragment sera compilé et vérifié dans la version du langage annoncée. Les exercices montrant un comportement indéfini demandent de l’identifier ; ils n’affichent pas un résultat numérique supposé reproductible.

## 7. Faisabilité technique

| Besoin | Solution proposée | Difficulté et limite |
| --- | --- | --- |
| Navigation entre écrans | HTML sémantique, contrôleur JS, identifiants stables dans le fragment d’URL | Faible ; gérer retour navigateur et liens directs |
| Bits, tables, valeurs synchronisées | Éléments DOM et fonctions de calcul indépendantes | Faible à moyenne ; précision et validation des saisies |
| Retenues, regroupements, transferts | Étapes calculées en JS, présentation CSS et SVG | Moyenne ; retour arrière et interruptions à concevoir |
| Correction et indices | Exercices déclaratifs, réponses attendues et explications contextualisées | Moyenne ; rédaction pédagogique plus coûteuse que le calcul |
| Mode projection et petit écran | CSS Grid/Flexbox, dispositions adaptées, tailles de texte variables | Moyenne ; vérifier la lisibilité des groupes de bits |
| Sauvegarde locale | `localStorage`, état versionné, reprise et remise à zéro | Faible ; aucune synchronisation entre appareils |
| Mise en ligne | GitHub Pages sous HTTPS, publication par GitHub Actions | Faible ; vérifier les chemins sous le nom du dépôt |
| Exécution libre de C/C++ | Compilateur distant ou environnement WebAssembly | Forte ; évolution séparée, inutile pour le premier parcours |

### Architecture proposée

Le projet peut conserver une structure simple, sans framework d’interface ni chaîne de compilation obligatoire. Le découpage suivant est une cible de développement, pas une arborescence déjà créée :

```text
binary/
  index.html
  assets/                 # Images et logos existants, directement à la racine
  fonts/                  # Roboto et Roboto Mono au format web, avec leurs licences
  styles/
    base.css              # Typographie, couleurs, dispositions
    components.css        # Bits, registres, tableaux, mémoire
    motion.css            # Transitions et réduction des mouvements
  js/
    app.js                # Initialisation
    deck.js               # Navigation, URL, mode de présentation
    state.js              # État courant et sauvegarde locale
    core/                 # Formats, calculs, retenues, interprétations
    widgets/              # Registre, additionneur, mémoire, atelier RVB
    exercises/            # Validation et retours pédagogiques
  content/
    modules.js            # Ordre, objectifs, exemples, exercices
  tests/                  # Vérification des calculs et parcours essentiels
  documentation/          # Supports et présente étude
```

Le contenu décrit l’objectif, la consigne, l’état initial, l’outil utilisé, les étapes, les indices et le critère de réussite de chaque écran. Les composants fournissent les comportements communs. L’ajout d’un exercice utilisant un outil existant doit se limiter principalement à sa rédaction et à ses paramètres.

La progression des animations repose sur une liste d’états calculés. **Le calcul reste indépendant de la durée d’une transition CSS** : accélérer, interrompre ou supprimer le mouvement ne change jamais la réponse. Changer d’écran interrompt proprement la séquence précédente.

Les modules JavaScript sont servis en HTTP en développement et en HTTPS en ligne. L’ouverture du fichier HTML par double-clic n’est pas un mode d’exécution à promettre avec cette architecture ; les [modules JavaScript imposent des contraintes de chargement local](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Modules).

### Calcul numérique dans le navigateur

Les opérateurs bit à bit appliqués aux `Number` JavaScript travaillent sur des entiers de 32 bits. Ils ne peuvent pas être utilisés sans précaution comme modèle générique de registre. Voir la [documentation de l’opérateur AND](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_AND).

**Recommandation : utiliser `BigInt` dans le noyau de simulation**, avec une largeur explicitement bornée à chaque opération. Cela évite de changer de convention lorsque le parcours passe de 8 à 16 ou 24 bits. Les dimensions d’interface et les indices restent des `Number`.

Le principe à prototyper est le suivant :

```js
const width = 8;
const rawSum = 255n + 1n;
const stored = BigInt.asUintN(width, rawSum); // 0n
const carry = rawSum >= (1n << BigInt(width)); // true
const signed = BigInt.asIntN(width, stored); // 0n
```

Cet exemple calcule la retenue d’une addition de deux valeurs non signées déjà bornées à la largeur du registre. Le dépassement signé demande un calcul séparé. `BigInt.asUintN` conserve les bits de poids faible à la largeur demandée : [référence MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt/asUintN).

Le noyau devra valider toute la saisie : base autorisée, caractères, signe éventuel et plage. Une valeur hors plage est signalée avant toute troncature, sauf dans une activité qui enseigne explicitement cette troncature. Les valeurs `BigInt` seront sauvegardées sous forme de chaînes avec leur largeur et leur interprétation.

### Sauvegarde et exploitation

La progression conservée localement comporte le dernier écran, les exercices réalisés et les préférences d’affichage. Une impossibilité d’écrire dans le stockage ne bloque pas le cours : la session continue en mémoire et indique simplement que la reprise ne sera pas conservée. Ce comportement tient compte des [conditions et limites de `localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

Avec un dépôt public et GitHub Free, GitHub Pages est disponible sans abonnement supplémentaire pour l’hébergement ; un domaine personnalisé reste facultatif. La maintenance concerne surtout le contenu et sa vérification avant chaque rentrée. La disponibilité selon la visibilité du dépôt et l’offre GitHub est précisée dans la [documentation GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

### Publication recommandée avec GitHub Pages

Le dépôt peut conserver le code de l’application dans `binary/`. **Un workflow GitHub Actions publiera uniquement les fichiers nécessaires au site**, en plaçant `binary/index.html` à la racine du dossier publié. Les PDF de référence et les tests resteront dans le dépôt, hors de ce dossier de publication, sauf décision de proposer les PDF au téléchargement.

Pour un dépôt GitHub nommé `learning-toolkit`, l’adresse attendue serait `https://<compte>.github.io/learning-toolkit/`. Cette URL est un exemple de destination, pas un site déjà publié. Si le dépôt accueille ensuite plusieurs applications, on pourra conserver un accueil commun et placer ce parcours sous `/learning-toolkit/binary/`.

La mise en place comprendra :

1. Choisir « GitHub Actions » comme source dans les paramètres Pages du dépôt.
2. Ajouter un workflow `.github/workflows/deploy-pages.yml`, lancé sur la branche de publication et manuellement.
3. Vérifier les calculs, préparer un dossier avec le HTML, les styles, les modules JS et les ressources utilisées, puis le publier avec les actions officielles Pages.
4. Vérifier sur l’URL publiée les liens directs vers les écrans, le rechargement, les ressources et la sauvegarde locale.

Cette organisation utilise le [déploiement personnalisé de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Elle ne nécessite pas de compilation de l’application : le workflow peut simplement vérifier, copier et publier les fichiers.

Les liens vers les ressources seront relatifs, par exemple `./styles/base.css`, pour fonctionner sous le préfixe du dépôt. La navigation utilisera un fragment tel que `#module-b/ecran-08` : le navigateur recharge toujours le même `index.html`, sans demander au serveur une route applicative inexistante.

Une publication directe depuis une branche reste possible à la racine ou depuis `/docs`. GitHub ne propose pas de sélectionner arbitrairement `/binary` dans ce mode ; c’est la raison pratique du choix de GitHub Actions ici. Voir les [sources de publication autorisées](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Les étudiants accèdent au cours par son URL. Les réponses et la progression restent dans leur navigateur. Le déploiement Pages fait partie de l’étape 4 de la roadmap ; aucun service applicatif côté serveur n’est nécessaire pour ce périmètre.

## 8. Identité graphique, animation et accessibilité

### 8.1. Continuité avec les supports

L’application reprend la composition aérée des diapositives : fond gris clair, titres amples, explication courte et grande zone de démonstration. La page de titre de la partie 1 fournit la référence pour l’accueil ; sa page 9 fournit celle des registres et des calculs.

La lecture des polices incorporées aux deux PDF confirme la présence de **Roboto** et de **Roboto Mono**, avec plusieurs graisses. Les couleurs ci-dessous constituent une palette de travail relevée dans le rendu des supports et les logos extraits ; leur usage dans l’interface est une proposition d’adaptation.

| Élément | Référence et usage proposé |
| --- | --- |
| Logo ATI | Réutiliser [le logo extrait de la partie 1](../assets/logo-ati-partie-1.png), en conservant proportions et couleurs, dans la signature du cours. |
| Logo Paris 8 | Utiliser [la version couleur](../assets/logo-universite-paris-8-couleur-partie-1.png) sur l’accueil et les ouvertures de module ; [la version noire](../assets/logo-universite-paris-8-noir-partie-1.png) peut accompagner les écrans de cours. |
| Titres | Roboto 300, avec Roboto 400 en mode projection si nécessaire ; tailles généreuses et espacement régulier. |
| Texte courant | Roboto 400 ; Roboto 500 ou 700 pour les commandes et les informations importantes. |
| Bits, hexa, adresses et code | Roboto Mono 400 ou 700 ; chiffres alignés, largeur stable des cellules et zéros de tête visibles. |
| Illustrations | Réutiliser les images de `binary/assets/` pour contextualiser une notion ; construire les schémas manipulables en HTML/SVG. |

Les logos gardent une place stable : signature ATI en bas à gauche et Paris 8 en bas à droite sur les grandes vues, en écho aux supports. Sur petit écran, ils rejoignent un pied de page dans le flux du document. Leur affichage ne recouvre jamais les commandes ni les exercices. Le logo ATI disponible mesure 204 × 204 pixels : conserver un affichage compact pour préserver sa netteté.

Les polices sont hébergées avec le prototype dans `binary/fonts/`, au format WOFF2 avec leurs licences associées, et chargées par `@font-face` avec `font-display: swap`. Une police sans empattement de secours est prévue pour le texte et une police monospace pour le code. Les images déjà renommées restent directement dans `binary/assets/`.

### 8.2. Palette et signification des couleurs

| Couleur | Valeur de départ | Fonction |
| --- | --- | --- |
| Gris clair | `#EEEEEE` | Fond général, relevé dans les diapositives |
| Blanc | `#FFFFFF` | Surfaces de calcul et texte des bits à 0 |
| Noir | `#000000` | Texte principal et fond des bits à 0 |
| Gris foncé | `#595959` | Sous-titres et informations secondaires |
| Jaune vif | `#EEFF41` | Fond des bits à 1, avec chiffre noir ; relevé sur la page 9 de la partie 1 |
| Violet | `#842578` | Accent de navigation et contour de focus, issu du logo Paris 8 |
| Magenta | `#B41859` | Accent ponctuel de l’identité Paris 8 |

**Un bit à 1 est jaune avec un chiffre noir ; un bit à 0 est noir avec un chiffre blanc.** La sélection clavier ajoute un contour distinct, extérieur à la case. Un bit à 0 reste une commande active : il ne prend pas l’apparence d’un bouton désactivé.

Le jaune exprime la valeur 1 dans les registres. Une correction utilise un libellé « correct » ou « à revoir » et un symbole explicite, pour éviter de confondre valeur du bit et réussite de l’exercice. Les composantes rouge, verte et bleue restent réservées aux explications RVB, avec leurs lettres et valeurs toujours visibles.

Les choix seront centralisés dans des variables CSS, par exemple :

```css
:root {
  --font-text: "Roboto", Arial, sans-serif;
  --font-code: "Roboto Mono", monospace;
  --color-page: #eeeeee;
  --color-surface: #ffffff;
  --color-text: #000000;
  --color-muted: #595959;
  --color-bit-on: #eeff41;
  --color-bit-off: #000000;
  --color-accent: #842578;
  --color-accent-secondary: #b41859;
}
```

### 8.3. Composition d’un écran

L’en-tête indique le module, le titre et la progression. La zone principale associe une consigne courte à une démonstration suffisamment grande pour lire chaque bit. En projection, l’explication peut occuper le tiers gauche et la manipulation les deux tiers droits ; sur petit écran, elles se superposent. Les commandes « prédire », « vérifier », « étape suivante » et « réinitialiser » gardent leur emplacement d’un exercice à l’autre.

Des cellules rectangulaires, des séparateurs de quartets et des flèches simples reprennent le vocabulaire des schémas existants. Les regroupements, la typographie et l’espacement assurent la hiérarchie visuelle. Les blocs de code utilisent les mêmes fonds clairs et restent proches de la manipulation qu’ils expliquent.

### 8.4. Mouvement et lisibilité

Les animations doivent révéler un mécanisme : propagation d’une retenue, déplacement d’un bit, sélection d’un quartet ou transfert d’un octet. Les transitions entre diapositives peuvent rester très discrètes.

Principes de conception :

- Avancement manuel par défaut ; aucune progression automatique du cours.
- Boutons natifs et focus visible ; toutes les manipulations restent possibles au clavier.
- Aucun glisser-déposer obligatoire : une sélection puis un bouton permettent la même action.
- Bit actif identifiable par sa valeur, son état de bouton et son apparence, sans dépendre uniquement d’une couleur.
- Libellés explicites, par exemple « bit 3, poids 8, activé » ; résultats expliqués en texte.
- Changement d’écran annoncé et focus déplacé de façon prévisible ; pas d’interception des flèches pendant la saisie dans un champ.
- Possibilité de supprimer les mouvements tout en conservant les étapes et leur sens.
- À petit écran, les trois composantes RVB se superposent verticalement ; elles restent alignées horizontalement lorsque l’espace le permet.

La navigation et le contrôle du mouvement suivent les [recommandations WAI pour les diaporamas](https://www.w3.org/WAI/tutorials/carousels/). La réduction des animations utilise [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion), complétée par un réglage dans l’application.

Viser un contraste d’au moins 4,5:1 pour le texte courant, et 3:1 pour les grands textes selon leur taille et leur graisse : [critère WCAG sur le contraste du texte](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Les contours et indicateurs indispensables à la compréhension des commandes visent 3:1 avec les couleurs adjacentes : [contraste des éléments non textuels](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Le jaune des bits utilise donc du texte noir et un contour sombre lorsqu’il est adjacent à une surface claire.

Pour la projection, tester une diapositive réelle dans la salle : contraste, taille du code, indices des bits et visibilité des retenues au dernier rang. La validation sur un ordinateur portable ne suffit pas à juger cet usage.

## 9. Périmètre de la première version et extensions

| Première version complète | Évolutions après les premiers cours |
| --- | --- |
| Sept modules et scénario initial de 40 écrans | Multiplication et division binaires générales |
| Registres, conversions, opérations logiques, addition et soustraction | Additionneur détaillé porte par porte, électronique simplifiée |
| Décalages, rotation illustrative, petite mémoire | Machine programmable ou véritables instructions d’une architecture choisie |
| Application RVB et fragments C/C++ vérifiés | Audio signé/non signé, sprites monochromes et formats de fichiers |
| Indices, corrections, bilan local par compétence | Export/import de progression, version imprimable, mode hors ligne installé |
| Modes projection et individuel | Synchronisation d’une classe, tableau de bord enseignant, intégration à une plateforme pédagogique |
| Publication GitHub Pages et reprise locale | Éditeur et exécution libre de C/C++ |

L’autocorrection initiale porte sur des nombres, des bits et des fragments à compléter avec des choix délimités. La compilation d’un programme arbitraire saisi dans le navigateur constitue un autre chantier.

Le mode hors ligne installé demande une gestion du cache et des mises à jour, généralement avec un service worker. Il ne découle pas automatiquement du choix d’un site statique.

## 10. Roadmap et estimation de charge

Les charges ci-dessous sont des **estimations de conception**, pas un devis. Elles supposent une personne à l’aise en JavaScript et CSS, la réutilisation des mêmes composants dans plusieurs écrans, des exemples C/C++ courts et une relecture enseignante disponible. Elles comprennent développement, rédaction et vérification technique ; la disponibilité des étudiants peut allonger le calendrier sans augmenter autant la charge.

| Étape | Charge | Travaux et livrables | Condition de passage |
| --- | --- | --- | --- |
| **0. Cadrage pédagogique** | 2–3 jours | Corriger les exemples source ; fixer conventions et objectifs ; rédiger le storyboard ; choisir les exercices témoins ; formaliser palette, typographie et placement des logos | Chaque module possède une compétence observable et des résultats de référence ; direction graphique documentée |
| **1. Prototype de six écrans** | 4–6 jours | Écrans 02, 04, 07, 08, 18 et 24 ; registre, regroupement hexa, retenues et décalage ; navigation accessible ; intégration des logos, polices et variables CSS | Un petit groupe peut manipuler et expliquer les changements ; identité graphique et lisibilité en projection vérifiées |
| **2. Composants et interactions** | 8–12 jours | Noyau de calcul, opérations, signé, mémoire, RVB, contrôleur des étapes, modes et sauvegarde | Cas de référence automatisés corrects ; composants utilisables au clavier et sans mouvement |
| **3. Parcours complet** | 5–8 jours | Intégrer les 40 écrans, consignes, indices et corrections ; vérifier les exemples C/C++ ; harmoniser le vocabulaire | Parcours intégral réalisable ; chaque compétence possède au moins un exercice autonome |
| **4. Essais, corrections et mise en ligne** | 4–6 jours | Essais en salle et individuels ; vérification des navigateurs ; corrections ; documentation d’usage ; workflow GitHub Actions et publication Pages | Critères de réception satisfaits, URL publiée vérifiée et version identifiée |
| **Total hors réserve** | **23–35 jours** | Première version complète | |
| **Réserve d’environ 20 %** | **5–7 jours** | Ajustements issus des essais et problèmes de présentation | |
| **Enveloppe de planification** | **28–42 jours** | Environ six à neuf semaines à temps plein | |

**Dépendances :** le cadrage fixe les conventions du noyau ; le prototype éprouve les trois mécanismes visuels les plus structurants ; le noyau validé permet la déclinaison des exercices ; les essais finaux portent sur le parcours réellement intégré. La rédaction peut avancer pendant le développement des composants, mais la recette finale vient après leur intégration.

Prévoir côté enseignant environ **6 à 10 heures de relecture et d’échanges**, réparties entre cadrage, prototype et recette, en complément des séances avec les étudiants. Le chiffrage ne comprend pas un service de comptes, un suivi centralisé ni un compilateur en ligne.

Le premier jalon utile arrive après **6 à 9 jours de travail cumulés**, cadrage compris. Il doit permettre de décider si les interactions aident effectivement à expliquer les notions avant de produire tout le cours.

## 11. Validation et critères de réception

### Vérification des calculs

Les tests du futur noyau doivent porter sur les invariants et les erreurs pédagogiques possibles :

| Domaine | Cas de référence |
| --- | --- |
| Conversion | Aller-retour binaire/hexa pour les 256 motifs d’un octet, avec conservation de la largeur affichée |
| Addition | `7 + 1`, `255 + 1`, `127 + 1` ; somme stockée, retenue et dépassement signé vérifiés séparément |
| Signé | `0x00 → 0`, `0x7F → 127`, `0x80 → −128`, `0xFF → −1` sur 8 bits |
| Soustraction | `5 − 3`, `3 − 5`, `0 − 1` ; cohérence entre motif stocké et interprétation |
| Opérations logiques | Tables de vérité complètes ; inversion deux fois d’un registre ; XOR d’un motif avec lui-même |
| Décalages | Sur 8 bits, `0x81` décalé d’un bit à gauche donne `0x02` ; `13` à droite donne `6` |
| RVB | Extraction `(152, 165, 233)` depuis `0x98A5E9`, puis reconstruction ; RVB12 `0xEDA27B → 0xEA7` |
| Saisie | Refus d’une chaîne contenant un chiffre incompatible avec la base ; dépassement de plage explicite |

Les tests d’interface couvrent les transitions qui peuvent fausser une démonstration : retour à l’étape précédente, modification d’une opérande en cours d’animation, changement d’écran, reprise après rechargement et stockage local indisponible. Les cas de code C/C++ sont compilés dans leur mode de langage annoncé.

### Essais pédagogiques

Pour le prototype, organiser des essais avec **quatre à six étudiants** de niveaux différents. Demander à chacun de prédire, manipuler, puis expliquer une conversion, une retenue et un bit perdu. Ce petit groupe permet de détecter des problèmes d’usage ; il ne constitue pas une démonstration statistique d’efficacité.

Pour la première utilisation en cours, proposer un court diagnostic avant le parcours et des exercices comparables après, avec d’autres valeurs. Consigner les confusions persistantes : nombre de valeurs contre maximum, OR contre addition, adresse contre contenu, motif contre interprétation.

**Critères de réception proposés :**

- Aucun écart sur les cas de référence numériques et les fragments C/C++ valides.
- Tous les exercices obligatoires réalisables au clavier, avec animation réduite et sans dépendance à la couleur seule.
- Logos correctement proportionnés, Roboto et Roboto Mono chargées depuis le site, palette cohérente et contrastes vérifiés pour les textes et les commandes.
- Parcours et reprise testés dans les versions de Chrome, Firefox, Safari et Edge retenues pour l’établissement ; absence de blocage si la sauvegarde échoue.
- Lecture satisfaisante en projection ; accès aux manipulations sur un écran étroit sans commandes masquées.
- Cible pédagogique à confirmer lors du pilote : au moins 80 % des étudiants réussissent quatre des cinq tâches finales — conversion, retenue, interprétation signée, masque, extraction RVB — et expliquent leur démarche.

Cette dernière cible sert à décider quelles explications retravailler. Elle n’est pas une efficacité déjà mesurée ni une condition qui empêcherait un étudiant de poursuivre.

## 12. Risques et arbitrages

| Risque | Conséquence | Réponse prévue |
| --- | --- | --- |
| Trop de notions par écran | Manipulations faites sans compréhension | Un objectif par écran ; indices graduels ; question de transfert |
| Confusion entre registre et langage | Mauvais réflexes en C/C++ | Afficher largeur et interprétation ; séparer calcul, conversion et stockage |
| Animation difficile à suivre | Mécanisme masqué par la vitesse | Étapes manuelles, retour arrière, version sans mouvement |
| Différences de niveau | Ennui ou décrochage | Diagnostic, navigation par modules, détails facultatifs |
| Composants trop spécifiques | Coût élevé pour ajouter des exercices | Réutiliser registre, opérations et moteur d’étapes ; paramètres séparés du contenu |
| Extension vers un émulateur complet | Charge disproportionnée pour l’objectif initial | Machine limitée à des séquences illustratives fixes |
| Reprise locale prise pour un suivi de classe | Attentes de synchronisation non satisfaites | Indiquer explicitement que la progression reste sur cet appareil |

**Décision recommandée : engager le cadrage et le prototype de six écrans.** Ce jalon teste le cœur du projet — compter, regrouper les bits en hexa, propager une retenue et observer une perte de bits — et fournit une base concrète pour ajuster la charge et le parcours complet.
