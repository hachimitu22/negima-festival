import { INPUT_TYPES, SCENE_IDS, TARGET_PREFIXES } from '../gameDomain/actions.js';

/**
 * ステータスビューを作成。ゲーム時間、MP、與件などを表示。
 * @public
 * @returns {Object} ステータスビュー APIオブジェクト
 */
function createStatusView() {
  let root = null;
  let elements = null;
  let enqueueInput = null;

  function mount(rootElement, options) {
    enqueueInput = options.enqueueInput;
    root = document.createElement('section');
    root.id = 'status';

    elements = {
      gameTime: createParagraph('game-time'),
      loopCount: createParagraph('loop-count'),
      location: createParagraph('location'),
      companion: createParagraph('companion'),
      magicPower: createParagraph('magic-power'),
      mahoPayPoints: createParagraph('maho-pay-points'),
      festivalState: createParagraph('festival-state'),
      cassiopeia: createButton('cassiopeia', 'カシオペアを使う'),
    };

    root.append(
      elements.gameTime,
      elements.loopCount,
      elements.location,
      elements.companion,
      elements.magicPower,
      elements.mahoPayPoints,
      elements.festivalState,
      elements.cassiopeia,
    );
    rootElement.appendChild(root);
    elements.cassiopeia.addEventListener('click', handleCassiopeiaClick);
  }

  function init(snapshot) {
    renderStatus(snapshot);
  }

  function update(snapshot) {
    renderStatus(snapshot);
  }

  function renderStatus(snapshot) {
    const isConversationActive = snapshot.sceneId === SCENE_IDS.CONVERSATION;

    elements.gameTime.textContent = `麻帆良祭 ${formatGameTime(snapshot.gameTime.currentHours)} / ${snapshot.gameTime.durationHours}:00`;
    elements.loopCount.textContent = `${snapshot.loop.count}周目`;
    elements.location.textContent = `現在地: ${snapshot.character.location.name}`;
    elements.companion.textContent = snapshot.companion
      ? `同伴者: ${snapshot.companion.name}`
      : '';
    elements.magicPower.textContent = `MP ${formatMagicPower(snapshot.character.magicPower.current)} / ${snapshot.character.magicPower.max}`;
    elements.mahoPayPoints.textContent = `MahoPay ${snapshot.character.mahoPayPoints}ポイント`;
    elements.festivalState.textContent = snapshot.gameTime.isEnded
      ? 'フェス終了'
      : 'フェス進行中';
    elements.cassiopeia.textContent = `カシオペアを使う (${snapshot.loop.timeTravelHours}時間戻る / MP ${snapshot.loop.cassiopeiaMagicPowerCost})`;
    elements.cassiopeia.disabled = isConversationActive
      || snapshot.character.magicPower.current < snapshot.loop.cassiopeiaMagicPowerCost;

    elements.loopCount.hidden = isConversationActive;
    elements.location.hidden = isConversationActive;
    elements.companion.hidden = !snapshot.companion;
    elements.festivalState.hidden = isConversationActive;
    elements.cassiopeia.hidden = isConversationActive;
  }

  function destroy() {
    if (!elements) {
      return;
    }

    elements.cassiopeia.removeEventListener('click', handleCassiopeiaClick);
    root.remove();
    root = null;
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

function createParagraph(id) {
  const paragraph = document.createElement('p');
  paragraph.id = id;
  return paragraph;
}

function createButton(id, textContent) {
  const button = document.createElement('button');
  button.id = id;
  button.type = 'button';
  button.textContent = textContent;
  return button;
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
