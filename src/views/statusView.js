import { ACTION_TYPES } from '../actions.js';

function createStatusView() {
  let elements = null;
  let dispatch = null;

  function mount(rootElement, options) {
    dispatch = options.dispatch;
    elements = {
      gameTime: rootElement.querySelector('#game-time'),
      loopCount: rootElement.querySelector('#loop-count'),
      festivalState: rootElement.querySelector('#festival-state'),
      cassiopeia: rootElement.querySelector('#cassiopeia'),
    };

    elements.cassiopeia.addEventListener('click', handleCassiopeiaClick);
  }

  function init(snapshot) {
    renderStatus(snapshot);
  }

  function update(snapshot) {
    renderStatus(snapshot);
  }

  function renderStatus(snapshot) {
    elements.gameTime.textContent = `麻帆良祭 ${formatGameTime(snapshot.gameTime.currentHours)} / ${snapshot.gameTime.durationHours}:00`;
    elements.loopCount.textContent = `${snapshot.loop.count}周目`;
    elements.festivalState.textContent = snapshot.gameTime.isEnded
      ? 'フェス終了'
      : 'フェス進行中';
    elements.cassiopeia.textContent = `カシオペアを使う (${snapshot.loop.timeTravelHours}時間戻る)`;
  }

  function destroy() {
    if (!elements) {
      return;
    }

    elements.cassiopeia.removeEventListener('click', handleCassiopeiaClick);
    elements = null;
    dispatch = null;
  }

  function handleCassiopeiaClick() {
    dispatch({
      type: ACTION_TYPES.CASSIOPEIA_USE,
    });
  }

  return {
    destroy,
    init,
    mount,
    update,
  };
}

function formatGameTime(currentHours) {
  const totalMinutes = Math.floor(currentHours * 60);
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export {
  createStatusView,
};
