import { mountChallenge } from '../widgets/challenge.js';

const hex = value => `0x${value.toString(16).toUpperCase().padStart(2, '0')}`;
const binary = value => value.toString(2).padStart(8, '0');
const svgNamespace = 'http://www.w3.org/2000/svg';

// Deux registres non signés de huit bits, sans retenue externe.
function comparisonStates(seed, direction) {
  const states = [{ shift: seed, rotate: seed }];
  for (let step = 0; step < 8; step++) {
    const { shift, rotate } = states.at(-1);
    states.push(direction === 'left'
      ? { shift: (shift << 1) & 0xFF, rotate: ((rotate << 1) | (rotate >>> 7)) & 0xFF }
      : { shift: shift >>> 1, rotate: (rotate >>> 1) | ((rotate & 1) << 7) });
  }
  return states;
}

function drawPaths(svg, kind, direction) {
  svg.replaceChildren();
  const make = (tag, attributes, parent = svg) => {
    const element = document.createElementNS(svgNamespace, tag);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    parent.append(element);
    return element;
  };
  const defs = make('defs', {});
  for (const [name, color] of [['ordinary', '#595959'], ['edge', '#842578']]) {
    const marker = make('marker', { id: `movement-${kind}-${name}`, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '6', markerHeight: '6', orient: 'auto-start-reverse' }, defs);
    make('path', { d: 'M 0 0 L 10 5 L 0 10 Z', fill: color }, marker);
  }
  const line = (d, edge = false) => make('path', {
    d, fill: 'none', stroke: edge ? '#842578' : '#595959', 'stroke-width': edge ? '2.5' : '1.5',
    'vector-effect': 'non-scaling-stroke', 'marker-end': `url(#movement-${kind}-${edge ? 'edge' : 'ordinary'})`,
  });
  for (let index = 0; index < 8; index++) {
    const destination = index + (direction === 'left' ? -1 : 1);
    if (destination >= 0 && destination < 8) line(`M ${50 + index * 100} 3 L ${50 + destination * 100} 117`);
  }
  const outgoingX = direction === 'left' ? 50 : 750;
  const incomingX = 800 - outgoingX;
  if (kind === 'rotate') {
    line(`M ${outgoingX} 3 V 55 H ${incomingX} V 117`, true);
  } else {
    line(`M ${outgoingX} 3 L ${direction === 'left' ? 8 : 792} 60`, true);
    line(`M ${incomingX} 60 V 117`, true);
    make('text', { x: incomingX, y: '43', 'text-anchor': 'middle', fill: '#842578', 'font-size': '32', 'font-family': 'Roboto Mono, monospace' }).textContent = '0';
  }
}

export function mountShiftRotate(root, { onStatusChange }) {
  const field = name => root.querySelector(`#movement-${name}`);
  const next = field('next');
  const previous = field('previous');
  const reset = field('reset');
  const directionInputs = [...root.querySelectorAll('input[name="movement-direction"]')];
  let seed = 0x80;
  let direction = 'left';
  let states = comparisonStates(seed, direction);
  let step = 0;
  let compared = false;
  let challengeCorrect = false;

  function getStatus() {
    return compared && challengeCorrect ? '26 / Notion comprise ✓' : `26 / ${step} sur 8 déplacements`;
  }

  const challenge = mountChallenge(root, {
    evaluate(answer) {
      return {
        correct: answer === 'distinct',
        message: answer === 'distinct'
          ? 'Exactement ! Le 1 de droite passe en position 1 dans les deux cas. Le décalage élimine le 1 de gauche et insère 0 : 00000010. La rotation réinjecte ce 1 à droite : 00000011.'
          : answer === 'same'
            ? 'Le décalage donne bien 00000010. Mais la rotation récupère le 1 qui sort à gauche et le réinjecte à droite : elle donne 00000011.'
            : 'Les règles sont inversées : le décalage insère un zéro, la rotation réinjecte le bit sortant. Ici, ce bit vaut 1.',
      };
    },
    onResult(correct) {
      challengeCorrect = correct === true;
      onStatusChange(getStatus());
    },
  });

  const sourceBits = Array.from({ length: 8 }, (_, index) => {
    const position = 7 - index;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'movement-source-bit';
    button.setAttribute('aria-label', `Bit de départ ${position}, poids ${2 ** position}`);
    const digit = document.createElement('span');
    digit.className = 'movement-source-digit';
    digit.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'movement-bit-position';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = String(position);
    button.append(digit, label);
    button.addEventListener('click', () => {
      seed ^= 1 << position;
      restartComparison();
    });
    field('source').append(button);
    return { button, digit, position };
  });

  const rows = [];
  for (const kind of ['shift', 'rotate']) {
    for (const moment of ['before', 'after']) {
      const row = field(`${kind}-${moment}`);
      const digits = Array.from({ length: 8 }, () => {
        const digit = document.createElement('span');
        digit.setAttribute('aria-hidden', 'true');
        row.append(digit);
        return digit;
      });
      rows.push({ kind, moment, row, digits });
    }
  }

  function restartComparison() {
    step = 0;
    states = comparisonStates(seed, direction);
    for (const kind of ['shift', 'rotate']) drawPaths(field(`${kind}-paths`), kind, direction);
    render();
  }

  function render() {
    const before = states[Math.max(0, step - 1)];
    const after = states[step];
    const outgoingIndex = direction === 'left' ? 0 : 7;
    const incomingIndex = 7 - outgoingIndex;
    const outgoing = value => direction === 'left' ? value >>> 7 : value & 1;
    sourceBits.forEach(({ button, digit, position }) => {
      const on = (seed >>> position) & 1;
      button.setAttribute('aria-pressed', String(on === 1));
      digit.textContent = String(on);
    });
    field('source-hex').textContent = hex(seed);
    field('source-decimal').textContent = `${seed} en décimal`;
    for (const { kind, moment, row, digits } of rows) {
      const value = (moment === 'before' ? before : after)[kind];
      const bits = binary(value);
      row.setAttribute('aria-label', `${moment === 'before' ? 'Avant' : 'Après'} ${kind === 'shift' ? 'décalage' : 'rotation'} : ${bits}`);
      digits.forEach((digit, index) => {
        digit.textContent = bits[index];
        digit.dataset.on = String(bits[index] === '1');
        digit.dataset.edge = String(step > 0 && index === (moment === 'before' ? outgoingIndex : incomingIndex));
      });
    }
    for (const kind of ['shift', 'rotate']) {
      field(`${kind}-hex`).textContent = hex(after[kind]);
      field(`${kind}-decimal`).textContent = `${after[kind]} en décimal`;
      field(`${kind}-out`).textContent = step ? String(outgoing(before[kind])) : '—';
      field(`${kind}-in`).textContent = step ? String(kind === 'shift' ? 0 : outgoing(before[kind])) : '—';
      field(`${kind}-paths`).dataset.visible = String(step > 0);
    }
    root.querySelector('#movement-shift .movement-operation-symbol').textContent = direction === 'left' ? '←' : '→';
    root.querySelector('#movement-rotate .movement-operation-symbol').textContent = direction === 'left' ? '↶' : '↷';
    root.querySelectorAll('[data-movement-before-label]').forEach(label => { label.textContent = step ? `AVANT LE DÉPLACEMENT ${step}` : 'AVANT · MOTIF DE DÉPART'; });
    root.querySelectorAll('[data-movement-after-label]').forEach(label => { label.textContent = step ? `APRÈS LE DÉPLACEMENT ${step}` : 'APRÈS · EN ATTENTE'; });
    const side = direction === 'left' ? 'la gauche' : 'la droite';
    field('direction-label').textContent = `Vers ${side}`;
    field('next-arrow').textContent = direction === 'left' ? '←' : '→';
    field('progress').textContent = `${step} / 8`;
    field('step-title').textContent = step === 8 ? 'Huit déplacements : un tour complet pour la rotation' : step ? `Déplacement ${step} vers ${side}` : 'Même motif, même sens';
    field('observation').textContent = step === 0
      ? `Les deux registres partent de ${binary(seed)}. Déplacez les bits vers ${side} pour comparer.`
      : step === 8
        ? `Après huit rotations, on retrouve ${binary(seed)}, le motif de départ. Après huit décalages logiques, le registre vaut 00000000 : tous les bits d’origine ont été remplacés par des zéros.`
        : `Le décalage perd le bit ${outgoing(before.shift)} et insère 0. La rotation réinjecte le bit ${outgoing(before.rotate)} à l’autre extrémité.${after.shift === after.rotate ? ' Les résultats coïncident ici, mais les règles restent différentes.' : ' Les deux résultats sont différents.'}`;
    const focused = document.activeElement;
    previous.disabled = step === 0;
    next.disabled = step === 8;
    if (next.disabled && focused === next) previous.focus({ preventScroll: true });
    if (previous.disabled && focused === previous) next.focus({ preventScroll: true });
    onStatusChange(getStatus());
  }

  directionInputs.forEach(input => input.addEventListener('change', () => {
    if (!input.checked) return;
    direction = input.value;
    restartComparison();
  }));
  next.addEventListener('click', () => {
    if (step === 8) return;
    step++;
    compared = true;
    render();
  });
  previous.addEventListener('click', () => {
    if (step === 0) return;
    step--;
    render();
  });
  reset.addEventListener('click', () => {
    seed = 0x80;
    direction = 'left';
    compared = false;
    directionInputs.forEach(input => { input.checked = input.value === direction; });
    challenge.reset();
    restartComparison();
  });

  restartComparison();
  for (const control of [reset, ...directionInputs]) control.disabled = false;
  return { getStatus };
}
