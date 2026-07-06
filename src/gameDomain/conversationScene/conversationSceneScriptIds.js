/**
 * 会話シーン内で使用されるスクリプトIDの定義。
 * 
 * @public
 * @type {Object}
 * @property {string} ASUNA_WHERE_WERE_YOU - あすなが先生の行動先を聞くスクリプト
 * @property {string} EFFORT_FEEDBACK - 先生が生徒の頑張りを評価するスクリプト
 * @property {string} FAREWELL - 別れの言葉を交わすスクリプト
 * @property {string} FESTIVAL_PLANS - 麻帆良祭の計画について話すスクリプト
 * @property {string} GREETING - 挨拶を交わすスクリプト
 * @property {string} QUESTION - 先生に質問するスクリプト
 * @property {string} TEACHER_CHECK_IN - 先生が生徒の様子を確認するスクリプト
 */
const CONVERSATION_SCENE_SCRIPT_IDS = Object.freeze({
  ASUNA_WHERE_WERE_YOU: 'asunaWhereWereYou',
  EFFORT_FEEDBACK: 'effortFeedback',
  FAREWELL: 'farewell',
  FESTIVAL_PLANS: 'festivalPlans',
  GREETING: 'greeting',
  QUESTION: 'question',
  TEACHER_CHECK_IN: 'teacherCheckIn',
});

/**
 * 会話シーン内の選択肢IDの定義。
 * 
 * スクリプトIDをキーに、選択肢IDオブジェクトをネストさせた構造。
 * 
 * @public
 * @type {Object}
 * @property {Object} EFFORT_FEEDBACK - effortFeedback スクリプトの選択肢ID群
 * @property {string} EFFORT_FEEDBACK.WORKED_VERY_HARD - 「とてもよく頑張っていました」選択肢
 * @property {string} EFFORT_FEEDBACK.AS_USUAL - 「いつも通りでした」選択肢
 * @property {string} EFFORT_FEEDBACK.NEEDS_MORE_EFFORT - 「もう少し頑張りましょう」選択肢
 */
const CONVERSATION_SCENE_SCRIPT_CHOICE_IDS = Object.freeze({
  EFFORT_FEEDBACK: Object.freeze({
    WORKED_VERY_HARD: 'worked-very-hard',
    AS_USUAL: 'as-usual',
    NEEDS_MORE_EFFORT: 'needs-more-effort',
  }),
});

export {
  CONVERSATION_SCENE_SCRIPT_CHOICE_IDS,
  CONVERSATION_SCENE_SCRIPT_IDS,
};
