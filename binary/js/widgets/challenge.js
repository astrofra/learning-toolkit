/** Comportement commun aux défis : ouverture, focus, correction et remise à zéro. */
export function mountChallenge(root, { evaluate, onResult }) {
  const panel = root.querySelector('.challenge');
  const openButton = root.querySelector(`[aria-controls="${panel.id}"]`);
  const closeButton = panel.querySelector('[data-challenge-close]');
  const form = panel.querySelector('form');
  const submitButton = form.querySelector('[type="submit"]');
  const feedback = form.querySelector('.feedback');

  function close({ restoreFocus = true } = {}) {
    panel.hidden = true;
    openButton.setAttribute('aria-expanded', 'false');
    if (restoreFocus) openButton.focus({ preventScroll: true });
  }

  openButton.addEventListener('click', () => {
    if (!panel.hidden) return close();
    panel.hidden = false;
    openButton.setAttribute('aria-expanded', 'true');
    panel.querySelector('h2').focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: document.body.dataset.motion === 'reduced' ? 'instant' : 'smooth', block: 'nearest' });
  });
  closeButton.addEventListener('click', () => close());
  panel.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    close();
    event.preventDefault();
  });
  form.addEventListener('change', () => {
    submitButton.disabled = !form.querySelector('input:checked');
    feedback.textContent = '';
    delete feedback.dataset.result;
    onResult(null);
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const answer = new FormData(form).get('answer');
    if (!answer) return;
    const { correct, message } = evaluate(answer);
    feedback.dataset.result = correct ? 'correct' : 'incorrect';
    feedback.textContent = message;
    onResult(correct);
  });
  openButton.disabled = false;

  return {
    reset() {
      close({ restoreFocus: false });
      form.reset();
      submitButton.disabled = true;
      feedback.textContent = '';
      delete feedback.dataset.result;
      onResult(null);
    },
  };
}
