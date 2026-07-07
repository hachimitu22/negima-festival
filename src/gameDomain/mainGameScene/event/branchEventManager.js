import { createNoticeBoardEvent } from './noticeBoardEvent.js';

/**
 * メインゲームシーンと実行中の分岐イベントを接続する管理クラス。
 *
 * @public
 */
class BranchEventManager {
  #character;
  #eventIdSequence;
  #activeEvent;
  #currentHours;

  /**
   * 分岐イベント管理を初期化する。
   *
   * @public
   * @param {Object} config - 管理対象の設定。
   * @param {Character} config.character - 現在地を持つプレイヤーキャラクター。
   * @param {EventIdSequence} config.eventIdSequence - イベントID採番器。
   */
  constructor({ character, eventIdSequence }) {
    this.#character = character;
    this.#eventIdSequence = eventIdSequence;
    this.#currentHours = 0;
    this.#activeEvent = this.#createEvent(this.#currentHours);
  }

  /**
   * ゲーム時刻を進め、実行中の分岐イベントへ期限判定を通知する。
   *
   * @public
   * @param {number} currentHours - 現在のゲーム時刻。
   * @returns {boolean} 時間経過によって分岐が進んだ場合はtrue。
   */
  advanceTo(currentHours) {
    this.#currentHours = currentHours;
    if (!this.#activeEvent) {
      return false;
    }

    const didAdvance = this.#activeEvent.advanceTo(currentHours);
    this.#clearCompletedEvent();
    return didAdvance;
  }

  /**
   * プレイヤーの現在地を実行中の分岐イベントへ訪問先として通知する。
   *
   * @public
   * @returns {boolean} 訪問によって分岐が進んだ場合はtrue。
   */
  visitCurrentLocation() {
    if (!this.#activeEvent) {
      return false;
    }

    const didVisit = this.#activeEvent.visitLocation(
      this.#character.locationId,
      this.#currentHours,
    );
    this.#clearCompletedEvent();
    return didVisit;
  }

  /**
   * 時間巻き戻しに伴い、実行中の分岐イベントを破棄する。
   *
   * @public
   * @param {number} currentHours - 巻き戻し後のゲーム時刻。
   * @returns {void}
   */
  rewindTo(currentHours) {
    this.#currentHours = currentHours;
    this.#activeEvent = null;
  }

  /**
   * 実行中の分岐イベントsnapshotを返す。
   *
   * @public
   * @returns {Object|null} 実行中イベントsnapshot。未実行時はnull。
   */
  getExecutingEventSnapshot() {
    return this.#activeEvent?.getSnapshot(this.#currentHours) ?? null;
  }

  /**
   * 完了済みの分岐イベントを実行中イベントから取り除く。
   *
   * @private
   * @returns {void}
   */
  #clearCompletedEvent() {
    if (this.#activeEvent?.isCompleted()) {
      this.#activeEvent = null;
    }
  }

  /**
   * 管理対象として開始する分岐イベントを生成する。
   *
   * @private
   * @param {number} startHours - イベント開始時刻。
   * @returns {BranchEvent} 生成した分岐イベント。
   */
  #createEvent(startHours) {
    return createNoticeBoardEvent(this.#eventIdSequence.next(), {
      currentLocationId: this.#character.locationId,
      startHours,
    });
  }
}

export {
  BranchEventManager,
};
