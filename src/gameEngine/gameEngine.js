function createInitialFrame() {
  return {
    beforeTime: null,
    deltaTime: 0,
    count: 0,
    targetFrameTimeMs: 1000 / 60,
  };
}

class GameEngine {
  constructor({ initialScene, view }) {
    this.sceneStack = [];
    this.currentScene = null;
    this.frame = createInitialFrame();
    this.inputQueue = [];
    this.isRunning = false;
    this.view = view;
    this.sceneControl = Object.freeze({
      pushScene: scene => this.pushScene(scene),
      popScene: () => this.popScene(),
    });

    this.pushScene(initialScene);

    if (this.view && typeof this.view.configure === 'function') {
      this.view.configure({
        enqueueInput: input => this.enqueueInput(input),
      });
    }
  }

  start() {
    this.view.init(this.createSnapshot());
    this.isRunning = true;
  }

  stop() {
    this.isRunning = false;

    if (this.view && typeof this.view.destroy === 'function') {
      this.view.destroy();
    }

    this.view = null;
  }

  enqueueInput(input) {
    this.inputQueue.push(input);
  }

  pushScene(scene) {
    if (!scene) {
      throw new TypeError('Scene is required.');
    }

    this.sceneStack.push(scene);
    this.currentScene = scene;
    return scene;
  }

  popScene() {
    if (this.sceneStack.length <= 1) {
      return null;
    }

    const poppedScene = this.sceneStack.pop();
    this.currentScene = this.sceneStack[this.sceneStack.length - 1];
    return poppedScene;
  }

  update(now) {
    if (!this.isRunning) {
      return;
    }

    this.updateScene(now);
    this.renderView();
  }

  updateScene(now) {
    this.updateFrame(now);
    const inputs = this.drainInputQueue();

    if (!this.currentScene || typeof this.currentScene.update !== 'function') {
      return;
    }

    const context = this.createUpdateContext();
    context.inputs = inputs;
    this.currentScene.update({
      context,
      sceneControl: this.sceneControl,
    });
  }

  renderView() {
    if (this.view && typeof this.view.render === 'function') {
      this.view.render(this.createSnapshot());
    }
  }

  createUpdateContext() {
    return {
      deltaFrames: this.frame.deltaTime / this.frame.targetFrameTimeMs,
      deltaTimeMs: this.frame.deltaTime,
      frameCount: this.frame.count,
      targetFrameTimeMs: this.frame.targetFrameTimeMs,
      inputs: [],
    };
  }

  drainInputQueue() {
    const inputs = this.inputQueue;
    this.inputQueue = [];
    return inputs;
  }

  updateFrame(now) {
    if (this.frame.beforeTime === null) {
      this.frame.beforeTime = now;
    }

    this.frame.deltaTime = now - this.frame.beforeTime;
    this.frame.beforeTime = now;
    this.frame.count += 1;
  }

  createSnapshot() {
    if (!this.currentScene || typeof this.currentScene.createSnapshot !== 'function') {
      return {};
    }

    return this.currentScene.createSnapshot();
  }
}

export {
  GameEngine,
};
