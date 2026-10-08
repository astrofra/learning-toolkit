import { readPreferences, savePreferences } from './preferences.js';
import { mountTwoStates } from './screens/two-states.js';
import { mountTwoBits } from './screens/two-bits.js';
import { mountMemory } from './screens/memory.js';
import { mountMachine } from './screens/machine.js';
import { mountDeck } from './deck.js';

const preferences = readPreferences();
const systemMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const projectionButton = document.querySelector('#projection-toggle');
const motionButton = document.querySelector('#motion-toggle');

function renderPreferences() {
  const reducedMotion = preferences.reducedMotion ?? systemMotion.matches;
  document.body.dataset.projection = String(preferences.projection);
  document.body.dataset.motion = reducedMotion ? 'reduced' : 'full';
  projectionButton.setAttribute('aria-pressed', String(preferences.projection));
  motionButton.setAttribute('aria-pressed', String(reducedMotion));
}

projectionButton.addEventListener('click', () => {
  preferences.projection = !preferences.projection;
  renderPreferences();
  savePreferences(preferences);
});

motionButton.addEventListener('click', () => {
  preferences.reducedMotion = !(preferences.reducedMotion ?? systemMotion.matches);
  renderPreferences();
  savePreferences(preferences);
});

systemMotion.addEventListener('change', renderPreferences);
renderPreferences();
projectionButton.disabled = false;
motionButton.disabled = false;
mountDeck([
  { id: '01', hash: 'module-a/ecran-01', chapter: 'A', chapterTitle: 'LES FONDAMENTAUX', title: 'Pourquoi deux états ?', root: document.querySelector('#screen-01'), mount: mountTwoStates },
  { id: '02', hash: 'module-a/ecran-02', chapter: 'A', chapterTitle: 'LES FONDAMENTAUX', title: 'Un bit, plusieurs bits', root: document.querySelector('#screen-02'), mount: mountTwoBits },
  { id: '27', hash: 'module-f/ecran-27', chapter: 'F', chapterTitle: 'LA MÉMOIRE', title: 'Adresse et contenu', root: document.querySelector('#screen-27'), mount: mountMemory },
  { id: '28', hash: 'module-f/ecran-28', chapter: 'F', chapterTitle: 'LA MÉMOIRE', title: 'Lecture, calcul, écriture', root: document.querySelector('#screen-28'), mount: mountMachine },
]);
