/**
 * 現在地を表示する。
 * @param {*} submitInput 
 * @param {*} snapshot 
 * @returns 
 */
function createEventsView(submitInput, { events }) {
  const elm = document.createElement('div');

  const label = document.createElement('h2');
  label.textContent = 'イベント一覧';
  elm.append(label);

  const elms = events.map(event => {
    const text = document.createElement('p');
    text.textContent = `ID: ${event?.id}, status: ${event?.status}`;
    return text;
  });
  if (elms.length) {
    elm.append(...elms);
  }

  return elm;
}

export default createEventsView;
