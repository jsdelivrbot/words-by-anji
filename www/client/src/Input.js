// @flow

const {card} = require('./Entry.js');
const {Action} = require('./EventCycle.js');

const {
  ChangeInputStateAction,
  SaveNewWordAction,
} = require('./Actions.js');
const {nullthrows} = require('./Utils.js');

export type InputState = {|
  state: 'collapsed',
|} | {|
  state: 'visible',
  word: ?string,
  context: ?string,
  password: ?string,
|};

function plus() {
  return `
    <div class='card-container'>
      <div class='add-new-entry'>+<div class='entry-floater'></div></div>
    </div>
  `;
}

function wrap(tag: string, children: string) {
  return `
    <${tag}>${children}</${tag}>
  `;
}

function input(props: {type: string, value: ?string}) {
  const value = props.value ? `value='${props.value}'` : '';
  return `
    <input
      ${value}
      class='${props.type}'
      type='text'
      placeholder='${props.type}'>
  `;
}

function spinner() {
  return '';
}

function buildGetter(parent) {
  return (selector, field) => nullthrows(
    (parent.querySelector(selector): any)
  )[field];
}

function Input(config: {
  input: InputState,
  dispatch: (action: Action) => void,
}) {
  const div = document.createElement('div');
  const inputState = config.input;
  div.innerHTML = inputState.state === 'visible'
    ? card({
      spelling: spinner(),
      word: wrap(
        'div',
        input({type: 'word', value: inputState.word}),
      ),
      context: wrap(
        'div',
        input({type: 'context', value: inputState.context}),
      ),
      definition: spinner(),
      example: spinner(),
      audio: '',
      controls: `
        <div class='card-controls'>
          ${input({type: 'password', value: inputState.password})}
          <button class='btn save-btn'>Save</button>
          <button class='btn discard-btn'>Discard</button>
        </div>`,
    })
    : plus();

  if (config.input.state === 'collapsed') {
    div.onclick = () => {
      config.dispatch(new ChangeInputStateAction('visible'));
    };
  } else {
    const getter = buildGetter(div)

    nullthrows(div.querySelector('.save-btn')).onclick = (event) => {
      config.dispatch(new SaveNewWordAction({
        word: getter('.word', 'value'),
        context: getter('.context', 'value'),
        password: getter('.password', 'value'),
      }));
      event.preventDefault();
    };

    nullthrows(div.querySelector('.discard-btn')).onclick = (event) => {
      config.dispatch(new ChangeInputStateAction('collapsed'));
      event.preventDefault();
    };
  }

  return div;
}

module.exports = Input;
