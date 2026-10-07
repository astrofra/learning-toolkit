import { mountChallenge } from '../widgets/challenge.js';

// Modèle pédagogique : seize adresses, un octet non signé par adresse.
const INITIAL_BYTES = [0x00, 0x2A, 0x7F, 0x10, 0xFF, 0x08, 0xC3, 0x00, 0x91, 0x42, 0x3C, 0xA5, 0x18, 0x80, 0x0F, 0xE7];
const hex = value => `0x${value.toString(16).toUpperCase().padStart(2, '0')}`;

export function mountMemory(root, { onStatusChange }) {
  const memory = Uint8Array.from(INITIAL_BYTES);
  const baseline = Uint8Array.from(INITIAL_BYTES);
  const grid = root.querySelector('#memory-grid');
  const byte = root.querySelector('#memory-byte');
  const resetButton = root.querySelector('#memory-reset');
  const clearButton = root.querySelector('#memory-clear');
  const writeForm = root.querySelector('#memory-write-form');
  const writeInput = root.querySelector('#memory-write-value');
  const writeFeedback = root.querySelector('#memory-write-feedback');
  const announcement = root.querySelector('#memory-announcement');
  const observation = root.querySelector('#memory-observation');
  const fields = Object.fromEntries(['address', 'address-binary', 'value', 'decimal', 'relation-address', 'relation-value'].map(name => [name, root.querySelector(`#memory-${name}`)]));
  let selected = 0x0A;
  let challengeCorrect = false;

  function getStatus() {
    return challengeCorrect ? '27 / Notion comprise ✓' : '27 / Adresse et contenu';
  }

  const challenge = mountChallenge(root, {
    evaluate(answer) {
      const correct = answer === 'content';
      return {
        correct,
        message: correct
          ? 'Exactement ! L’adresse 0x0A désigne toujours la même case. C’est l’octet qu’elle contient qui prend la valeur 0xFF, soit 255.'
          : 'L’adresse sert à choisir la case. Une écriture remplace son contenu, pas son adresse. Ici, 0xFF est la nouvelle valeur stockée.',
      };
    },
    onResult(correct) {
      challengeCorrect = correct === true;
      onStatusChange(getStatus());
    },
  });

  const cells = Array.from(memory, (_, address) => {
    const location = document.createElement('div');
    location.className = 'memory-location';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-cell';
    button.dataset.address = String(address);
    const label = document.createElement('span');
    label.className = 'cell-address';
    label.textContent = hex(address);
    const value = document.createElement('span');
    value.className = 'cell-value';
    button.append(value);
    location.append(label, button);
    button.addEventListener('click', () => select(address));
    button.addEventListener('focus', () => {
      if (button.matches(':focus-visible')) reveal(address);
    });
    button.addEventListener('keydown', event => {
      const destinations = {
        ArrowLeft: Math.max(0, address - 1),
        ArrowRight: Math.min(memory.length - 1, address + 1),
        Home: 0,
        End: 15,
      };
      if (!(event.key in destinations)) return;
      event.preventDefault();
      const target = destinations[event.key];
      if (target === selected) return;
      select(target);
      cells[target].button.focus({ preventScroll: true });
    });
    grid.append(location);
    return { location, button, value };
  });

  const bitButtons = Array.from({ length: 8 }, (_, index) => {
    const position = 7 - index;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-bit';
    button.setAttribute('aria-label', `Bit ${position}, poids ${2 ** position}`);
    const digit = document.createElement('span');
    digit.className = 'memory-bit-digit';
    digit.setAttribute('aria-hidden', 'true');
    const number = document.createElement('span');
    number.className = 'memory-bit-index';
    number.textContent = String(position);
    number.setAttribute('aria-hidden', 'true');
    button.append(digit, number);
    button.addEventListener('click', () => write(memory[selected] ^ (1 << position)));
    byte.append(button);
    return { button, digit, position };
  });

  function render() {
    const value = memory[selected];
    cells.forEach((cell, address) => {
      cell.value.textContent = hex(memory[address]).slice(2);
      cell.button.setAttribute('aria-label', `Adresse ${hex(address)}, contenu ${hex(memory[address])}`);
      cell.button.setAttribute('aria-pressed', String(address === selected));
      cell.button.tabIndex = address === selected ? 0 : -1;
      cell.button.dataset.modified = String(memory[address] !== baseline[address]);
      cell.location.dataset.selected = String(address === selected);
    });
    bitButtons.forEach(({ button, digit, position }) => {
      const bit = (value >> position) & 1;
      button.setAttribute('aria-pressed', String(bit === 1));
      digit.textContent = String(bit);
    });
    fields.address.textContent = hex(selected);
    fields['address-binary'].textContent = selected.toString(2).padStart(4, '0');
    fields.value.textContent = hex(value);
    fields.decimal.textContent = `${value} en décimal`;
    fields['relation-address'].textContent = hex(selected);
    fields['relation-value'].textContent = hex(value);
    writeInput.value = hex(value).slice(2);
    writeInput.removeAttribute('aria-invalid');
  }

  // Déplacer uniquement le ruban, sans faire sauter la page vers l’inspecteur.
  function reveal(address) {
    const location = cells[address].location;
    const left = location.offsetLeft;
    if (left < grid.scrollLeft || left + location.offsetWidth > grid.scrollLeft + grid.clientWidth) {
      grid.scrollTo({ left: left - (grid.clientWidth - location.offsetWidth) / 2, behavior: 'instant' });
    }
  }

  function select(address) {
    selected = address;
    render();
    reveal(selected);
    writeFeedback.textContent = '';
    delete writeFeedback.dataset.result;
    observation.textContent = `La case ${hex(selected)} contient ${hex(memory[selected])}. Choisir une adresse ne modifie pas son contenu.`;
    announcement.textContent = `Adresse ${hex(selected)}, soit ${selected} en décimal. Contenu ${hex(memory[selected])}, soit ${memory[selected]} en décimal.`;
  }

  function write(value) {
    const previous = memory[selected];
    memory[selected] = value;
    render();
    delete writeFeedback.dataset.result;
    writeFeedback.textContent = previous === value
      ? `La case ${hex(selected)} contient déjà ${hex(value)}.`
      : `${hex(previous)} → ${hex(value)}. L’adresse reste ${hex(selected)}.`;
    observation.textContent = `Vous écrivez dans la case ${hex(selected)}. Les quinze autres octets restent inchangés.`;
  }

  writeForm.addEventListener('submit', event => {
    event.preventDefault();
    const input = writeInput.value.trim();
    // Valider la chaîne entière avant conversion : aucune troncature implicite.
    if (!/^(?:0x)?[0-9a-f]{1,2}$/i.test(input)) {
      writeInput.setAttribute('aria-invalid', 'true');
      writeFeedback.dataset.result = 'error';
      writeFeedback.textContent = 'Entrez un ou deux chiffres hexadécimaux, de 00 à FF (préfixe 0x facultatif). Aucune case n’a été modifiée.';
      return;
    }
    write(Number.parseInt(input.replace(/^0x/i, ''), 16));
  });
  writeInput.addEventListener('input', () => {
    writeInput.removeAttribute('aria-invalid');
    writeFeedback.textContent = '';
    delete writeFeedback.dataset.result;
  });
  resetButton.addEventListener('click', () => {
    memory.set(INITIAL_BYTES);
    baseline.set(INITIAL_BYTES);
    challenge.reset();
    select(0x0A);
    writeFeedback.textContent = 'Les 16 octets ont retrouvé leur contenu initial.';
  });
  clearButton.addEventListener('click', () => {
    memory.fill(0);
    baseline.fill(0);
    select(selected);
    writeFeedback.textContent = 'Les 16 octets sont maintenant à 0x00.';
    observation.textContent = 'Tout le contenu est à zéro. Les adresses de 0x00 à 0x0F restent les mêmes.';
  });

  render();
  reveal(selected);
  for (const control of [resetButton, clearButton, writeInput, writeForm.querySelector('button')]) control.disabled = false;
  return { getStatus };
}
