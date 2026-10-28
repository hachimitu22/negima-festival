import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import ClockDateTime from '../../src/prototype3/scenes/mainScene/clockDateTime.js';
import ClockDuration from '../../src/prototype3/scenes/mainScene/clockDuration.js';
import ClockSystem from '../../src/prototype3/scenes/mainScene/systems/clockSystem.js';
import EventSystem from '../../src/prototype3/scenes/mainScene/systems/eventSystem.js';
import DialogueSystem from '../../src/prototype3/scenes/mainScene/systems/dialogueSystem.js';
import ActorSystem from '../../src/prototype3/scenes/mainScene/systems/actorSystem.js';
import ScheduleKnowledge from '../../src/prototype3/scenes/mainScene/scheduleKnowledge.js';
import Actor from '../../src/prototype3/scenes/mainScene/actors/actor.js';
import ACTOR_IDS from '../../src/prototype3/scenes/mainScene/actors/actorIds.js';
import AREA_IDS from '../../src/prototype3/scenes/mainScene/areaIds.js';
import SYSTEM_IDS from '../../src/prototype3/scenes/mainScene/systems/systemIds.js';
import EVENT_IDS from '../../src/prototype3/scenes/mainScene/events/eventIds.js';
import { EventTriggerTypes } from '../../src/prototype3/scenes/mainScene/events/eventDataTypes.js';
import PlazaNodokaEvent from '../../src/prototype3/scenes/mainScene/events/plazaNodokaEvent.js';
import FestivalAnnouncementEvent from '../../src/prototype3/scenes/mainScene/events/festivalAnnouncement.js';

/**
 * 時計・イベント・会話の実Systemを接続する。
 * @param {Array<Object>} [events=[]] - 対象イベント定義。
 * @returns {Object} 実System、System一覧、更新コンテキスト。
 */
function createTimeChangeContext(events = []) {
  const clockSystem = new ClockSystem();
  const eventSystem = new EventSystem({ events });
  const dialogueSystem = new DialogueSystem();
  const systems = new Map([
    [SYSTEM_IDS.CLOCK, clockSystem],
    [SYSTEM_IDS.EVENT, eventSystem],
    [SYSTEM_IDS.DIALOGUE, dialogueSystem],
  ]);
  return { clockSystem, eventSystem, dialogueSystem, systems, context: { getSystem: systems.get.bind(systems) } };
}

/**
 * 10:00に始まり、1メッセージで完了するイベント定義を作る。
 * @param {ClockDuration|ClockDateTime} [timeChange] - 完了時の時間変更。
 * @returns {Object} イベント定義。
 */
function createTimedEvent(timeChange) {
  return {
    id: 'test.time-change',
    trigger: { type: EventTriggerTypes.TIME_REACHED, time: new ClockDateTime() },
    timeChange,
    dialogue: { steps: [{ type: 'message', message: { speaker: 'テスト', text: '会話' } }] },
  };
}

describe('ClockSystemの停止と再開', () => {
  test('停止要求を解除すると次のupdateで時間変更を反映する', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();
    clockSystem.setStep();

    // Act
    clockSystem.requestStop('dialogue');
    clockSystem.update(context);
    const stoppedTime = clockSystem.getDateTime();
    clockSystem.requestResume('dialogue');
    const resumedTime = clockSystem.getDateTime();
    clockSystem.update(context);

    // Assert
    assert.equal(stoppedTime.getTime(), new ClockDateTime().getTime());
    assert.equal(resumedTime.getTime(), stoppedTime.getTime());
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ min: 5 }).getTime());
  });

  test('他の要求元の停止要求が残る間は停止を維持する', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();
    clockSystem.requestStop('dialogue');
    clockSystem.requestStop('event');
    clockSystem.setStep();

    // Act
    clockSystem.requestResume('dialogue');
    clockSystem.update(context);
    const partiallyResumedTime = clockSystem.getDateTime();
    clockSystem.requestResume('event');
    clockSystem.update(context);

    // Assert
    assert.equal(partiallyResumedTime.getTime(), new ClockDateTime().getTime());
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ min: 5 }).getTime());
  });

  test('同じ要求元の重複した停止要求は一度の解除で取り消せる', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();
    clockSystem.requestStop('dialogue');
    clockSystem.requestStop('dialogue');
    clockSystem.setStep();

    // Act
    clockSystem.requestResume('dialogue');
    clockSystem.update(context);

    // Assert
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ min: 5 }).getTime());
  });

  test('未登録の要求元を解除しても他の停止要求を維持する', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();
    clockSystem.requestStop('dialogue');
    clockSystem.setStep();

    // Act
    clockSystem.requestResume('unknown');
    clockSystem.update(context);

    // Assert
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime().getTime());
  });

  test('解除済みの要求元を再度解除しても時間変更できる', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();
    clockSystem.requestStop('dialogue');
    clockSystem.requestResume('dialogue');
    clockSystem.setStep();

    // Act
    clockSystem.requestResume('dialogue');
    clockSystem.update(context);

    // Assert
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ min: 5 }).getTime());
  });

  test('cleanup後も停止要求を保持する', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();
    clockSystem.requestStop('dialogue');
    clockSystem.setStep();

    // Act
    clockSystem.cleanup();
    clockSystem.setStep();
    clockSystem.update(context);
    const stoppedTime = clockSystem.getDateTime();
    clockSystem.requestResume('dialogue');
    clockSystem.update(context);

    // Assert
    assert.equal(stoppedTime.getTime(), new ClockDateTime().getTime());
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ min: 5 }).getTime());
  });
});

describe('ClockSystemの時間変更予約', () => {
  test('時と分の予約はupdateで反映する', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();
    const initialTime = clockSystem.getDateTime().getTime();

    // Act
    clockSystem.requestTimeChange(new ClockDuration({ hour: 1, min: 30 }));
    const reservedTime = clockSystem.getDateTime().getTime();
    clockSystem.update(context);

    // Assert
    assert.equal(reservedTime, initialTime);
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ hour: 11, min: 30 }).getTime());
  });

  test('固定日時への変更を予約する', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();
    const target = new ClockDateTime({ hour: 12 });

    // Act
    clockSystem.requestTimeChange(target);
    const reservedHour = clockSystem.getDateTime().hour;
    clockSystem.update(context);

    // Assert
    assert.equal(reservedHour, 10);
    assert.equal(clockSystem.getDateTime().getTime(), target.getTime());
  });

  test('二重予約は反映前後とも拒否する', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();
    clockSystem.requestTimeChange(new ClockDuration({ min: 30 }));

    // Act
    let beforeError;
    try { clockSystem.setStep(); } catch (error) { beforeError = error; }
    clockSystem.update(context);
    const requestAgain = () => clockSystem.requestTimeChange(new ClockDateTime({ hour: 12 }));

    // Assert
    assert.equal(beforeError?.message, 'time-change-already-requested');
    assert.throws(requestAgain, /time-change-already-requested/);
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ min: 30 }).getTime());
  });

  test('cleanup後に次の予約を受け付ける', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();
    clockSystem.requestTimeChange(new ClockDuration({ min: 30 }));
    clockSystem.update(context);

    // Act
    clockSystem.cleanup();
    clockSystem.setStep();
    clockSystem.update(context);

    // Assert
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ min: 35 }).getTime());
  });

  test('同じ予約を再加算しない', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();
    clockSystem.requestTimeChange(new ClockDuration({ min: 30 }));

    // Act
    clockSystem.update(context);
    clockSystem.update(context);

    // Assert
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ min: 30 }).getTime());
  });

  test('0時間0分も予約枠を使用する', () => {
    // Arrange
    const { clockSystem, eventSystem, context } = createTimeChangeContext([createTimedEvent()]);

    // Act
    clockSystem.requestTimeChange(new ClockDuration());
    clockSystem.update(context);
    const requestAgain = () => clockSystem.setStep();

    // Assert
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime().getTime());
    assert.equal(eventSystem.createEventsSnapshot()[0].status, 'waiting');
    assert.throws(requestAgain, /time-change-already-requested/);
  });

  test('現在と同じ日時も予約枠を使用する', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();

    // Act
    clockSystem.requestTimeChange(new ClockDateTime());
    clockSystem.update(context);
    const requestAgain = () => clockSystem.setStep();

    // Assert
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime().getTime());
    assert.throws(requestAgain, /time-change-already-requested/);
  });

  test('未対応の型を拒否する', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();

    // Act
    let receivedError;
    try { clockSystem.requestTimeChange({ min: 30 }); } catch (error) { receivedError = error; }
    clockSystem.setStep();
    clockSystem.update(context);

    // Assert
    assert.ok(receivedError instanceof TypeError);
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ min: 5 }).getTime());
  });

  test('過去日時の予約を拒否する', () => {
    // Arrange
    const { clockSystem } = createTimeChangeContext();

    // Act
    const request = () => clockSystem.requestTimeChange(new ClockDateTime({ hour: 9, min: 59 }));

    // Assert
    assert.throws(request, RangeError);
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime().getTime());
  });

  test('無効な日時の予約を拒否する', () => {
    // Arrange
    const { clockSystem } = createTimeChangeContext();

    // Act
    const request = () => clockSystem.requestTimeChange(new ClockDateTime({ hour: NaN }));

    // Assert
    assert.throws(request, RangeError);
  });

  test('巻き戻しは古い予約を取り消し予約枠を維持する', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();
    clockSystem.requestTimeChange(new ClockDateTime({ hour: 11 }));
    clockSystem.update(context);
    clockSystem.cleanup();
    clockSystem.requestTimeChange(new ClockDuration({ hour: 1 }));

    // Act
    const rewound = clockSystem.rewindTo(new ClockDateTime());
    clockSystem.update(context);
    const restoredTime = clockSystem.getDateTime().getTime();
    let duplicateError;
    try { clockSystem.setStep(); } catch (error) { duplicateError = error; }
    clockSystem.cleanup();
    clockSystem.setStep();
    clockSystem.update(context);

    // Assert
    assert.equal(rewound, true);
    assert.equal(restoredTime, new ClockDateTime().getTime());
    assert.equal(duplicateError?.message, 'time-change-already-requested');
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ min: 5 }).getTime());
  });

  test('巻き戻し拒否時は予約を維持する', () => {
    // Arrange
    const { clockSystem, context } = createTimeChangeContext();
    clockSystem.requestTimeChange(new ClockDuration({ hour: 1 }));

    // Act
    const rewound = clockSystem.rewindTo(new ClockDateTime());
    clockSystem.update(context);

    // Assert
    assert.equal(rewound, false);
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ hour: 11 }).getTime());
  });
});

describe('ClockDateTime', () => {
  test('時と分を加算して日付をまたぐ', () => {
    // Arrange
    const dateTime = new ClockDateTime({ hour: 23, min: 45 });

    // Act
    const result = dateTime.add({ hour: 1, min: 30 });

    // Assert
    assert.equal(result.getTime(), new ClockDateTime({ date: 21, hour: 1, min: 15 }).getTime());
    assert.equal(dateTime.getTime(), new ClockDateTime({ hour: 23, min: 45 }).getTime());
  });
});

describe('イベント完了時の時間変更', () => {
  test('のどかイベントの終了後に1時間を反映する', () => {
    // Arrange
    const { clockSystem, eventSystem, dialogueSystem, systems, context } = createTimeChangeContext([
      PlazaNodokaEvent, FestivalAnnouncementEvent,
    ]);
    const actorSystem = new ActorSystem({ scheduleKnowledge: new ScheduleKnowledge() });
    actorSystem.addActor(new Actor({ id: ACTOR_IDS.PLAYER, areaId: AREA_IDS.PLAZA }));
    actorSystem.addActor(new Actor({ id: ACTOR_IDS.NODOKA, areaId: AREA_IDS.PLAZA }));
    systems.set(SYSTEM_IDS.ACTOR, actorSystem);
    eventSystem.onActorAreaMoved({ actorId: ACTOR_IDS.PLAYER, areaId: AREA_IDS.PLAZA }, context);

    // Act
    dialogueSystem.next({}, context);
    dialogueSystem.next({}, context);
    dialogueSystem.next({}, context);
    dialogueSystem.choice({ choiceId: 'together-tour-festival' }, context);
    dialogueSystem.next({}, context);
    dialogueSystem.next({}, context);
    const completed = eventSystem.createEventsSnapshot();
    const timeBeforeUpdate = clockSystem.getDateTime().getTime();
    clockSystem.update(context);

    // Assert
    assert.equal(completed.find(event => event.id === EVENT_IDS.PLAZA_NODOKA).status, 'complete');
    assert.equal(timeBeforeUpdate, new ClockDateTime().getTime());
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ hour: 11 }).getTime());
    assert.equal(dialogueSystem.hasActiveDialogue(), false);
    assert.equal(eventSystem.createEventsSnapshot().find(event => event.id === EVENT_IDS.FESTIVAL_ANNOUNCEMENT).status, 'complete');
  });

  test('完了時に固定日時を予約する', () => {
    // Arrange
    const { clockSystem, eventSystem, dialogueSystem, context } = createTimeChangeContext([
      createTimedEvent(new ClockDateTime({ hour: 11 })),
    ]);
    eventSystem.onTimeReached({ dateTime: clockSystem.getDateTime() }, context);

    // Act
    dialogueSystem.next({}, context);
    const beforeUpdate = clockSystem.getDateTime().getTime();
    clockSystem.update(context);

    // Assert
    assert.equal(beforeUpdate, new ClockDateTime().getTime());
    assert.equal(clockSystem.getDateTime().getTime(), new ClockDateTime({ hour: 11 }).getTime());
    assert.equal(eventSystem.createEventsSnapshot()[0].status, 'complete');
  });

  test('到着日時のアナウンスは会話解放後に開始する', () => {
    // Arrange
    const { clockSystem, eventSystem, dialogueSystem, context } = createTimeChangeContext([
      createTimedEvent(new ClockDuration({ min: 15 })), FestivalAnnouncementEvent,
    ]);
    eventSystem.onTimeReached({ dateTime: clockSystem.getDateTime() }, context);

    // Act
    dialogueSystem.next({}, context);
    clockSystem.update(context);

    // Assert
    assert.deepEqual(eventSystem.createEventsSnapshot(), [
      { id: 'test.time-change', status: 'complete' },
      { id: EVENT_IDS.FESTIVAL_ANNOUNCEMENT, status: 'executing' },
    ]);
    assert.equal(dialogueSystem.createDialogueSnapshot().speaker, 'アナウンス');
  });

  test('通過前のアナウンスは待機状態を維持する', () => {
    // Arrange
    const { clockSystem, eventSystem, dialogueSystem, context } = createTimeChangeContext([FestivalAnnouncementEvent]);

    // Act
    clockSystem.setStep();
    clockSystem.update(context);

    // Assert
    assert.equal(eventSystem.createEventsSnapshot()[0].status, 'waiting');
    assert.equal(dialogueSystem.hasActiveDialogue(), false);
  });
});
