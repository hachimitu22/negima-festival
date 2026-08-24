/**
 * 時刻を表示する。
 * @param {*} submitInput 
 * @param {*} snapshot 
 * @returns 
 */
function createClockView(submitInput, { clock }) {
  const elm = document.createElement('div');

  const heading = document.createElement('h2');
  heading.textContent = '時刻';
  elm.appendChild(heading);

  const p = document.createElement('p');
  p.textContent = clock;
  elm.appendChild(p);

  return elm;
}

export default createClockView;
