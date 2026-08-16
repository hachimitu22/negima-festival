/**
 * 滞在者を表示する
 * @param {*} submitInput 
 * @param {*} snapshot 
 * @returns 
 */
function createCurrentAreaVisitorsView(submitInput, { player, areas, NPCs }) {
  const elm = document.createElement('div');

  const heading = document.createElement('h2');
  heading.textContent = '滞在者';
  elm.appendChild(heading);

  const visitors = NPCs.filter(NPC => player.areaId === NPC.areaId)
  const visitorElms = visitors.map(NPC => {
    const text = document.createElement('p');
    text.textContent = NPC.name;
    return text;
  });
  elm.append(...visitorElms);

  return elm;
}

export default createCurrentAreaVisitorsView;
