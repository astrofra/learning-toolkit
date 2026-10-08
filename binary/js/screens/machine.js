import { mountChallenge } from '../widgets/challenge.js';

// Scénario fixe : deux lectures, une addition de registres, une écriture.
// Chaque état possède sa mémoire pour que le retour arrière annule aussi l’écriture.
const INITIAL_BYTES = [0x00, 0x2A, 0x7F, 0x10, 0xFF, 0x08, 0xC3, 0x00, 0x91, 0x42, 0x3C, 0xA5, 0x18, 0x80, 0x0F, 0xE7];
const hex = value => `0x${value.toString(16).toUpperCase().padStart(2, '0')}`;
const COMMANDS = [
  { title: 'Charger A', kind: 'read', address: 0x0A, register: 'a' },
  { title: 'Charger B', kind: 'read', address: 0x03, register: 'b' },
  { title: 'Additionner', kind: 'add' },
  { title: 'Stocker', kind: 'write', address: 0x0C, register: 'a' },
];

function createStates() {
  const states = [{ memory: Uint8Array.from(INITIAL_BYTES), address: 0, a: 0, b: 0 }];
  for (const command of COMMANDS) {
    const previous = states.at(-1);
    const state = { ...previous, memory: previous.memory.slice() };
    if (command.kind === 'read') {
      state.address = command.address;
      state[command.register] = state.memory[state.address];
    } else if (command.kind === 'add') {
      // Les deux opérandes du scénario donnent 76 : aucun dépassement sur 8 bits.
      state.a = (state.a + state.b) & 0xFF;
    } else {
      state.address = command.address;
      state.memory[state.address] = state[command.register];
    }
    states.push(state);
  }
  return states;
}

export function mountMachine(root, { onStatusChange }) {
  const states = createStates();
  const field = name => root.querySelector(`#machine-${name}`);
  const next = field('next');
  const previous = field('previous');
  const reset = field('reset');
  const scroll = field('memory-scroll');
  const program = [...root.querySelectorAll('[data-machine-step]')];
  let step = 0;
  let completed = false;
  let challengeCorrect = false;

  function getStatus() {
    return completed && challengeCorrect
      ? '28 / Notion comprise ✓'
      : `28 / ${step} sur ${COMMANDS.length} étapes exécutées`;
  }

  const challenge = mountChallenge(root, {
    evaluate(answer) {
      return {
        correct: answer === 'register',
        message: answer === 'register'
          ? 'Exactement ! L’addition place 0x4C dans A. La mémoire contient encore 0x3C en 0x0A et 0x18 en 0x0C. Il faut exécuter « Stocker » pour écrire le résultat en mémoire.'
          : answer === 'source'
            ? 'Lire copie l’octet dans A, sans vider ni modifier la case 0x0A. L’addition change ensuite A, pas la mémoire : 0x0A contient toujours 0x3C.'
            : 'Prévoir une destination ne suffit pas à écrire. La case 0x0C contient encore 0x18 : elle ne recevra 0x4C qu’à l’étape « Stocker ».',
      };
    },
    onResult(correct) {
      challengeCorrect = correct === true;
      onStatusChange(getStatus());
    },
  });

  const cells = INITIAL_BYTES.map((_, address) => {
    const heading = document.createElement('th');
    heading.scope = 'col';
    heading.textContent = hex(address);
    field('addresses').append(heading);
    const cell = document.createElement('td');
    cell.dataset.address = String(address);
    const value = document.createElement('span');
    value.className = 'machine-cell-value';
    const transfer = document.createElement('span');
    transfer.className = 'machine-cell-transfer';
    cell.append(value, transfer);
    field('cells').append(cell);
    return { cell, heading, value, transfer };
  });

  const registers = ['address', 'a', 'b'].map(name => {
    const width = name === 'address' ? 4 : 8;
    const bits = field(`${name}-bits`);
    const digits = Array.from({ length: width }, () => {
      const digit = document.createElement('span');
      digit.setAttribute('aria-hidden', 'true');
      bits.append(digit);
      return digit;
    });
    return { name, width, bits, digits };
  });

  function revealAddress(address) {
    const cell = cells[address].cell.getBoundingClientRect();
    const frame = scroll.getBoundingClientRect();
    if (cell.left < frame.left || cell.right > frame.right) {
      scroll.scrollTo({ left: scroll.scrollLeft + cell.left - frame.left - (frame.width - cell.width) / 2, behavior: 'instant' });
    }
  }

  function render() {
    const state = states[step];
    const command = COMMANDS[step - 1];
    const isTransfer = command?.kind === 'read' || command?.kind === 'write';
    for (const { name, width, bits, digits } of registers) {
      field(name).textContent = hex(state[name]);
      const binary = state[name].toString(2).padStart(width, '0');
      bits.setAttribute('aria-label', `${name === 'address' ? 'Adresse' : name.toUpperCase()} en binaire : ${binary}`);
      digits.forEach((digit, index) => {
        digit.textContent = binary[index];
        digit.dataset.on = String(binary[index] === '1');
      });
      if (name !== 'address') field(`${name}-decimal`).textContent = `${state[name]} en décimal`;
      field(`register-${name}`).dataset.active = String(name === 'address'
        ? isTransfer
        : command?.register === name || (command?.kind === 'add' && name === 'a'));
    }
    cells.forEach(({ cell, heading, value, transfer }, address) => {
      value.textContent = hex(state.memory[address]).slice(2);
      cell.dataset.selected = String(address === state.address);
      heading.dataset.selected = cell.dataset.selected;
      cell.dataset.modified = String(state.memory[address] !== INITIAL_BYTES[address]);
      transfer.textContent = isTransfer && address === state.address ? (command.kind === 'read' ? 'LU' : 'ÉCRIT') : '';
    });
    program.forEach((item, index) => {
      const done = index < step;
      item.dataset.done = String(done);
      if (index + 1 === step) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
      item.querySelector('.machine-step-state').textContent = done ? 'Exécutée' : 'À venir';
    });

    const beforeAddition = states[2];
    field('alu').dataset.active = String(command?.kind === 'add');
    field('calculation').textContent = step < 2 ? 'A + B → A'
      : `${hex(beforeAddition.a)} + ${hex(beforeAddition.b)} ${step === 2 ? '→ ?' : `= ${hex(states[3].a)}`}`;
    field('calculation-decimal').textContent = step < 2 ? 'Le résultat sera placé dans A.'
      : `${beforeAddition.a} + ${beforeAddition.b} = ${step === 2 ? '?' : states[3].a} en décimal`;
    field('calculation-hint').textContent = step < 2 ? 'Chargez A et B avant l’addition.'
      : step === 2 ? 'Quel résultat va entrer dans A ?'
        : '76 tient sur 8 bits. B reste inchangé.';

    let source = 'Mémoire';
    let target = 'registres';
    let value = '—';
    let label = 'EN ATTENTE';
    let observation = 'A et B valent zéro. Commencez par copier le contenu de la case 0x0A dans A.';
    if (command?.kind === 'read') {
      source = `Mémoire[${hex(state.address)}]`;
      target = `registre ${command.register.toUpperCase()}`;
      value = hex(state[command.register]);
      label = 'LECTURE · COPIE';
      observation = `${value} est copié dans ${command.register.toUpperCase()}. La case ${hex(state.address)} conserve ${value} : lire ne vide pas la mémoire.`;
    } else if (command?.kind === 'add') {
      source = 'A + B, via l’unité de calcul';
      target = 'registre A';
      value = hex(state.a);
      label = 'CALCUL · REGISTRES';
      observation = `60 + 16 = 76, soit ${value}. A reçoit la somme, B reste à ${hex(state.b)}. Aucun octet de mémoire n’a changé ; la case 0x0C contient encore 0x18.`;
    } else if (command?.kind === 'write') {
      source = 'Registre A';
      target = `mémoire[${hex(state.address)}]`;
      value = hex(state.a);
      label = 'ÉCRITURE · COPIE';
      observation = `La case ${hex(state.address)} passe de ${hex(INITIAL_BYTES[state.address])} à ${value}. Les quinze autres octets restent inchangés. A conserve ${value} : stocker copie aussi la donnée.`;
    }
    field('transfer').dataset.active = String(step > 0);
    field('transfer-label').textContent = label;
    field('transfer-source').textContent = source;
    field('transfer-target').textContent = target;
    field('transfer-value').textContent = value;
    field('step-title').textContent = command ? `Étape ${step} / 4 · ${command.title}` : 'Prêt · aucune commande exécutée';
    field('observation').textContent = observation;
    field('progress').textContent = `${step} / ${COMMANDS.length}`;
    field('next-hint').textContent = step < COMMANDS.length ? `À suivre : ${COMMANDS[step].title.toLowerCase()}` : 'Séquence terminée';
    const focusedControl = document.activeElement;
    previous.disabled = step === 0;
    next.disabled = step === COMMANDS.length;
    // Conserver un focus utilisable lorsqu’on atteint une extrémité au clavier.
    if (next.disabled && focusedControl === next) previous.focus({ preventScroll: true });
    if (previous.disabled && focusedControl === previous) next.focus({ preventScroll: true });
    revealAddress(state.address);
    onStatusChange(getStatus());
  }

  next.addEventListener('click', () => {
    if (step === COMMANDS.length) return;
    step++;
    if (step === COMMANDS.length) completed = true;
    render();
  });
  previous.addEventListener('click', () => {
    if (step === 0) return;
    step--;
    render();
  });
  reset.addEventListener('click', () => {
    step = 0;
    completed = false;
    challenge.reset();
    render();
  });

  render();
  reset.disabled = false;
  return { getStatus };
}
