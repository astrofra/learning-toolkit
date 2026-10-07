/** Écran 01 : l’état physique et la convention utilisée pour le représenter. */
export function mountTwoStates(root) {
  const experiment = root.querySelector('#experiment');
  const lampSwitch = root.querySelector('#lamp-switch');
  const resetButton = root.querySelector('#reset');
  const bitValue = root.querySelector('#bit-value');
  const physicalLabel = root.querySelector('#physical-label');
  const announcement = root.querySelector('#state-announcement');
  const observationText = root.querySelector('#observation-text');
  const observationMark = root.querySelector('#observation-mark');
  const challenge = root.querySelector('#challenge');
  const openButton = root.querySelector('#challenge-open');
  const closeButton = root.querySelector('#challenge-close');
  const form = root.querySelector('#challenge-form');
  const checkButton = root.querySelector('#answer-check');
  const feedback = root.querySelector('#answer-feedback');
  const lessonStatus = document.querySelector('#lesson-status');
  let on = false;
  let exploredBothStates = false;

  function renderLamp() {
    experiment.dataset.on = String(on);
    lampSwitch.setAttribute('aria-checked', String(on));
    lampSwitch.querySelector('.switch-state').textContent = on ? '1' : '0';
    bitValue.textContent = on ? '1' : '0';
    physicalLabel.textContent = on ? 'Lampe allumée' : 'Lampe éteinte';
    observationMark.textContent = exploredBothStates ? '✓' : '↔';
    observationText.textContent = exploredBothStates
      ? 'Vous avez exploré les deux états. Un seul bit suffit à les représenter.'
      : 'Deux états possibles. Essayez de passer de l’un à l’autre.';
  }

  function closeChallenge() {
    challenge.hidden = true;
    openButton.setAttribute('aria-expanded', 'false');
    openButton.focus({ preventScroll: true });
  }

  lampSwitch.addEventListener('click', () => {
    on = !on;
    exploredBothStates ||= on;
    renderLamp();
    announcement.textContent = `${on ? 'Lampe allumée' : 'Lampe éteinte'}. La valeur du bit est ${on ? '1' : '0'}.`;
  });

  resetButton.addEventListener('click', () => {
    on = false;
    exploredBothStates = false;
    renderLamp();
    challenge.hidden = true;
    openButton.setAttribute('aria-expanded', 'false');
    form.reset();
    checkButton.disabled = true;
    feedback.textContent = '';
    delete feedback.dataset.result;
    lessonStatus.textContent = '01 / Pourquoi deux états ?';
    announcement.textContent = 'Expérience réinitialisée. Lampe éteinte. La valeur du bit est 0.';
  });

  openButton.addEventListener('click', () => {
    if (!challenge.hidden) {
      closeChallenge();
      return;
    }
    challenge.hidden = false;
    openButton.setAttribute('aria-expanded', 'true');
    const title = challenge.querySelector('h2');
    title.focus({ preventScroll: true });
    challenge.scrollIntoView({ behavior: document.body.dataset.motion === 'reduced' ? 'instant' : 'smooth', block: 'nearest' });
  });

  closeButton.addEventListener('click', closeChallenge);
  challenge.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeChallenge();
      event.preventDefault();
    }
  });

  form.addEventListener('change', () => {
    checkButton.disabled = !form.querySelector('input:checked');
    feedback.textContent = '';
    delete feedback.dataset.result;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const answer = new FormData(form).get('answer');
    if (!answer) return;
    const correct = answer === 'no';
    feedback.dataset.result = correct ? 'correct' : 'incorrect';
    feedback.textContent = correct
      ? 'Exactement ! La lampe reste allumée. Seule notre convention change : 0 et 1 sont les symboles que l’on choisit pour représenter deux états.'
      : 'Pas tout à fait. Changer le symbole ne touche pas à l’interrupteur. La lampe reste allumée : essayez l’autre réponse.';
    lessonStatus.textContent = correct ? '01 / Notion comprise ✓' : '01 / Pourquoi deux états ?';
  });

  renderLamp();
  for (const button of [lampSwitch, resetButton, openButton]) button.disabled = false;
}
