/**
 * 現在地を表示する。
 * @param {*} submitInput 
 * @param {*} snapshot 
 * @returns 
 */
function createCurrentAreaView(submitInput, { player, areas }) {
  const elm = document.createElement('div');

  const currentArea = areas.find(area => area.id === player.areaId);
  const location = document.createElement('p');
  location.textContent = `現在地: ${currentArea?.name ?? '不明'}`;
  elm.appendChild(location);

  return elm;
}

export default createCurrentAreaView;
