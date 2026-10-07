/** Navigation par fragments d’URL, sans rechargement ni route côté serveur. */
export function mountDeck(screens) {
  const navigation = document.querySelector('.screen-navigation');
  const previous = document.querySelector('#screen-previous');
  const next = document.querySelector('#screen-next');
  const status = document.querySelector('#lesson-status');
  const instances = new Map();
  let active = null;

  function updateLink(link, screen, direction) {
    link.hidden = !screen;
    if (!screen) return;
    link.href = `#${screen.hash}`;
    link.setAttribute('aria-label', `Écran ${direction} : ${screen.id} — ${screen.title}`);
    link.title = `${screen.id} — ${screen.title}`;
  }

  function render({ moveFocus = false } = {}) {
    const requested = window.location.hash.slice(1);
    const index = Math.max(0, screens.findIndex(screen => screen.hash === requested));
    const screen = screens[index];
    if (requested !== screen.hash) history.replaceState(null, '', `#${screen.hash}`);
    if (active === screen) return;
    active = screen;
    for (const item of screens) item.root.hidden = item !== screen;
    if (!instances.has(screen.id)) {
      instances.set(screen.id, screen.mount(screen.root, {
        onStatusChange(value) { if (active === screen) status.textContent = value; },
      }));
    }
    document.title = `${screen.title} — Atelier binaire · ATI`;
    document.querySelector('#screen-number').textContent = screen.id;
    document.querySelector('#chapter-letter').textContent = screen.chapter;
    document.querySelector('#chapter-title').textContent = screen.chapterTitle;
    status.textContent = instances.get(screen.id).getStatus();
    updateLink(previous, screens[index - 1], 'précédent');
    updateLink(next, screens[index + 1], 'suivant');
    if (moveFocus) {
      screen.root.querySelector('h1').focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  // Le lien d’évitement déplace le focus sans modifier l’URL de l’écran actif.
  document.querySelector('.skip-link').addEventListener('click', event => {
    event.preventDefault();
    document.querySelector('#lesson').focus();
  });
  window.addEventListener('hashchange', () => render({ moveFocus: true }));
  render();
  navigation.hidden = false;
}
