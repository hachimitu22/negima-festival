/**
 * 現在地を表示する。
 * @param {*} submitInput 
 * @param {*} snapshot 
 * @returns 
 */
function createActorsView(submitInput, { actors }) {
  const elm = document.createElement('div');

  const label = document.createElement('h2');
  label.textContent = 'アクター一覧';
  elm.append(label);

  const elms = actors.map(actor => {
    const text = document.createElement('p');
    text.textContent = `ID: ${actor?.id}, areaId: ${actor?.areaId}`;
    return text;
  });
  if (elms.length) {
    elm.append(...elms);
  }

  return elm;
}

export default createActorsView;
