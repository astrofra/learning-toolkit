const STORAGE_KEY = 'learning-toolkit.binary.preferences.v1';

export function readPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      projection: saved?.projection === true,
      reducedMotion: typeof saved?.reducedMotion === 'boolean' ? saved.reducedMotion : null,
    };
  } catch {
    return { projection: false, reducedMotion: null };
  }
}

export function savePreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Les préférences restent utilisables pour la session si le stockage est indisponible.
  }
}
