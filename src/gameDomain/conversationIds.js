const CONVERSATION_IDS = Object.freeze({
  ASUNA_WHERE_WERE_YOU: 'asunaWhereWereYou',
  EFFORT_FEEDBACK: 'effortFeedback',
  FAREWELL: 'farewell',
  FESTIVAL_PLANS: 'festivalPlans',
  GREETING: 'greeting',
  QUESTION: 'question',
  TEACHER_CHECK_IN: 'teacherCheckIn',
});

const CONVERSATION_CHOICE_IDS = Object.freeze({
  EFFORT_FEEDBACK: Object.freeze({
    WORKED_VERY_HARD: 'worked-very-hard',
    AS_USUAL: 'as-usual',
    NEEDS_MORE_EFFORT: 'needs-more-effort',
  }),
});

export {
  CONVERSATION_CHOICE_IDS,
  CONVERSATION_IDS,
};
