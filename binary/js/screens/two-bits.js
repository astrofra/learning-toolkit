import { mountChallenge } from '../widgets/challenge.js';

/** Écran 02 : composer puis collectionner les quatre motifs de deux bits. */
export function mountTwoBits(root, { onStatusChange }) {
  const bitButtons = [...root.querySelectorAll('[data-bit]')];
  const recordButton = root.querySelector('#record-pattern');
  const resetButton = root.querySelector('#two-bits-reset');
  const currentPattern = root.querySelector('#current-pattern');
  const count = root.querySelector('#pattern-count');
  const slots = [...root.querySelectorAll('.pattern-slot')];
  const feedback = root.querySelector('#collection-feedback');
  const insight = root.querySelector('#combinations-insight');
  const announcement = root.querySelector('#two-bits-announcement');
  const bits = [0, 0];
  const found = new Set();
  const ordinals = ['Premier', 'Deuxième', 'Troisième', 'Quatrième'];
  let challengeCorrect = false;

  function getStatus() {
    return found.size === 4 && challengeCorrect
      ? '02 / Notion comprise ✓'
      : `02 / ${found.size} sur 4 motifs découverts`;
  }

  const challenge = mountChallenge(root, {
    evaluate(answer) {
      const correct = answer === 'different';
      return {
        correct,
        message: correct
          ? 'Exactement ! Dans 01, le 1 est à droite. Dans 10, il est à gauche. La position de chaque bit fait partie du motif.'
          : 'Regardez la position du 1 : elle change entre 01 et 10. Les mêmes symboles peuvent former des motifs différents. Essayez encore.',
      };
    },
    onResult(correct) {
      challengeCorrect = correct === true;
      onStatusChange(getStatus());
    },
  });

  function render() {
    const pattern = bits.join('');
    bitButtons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(bits[index] === 1));
      button.querySelector('.bit-digit').textContent = String(bits[index]);
    });
    currentPattern.textContent = pattern;
    count.textContent = String(found.size);
    const patterns = [...found];
    slots.forEach((slot, index) => {
      const value = patterns[index];
      slot.dataset.found = String(value !== undefined);
      slot.dataset.current = String(value === pattern);
      slot.querySelector('.pattern-symbols').textContent = value ?? '··';
      slot.querySelector('.pattern-slot-label').textContent = value === undefined ? 'À TROUVER' : 'DÉCOUVERT ✓';
      slot.setAttribute('aria-label', value === undefined
        ? `${ordinals[index]} emplacement vide`
        : `${ordinals[index]} motif découvert : ${value.split('').join(' ')}`);
    });
    insight.hidden = found.size !== 4;
    onStatusChange(getStatus());
  }

  bitButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      bits[index] = 1 - bits[index];
      render();
      const pattern = bits.join('');
      announcement.textContent = `Bit de ${index === 0 ? 'gauche' : 'droite'} : ${bits[index]}. Motif actuel : ${bits.join(' ')}.`;
      delete feedback.dataset.result;
      feedback.textContent = found.has(pattern)
        ? `Le motif ${pattern} est déjà dans votre collection.`
        : `Le motif ${pattern} est nouveau. Enregistrez-le pour le conserver.`;
    });
  });

  recordButton.addEventListener('click', () => {
    const pattern = bits.join('');
    if (found.has(pattern)) {
      feedback.dataset.result = 'duplicate';
      feedback.textContent = `Le motif ${pattern} est déjà enregistré. Il ne compte qu’une fois : ${found.size} sur 4 motifs découverts.`;
      return;
    }
    found.add(pattern);
    render();
    feedback.dataset.result = 'new';
    feedback.textContent = found.size === 4
      ? 'Les quatre motifs sont réunis ! Vous avez trouvé toutes les combinaisons de deux bits.'
      : `Motif ${pattern} enregistré. ${found.size} sur 4 motifs découverts : continuez à explorer.`;
  });

  resetButton.addEventListener('click', () => {
    bits.fill(0);
    found.clear();
    challenge.reset();
    render();
    delete feedback.dataset.result;
    feedback.textContent = 'Collection réinitialisée. Enregistrez votre premier motif.';
    announcement.textContent = 'Les deux bits sont à 0. Le motif actuel est 0 0.';
  });

  render();
  for (const button of [...bitButtons, recordButton, resetButton]) button.disabled = false;
  return { getStatus };
}
