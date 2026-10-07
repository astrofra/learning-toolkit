import { readPreferences, savePreferences } from './preferences.js';
import { mountTwoStates } from './screens/two-states.js';

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
mountTwoStates(document.querySelector('#lesson'));
