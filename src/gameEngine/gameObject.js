/**
 * ゲームオブジェクトの基底クラス。
 * 
 * すべてのゲームオブジェクト（シーンなど）はこのクラスを継承し、update メソッドを実装する必要があります。
 * @public
 */
class GameObject {
  /**
   * GameObject インスタンスを生成する。
   * 
   * @public
   * 
   * @example
   * // 通常は直接インスタンス化せず、サブクラスで使用
   * class MyGameObject extends GameObject { ... }
   */
  constructor() {
  }

  /**
   * ゲームロジックを更新する。サブクラスで実装される。
   * 
   * @public
   * @param {Object} context - 更新コンテキスト
   * @param {number} context.deltaTimeMs - フレーム間のデルタ時間（ミリ秒）
   * @param {number} context.deltaFrames - フレーム間のデルタフレーム数
   * @param {number} context.frameCount - 累積フレーム数
   * @returns {void}
   * @throws {Error} サブクラスで実装されていない場合
   * 
   * @example
   * class MyScene extends GameObject {
   *   update(context) {
   *     // ロジック処理
   *   }
   * }
   */
  update(context) {
    throw new Error('GameObject subclasses must implement update(context).');
  }
}

export {
  GameObject,
};
