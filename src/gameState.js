function createGameState() {
  return {
    frame: {
      beforeTime: null,
      deltaTime: 0,
    },
    events: [],
    succeededEvents: [],
    failedEvents: [],
    lastEventId: 0,
    inputValues: {},
  };
}

export {
  createGameState,
};
