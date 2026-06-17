import { INPUT_TYPES, TARGET_PREFIXES } from '../actions.js';

function createStatusView() {
  let elements = null;
  let enqueueInput = null;

  function mount(rootElement, options) {
    enqueueInput = options.enqueueInput;
    elements = {
      gameTime: rootElement.querySelector('#game-time'),
      loopCount: rootElement.querySelector('#loop-count'),
      location: rootElement.querySelector('#location'),
      magicPower: rootElement.querySelector('#magic-power'),
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
    elements.location.textContent = `現在地: ${snapshot.character.location.name}`;
    elements.magicPower.textContent = `MP ${formatMagicPower(snapshot.character.magicPower.current)} / ${snapshot.character.magicPower.max}`;
    elements.festivalState.textContent = snapshot.gameTime.isEnded
      ? 'フェス終了'
      : 'フェス進行中';
    elements.cassiopeia.textContent = `カシオペアを使う (${snapshot.loop.timeTravelHours}時間戻る / MP ${snapshot.loop.cassiopeiaMagicPowerCost})`;
    elements.cassiopeia.disabled = snapshot.character.magicPower.current < snapshot.loop.cassiopeiaMagicPowerCost;
  }

  function destroy() {
    if (!elements) {
      return;
    }

    elements.cassiopeia.removeEventListener('click', handleCassiopeiaClick);
    elements = null;
    enqueueInput = null;
  }

  function handleCassiopeiaClick() {
    enqueueInput({
      type: INPUT_TYPES.TARGET_ACTIVATE,
      targetId: TARGET_PREFIXES.CASSIOPEIA,
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

function formatMagicPower(magicPower) {
  return String(Math.floor(magicPower));
}

export {
  createStatusView,
};
