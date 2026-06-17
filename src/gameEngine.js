let gameEngine = null;
let gameRunner = null;

function createGameEngine(currentScene) {
  return {
    frame: {
      beforeTime: null,
      deltaTime: 0,
      count: 0,
      targetFrameTimeMs: 1000 / 60,
    },
    currentScene,
    inputQueue: [],
  };
}

function initializeGameEngine({ initialScene }) {
  gameEngine = createGameEngine(initialScene);
  return gameEngine;
}

function getGameEngine() {
  if (!gameEngine) {
    throw new Error('Game engine is not initialized.');
  }

  return gameEngine;
}

function resetGameEngine() {
  stopGameEngine();
  gameEngine = null;
}

function startGameEngine({ rootElement, initialScene, view }) {
  if (typeof requestAnimationFrame !== 'function') {
    throw new Error('requestAnimationFrame is not available.');
  }

  if (gameRunner) {
    stopGameEngine();
  }

  initializeGameEngine({
    initialScene,
  });

  view.mount(rootElement, {
    enqueueInput: input => {
      enqueueInput(input);
    },
  });
  view.init(createGameSnapshot());

  gameRunner = {
    view,
    isRunning: true,
    requestId: null,
  };

  function runFrame(now) {
    if (!gameRunner || !gameRunner.isRunning) {
      return;
    }

    updateGameEngine(now);
    view.render(createGameSnapshot());
    gameRunner.requestId = requestAnimationFrame(runFrame);
  }

  gameRunner.requestId = requestAnimationFrame(runFrame);
}

function stopGameEngine() {
  if (!gameRunner) {
    return;
  }

  gameRunner.isRunning = false;
  if (
    typeof cancelAnimationFrame === 'function'
    && gameRunner.requestId !== null
  ) {
    cancelAnimationFrame(gameRunner.requestId);
  }

  if (gameRunner.view && typeof gameRunner.view.destroy === 'function') {
    gameRunner.view.destroy();
  }

  gameRunner = null;
}

function enqueueInput(input) {
  const engine = getGameEngine();
  engine.inputQueue.push(input);
}

function updateGameEngine(now) {
  const engine = getGameEngine();
  updateFrame(engine, now);
  const inputs = drainInputQueue(engine);

  if (!engine.currentScene || typeof engine.currentScene.update !== 'function') {
    return;
  }

  const context = createUpdateContext(engine.frame);
  context.inputs = inputs;
  engine.currentScene.update(context);
}

function createUpdateContext(frame) {
  return {
    deltaFrames: frame.deltaTime / frame.targetFrameTimeMs,
    deltaTimeMs: frame.deltaTime,
    frameCount: frame.count,
    targetFrameTimeMs: frame.targetFrameTimeMs,
    inputs: [],
  };
}

function drainInputQueue(engine) {
  const inputs = engine.inputQueue;
  engine.inputQueue = [];
  return inputs;
}

function updateFrame(engine, now) {
  const frame = engine.frame;
  if (frame.beforeTime === null) {
    frame.beforeTime = now;
  }

  frame.deltaTime = now - frame.beforeTime;
  frame.beforeTime = now;
  frame.count += 1;
}

function createSceneSnapshot() {
  const engine = getGameEngine();
  if (!engine.currentScene || typeof engine.currentScene.createSnapshot !== 'function') {
    return {};
  }

  return engine.currentScene.createSnapshot();
}

function createGameSnapshot() {
  return createSceneSnapshot();
}

export {
  createGameSnapshot,
  createSceneSnapshot,
  enqueueInput,
  getGameEngine,
  resetGameEngine,
  startGameEngine,
  stopGameEngine,
  updateGameEngine,
};
