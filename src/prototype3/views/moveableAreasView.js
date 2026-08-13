import INPUT_IDS from '../inputIds.js';

/**
 * 移動可能なエリア一覧を表示する。
 * @param {*} submitInput 
 * @param {*} moveableAreas 
 * @returns 
 */
function createMoveableAreasView(submitInput, { player, moveableAreas }) {
  const elm = document.createElement('div');

  const heading = document.createElement('h2');
  heading.textContent = '移動先';
  elm.appendChild(heading);
  for (const area of moveableAreas) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = area.name;
    button.addEventListener('click', () => {
      submitInput({ inputId: INPUT_IDS.ACTOR.AREA_MOVE, params: { actorId: player.id, areaId: area.id } });
    });
    elm.appendChild(button);
  }

  return elm;
}

export default createMoveableAreasView;
