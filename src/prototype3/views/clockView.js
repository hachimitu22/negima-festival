import INPUT_IDS from '../inputIds.js';

/**
 * 時刻を表示する。
 * @param {Function} submitInput - 入力送信関数。
 * @param {Object} snapshot - SceneSnapshot。
 * @returns {HTMLElement} 時刻表示。
 */
function createClockView(submitInput, { clock, canRewindTime }) {
  const elm = document.createElement('div');

  const heading = document.createElement('h2');
  heading.textContent = '時刻';
  elm.appendChild(heading);

  const p = document.createElement('p');
  p.textContent = clock;
  elm.appendChild(p);

  const rewindButton = document.createElement('button');
  rewindButton.type = 'button';
  rewindButton.textContent = '10:00に戻す';
  rewindButton.disabled = !canRewindTime;
  rewindButton.addEventListener('click', () => {
    submitInput({ inputId: INPUT_IDS.CASSIOPEIA.REWIND });
  });
  elm.appendChild(rewindButton);

  return elm;
}

export default createClockView;
