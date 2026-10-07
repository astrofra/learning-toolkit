import { mountChallenge } from '../widgets/challenge.js';

/** Écran 01 : l’état physique et la convention utilisée pour le représenter. */
export function mountTwoStates(root, { onStatusChange }) {
  const experiment = root.querySelector('#experiment');
  const lampSwitch = root.querySelector('#lamp-switch');
  const resetButton = root.querySelector('#reset');
  const bitValue = root.querySelector('#bit-value');
  const physicalLabel = root.querySelector('#physical-label');
  const announcement = root.querySelector('#state-announcement');
  const observationText = root.querySelector('#observation-text');
  const observationMark = root.querySelector('#observation-mark');
  let on = false;
  let exploredBothStates = false;
  let status = '01 / Pourquoi deux états ?';
  const challenge = mountChallenge(root, {
    evaluate(answer) {
      const correct = answer === 'no';
      return {
        correct,
        message: correct
          ? 'Exactement ! La lampe reste allumée. Seule notre convention change : 0 et 1 sont les symboles que l’on choisit pour représenter deux états.'
          : 'Pas tout à fait. Changer le symbole ne touche pas à l’interrupteur. La lampe reste allumée : essayez l’autre réponse.',
      };
    },
    onResult(correct) {
      status = correct ? '01 / Notion comprise ✓' : '01 / Pourquoi deux états ?';
      onStatusChange(status);
    },
  });

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
    challenge.reset();
    announcement.textContent = 'Expérience réinitialisée. Lampe éteinte. La valeur du bit est 0.';
  });

  renderLamp();
  for (const button of [lampSwitch, resetButton]) button.disabled = false;
  return { getStatus: () => status };
}
