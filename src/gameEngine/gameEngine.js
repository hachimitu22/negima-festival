let gameEngine = null;

function createGameEngine({ initialScene, view }) {
  return {
    currentScene: initialScene,
    frame: createInitialFrame(),
    inputQueue: [],
    isRunning: false,
    view,
  };
}

function createInitialFrame() {
  return {
    beforeTime: null,
    deltaTime: 0,
    count: 0,
    targetFrameTimeMs: 1000 / 60,
  };
}

function initializeGameEngine({ initialScene, view }) {
  gameEngine = createGameEngine({
    initialScene,
    view,
  });
  return gameEngine;
}

function getGameEngine() {
  if (!gameEngine || !gameEngine.currentScene) {
    throw new Error('Game engine is not initialized.');
  }

  return gameEngine;
}

function resetGameEngine() {
  stopGameEngine();
  gameEngine = null;
}

function startGameEngine({ initialScene, view }) {
  if (gameEngine?.isRunning) {
    stopGameEngine();
  }

  initializeGameEngine({
    initialScene,
    view,
  });

  view.init(createGameSnapshot());
  gameEngine.isRunning = true;
}

function stopGameEngine() {
  if (!gameEngine) {
    return;
  }

  gameEngine.isRunning = false;

  if (gameEngine.view && typeof gameEngine.view.destroy === 'function') {
    gameEngine.view.destroy();
  }

  gameEngine.view = null;
}

function enqueueInput(input) {
  const engine = getGameEngine();
  engine.inputQueue.push(input);
}

function updateGameEngine(now) {
  const engine = getGameEngine();
  if (!engine.isRunning) {
    return;
  }

  updateScene(engine, now);
  renderView(engine);
}

function updateScene(engine, now) {
  updateFrame(engine, now);
  const inputs = drainInputQueue(engine);

  if (!engine.currentScene || typeof engine.currentScene.update !== 'function') {
    return;
  }

  const context = createUpdateContext(engine.frame);
  context.inputs = inputs;
  engine.currentScene.update(context);
}

function renderView(engine) {
  if (engine.view && typeof engine.view.render === 'function') {
    engine.view.render(createGameSnapshot());
  }
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
