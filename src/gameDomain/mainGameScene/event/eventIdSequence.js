/**
 * イベント ID を部位ごとに次次発行し賛持。
 * @public
 */
class EventIdSequence {
  /**
   * 次次 ID を初期化してインスタンス化。
   * @public
   */
  constructor() {
    this.#nextId = 0;
  }

  /**
   * 次の ID を確認（生成不可）。
   * @public
   * @returns {number} 次の ID
   */
  peek() {
    return this.#nextId;
  }

  /**
   * ID を実陸し次の ID を観。
   * @public
   * @returns {number} 論理 ID
   */
  next() {
    const id = this.#nextId;
    this.#nextId += 1;
    return id;
  }
}

export {
  EventIdSequence,
};
