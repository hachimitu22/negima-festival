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
    const div = document.createElement('div');

    // アクターID、エリアID
    const text = document.createElement('p');
    text.textContent = `ID: ${actor?.id}, areaId: ${actor?.areaId}`;
    div.append(text);

    // スケジュール
    const schedules = actor.schedules.map((schedule, i) => {
      const p = document.createElement('p');
      p.textContent = `${i + 1}: ${schedule.dateTimeRange.from} - ${schedule.dateTimeRange.to}: ${schedule.areaId}: ${schedule.enabled ? 'enable' : 'disable'}`
      return p;
    });
    if (schedules.length > 0) {
      div.append(...schedules);
    }

    return div;
  });
  if (elms.length) {
    elm.append(...elms);
  }

  return elm;
}

export default createActorsView;
