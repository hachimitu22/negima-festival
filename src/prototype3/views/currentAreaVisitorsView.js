import INPUT_IDS from "../inputIds.js";

/**
 * 滞在者を表示する
 * @param {*} submitInput 
 * @param {*} snapshot 
 * @returns 
 */
function createCurrentAreaVisitorsView(submitInput, { player, NPCs, dialogue }) {
  const elm = document.createElement('div');

  const heading = document.createElement('h2');
  heading.textContent = '滞在者';
  elm.appendChild(heading);

  const visitors = NPCs.filter(NPC => player.areaId === NPC.areaId)
  const visitorElms = visitors.map(NPC => {
    const elm = document.createElement('div');

    // 名前
    const text = document.createElement('span');
    text.textContent = NPC.name;
    elm.appendChild(text);

    // 会話ボタン
    if (NPC.hasTalk) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '話す';
      button.disabled = !!dialogue;
      button.addEventListener('click', () => {
        submitInput({ inputId: INPUT_IDS.ACTOR.TALK_START, params: { actorId: NPC.id } });
      });
      elm.appendChild(button);
    }

    return elm;
  });
  elm.append(...visitorElms);

  return elm;
}

export default createCurrentAreaVisitorsView;
