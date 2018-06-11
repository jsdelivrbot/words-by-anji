// @flow


import type {Word} from './../../src/DataTypes.js';
import type LoadObject from './LoadObject.js';

const {card} = require('./Entry.js');
const {Action} = require('./EventCycle.js');

const {
  ChangeInputStateAction,
  SaveNewWordAction,
  BackupChangesAction,
} = require('./Actions.js');
const {nullthrows} = require('./Utils.js');

export type InputState = {|
  state: 'collapsed',
|} | {|
  state: 'visible' | 'loading' | 'success' | 'invalid',
  word: ?string,
  context: ?string,
  password: ?string,
  error: ?string,
|};


function plus() {
  return `
    <div class='card-container'>
      <div class='add-new-entry'>+<div class='entry-floater'></div></div>
    </div>
  `;
}

function success() {
  return `
    <div class='card-container'>
      <div class='card-success'>\u{1F481}<div class='entry-floater'></div></div>
    </div>
  `;
}

function wrap(tag: string, attr: {[key: string]: string}, children: string) {
  const serialized_attributes = Object
    .entries(attr)
    .map(([k, v]) => `${k}="${(v: any)}""`)
    .join(' ');

  return `
    <${tag} ${serialized_attributes}>
      ${children}
    </${tag}>
  `;
}

function input(props: {type: string, value: ?string, disabled?: boolean}) {
  const value = props.value ? `value="${props.value}"` : '';
  return `
    <input
      ${value}
      class='${props.type}'
      type='text'
      ${props.disabled ? 'disabled' : ''}
      placeholder='${props.type}'>
  `;
}

function spinner() {
  return `
    <div class="loader"></div>
  `;
}

function buildGetter(parent) {
  return (selector, field) => nullthrows(
    (parent.querySelector(selector): any)
  )[field];
}

function setListener(parent) {
  return (selector, set) => {
    nullthrows(parent.querySelector(selector)).onkeyup = (e) => set(e);
  };
}

function getFeedback(
  inputState: InputState,
  searchCache: {[key: string]: LoadObject<Word>},
): {spelling: string, definition: string, example: string, audio: string} {
  const empty = {
    spelling: '',
    definition: '',
    example: '',
    audio: '',
  };

  if (inputState.state === 'collapsed') {
    return empty;
  }

  const word = (inputState.word || '').toLowerCase();

  const loadObject = searchCache[word];
  if (!loadObject) {
    return empty;
  }

  return loadObject.apply({
    loaded: word => ({
      spelling: word.spelling || '',
      definition: word.definition
        ? `<div>Definition: ${word.definition}</div>`
        : '',
      example: word.example
        ? `<div>Example: ${word.example}</div>`
        : '',
      audio: word.audio
        ? `<audio class="word-audio">
            <source src="${word.audio}" type="audio/mpeg" />
           </audio>`
        : '',
    }),
    loading: word => ({
      spelling: spinner(),
      definition: '',
      example: '',
      audio: '',
    }),
    error: error => empty,
  })
}

function Input(config: {
  input: InputState,
  dispatch: (action: Action) => void,
  searchCache: {[key: string]: LoadObject<Word>},
}) {
  const div = document.createElement('div');
  const inputState = config.input;
  if (inputState.state === 'success') {
    div.innerHTML = success();
    return div;
  }

  const feedback = getFeedback(config.input, config.searchCache);

  div.innerHTML = inputState.state !== 'collapsed'
    ? card({
      ...feedback,
      state: inputState.state === 'visible' || inputState.state === 'invalid'
        ? 'edit' : inputState.state,
      error: inputState.state === 'invalid'
        ? wrap('div', {class: 'card-error'}, nullthrows(inputState.error))
        : '',
      word: wrap(
        'div',
        {},
        input({
          type: 'word',
          value: inputState.word,
          disabled: inputState.state === 'loading',
        }),
      ),
      context: wrap(
        'div',
        {},
        input({
          type: 'context',
          value: inputState.context,
          disabled: inputState.state === 'loading'
        }),
      ),
      controls: `
        <div class='card-controls'>
          ${input({
            type: 'password',
            value: inputState.password,
            disabled: inputState.state === 'loading'
          })}
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
    const setter = setListener(div);
    const sendChanges = (e) => {
      if(e.target.value === (config.input.word || '')) {
        return;
      }
      config.dispatch(new BackupChangesAction({
        word: getter('.word', 'value'),
        context: getter('.context', 'value'),
        password: getter('.password', 'value'),
      }));
      const inputBox: any = nullthrows(document.querySelector('input.word'));
      inputBox.focus();
      const value = inputBox.value;
      inputBox.value = '';
      inputBox.value = value;
    };
    setter('.word', sendChanges);

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

    div.getElementsByClassName('audio-control')[0].onclick = () => {
      (div.getElementsByClassName('word-audio')[0]: any).play();
    };
  }

  return div;
}

module.exports = Input;
