class GameObject {
  constructor() {
  }

  update(context) {
    throw new Error('GameObject subclasses must implement update(context).');
  }
}

export {
  GameObject,
};
