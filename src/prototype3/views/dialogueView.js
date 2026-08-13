import INPUT_IDS from '../inputIds.js';

/**
 * 会話表示を作成する。
 * @param {Object} dialogue - 会話snapshot。
 * @returns {void}
 */
function createDialogueView(submitInput, dialogue) {
  const elm = document.createElement('div');

  const text = document.createElement('p');
  text.textContent = `${dialogue.speaker}「${dialogue.text}」`;
  elm.appendChild(text);

  if (dialogue.choices.length > 0) {
    for (const choice of dialogue.choices) {
      const choiceButton = document.createElement('button');
      choiceButton.type = 'button';
      choiceButton.textContent = choice.text;
      choiceButton.addEventListener('click', () => {
        submitInput({ inputId: INPUT_IDS.DIALOGUE.CHOOSE, params: { choiceId: choice.id } });
      });
      elm.appendChild(choiceButton);
    }
  } else {
    const button = document.createElement('button');
    button.type = 'button';
    // button.textContent = !dialogue.isLast ? '次へ' : '会話を終える';
    button.textContent = '次へ';
    button.addEventListener('click', () => {
      submitInput({ inputId: INPUT_IDS.DIALOGUE.NEXT });
    });

    elm.appendChild(button);
  }

  return elm;
}

export default createDialogueView;
