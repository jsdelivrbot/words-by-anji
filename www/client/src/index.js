// @flow

import type {Word} from './../../src/DataTypes.js';
import type {WithID} from './../../src/DB.js';
import type {InputState} from './Input.js';

const WordsAPI = require('./WordsAPI.js');
const Entry = require('./Entry.js');
const Input = require('./Input.js');
const LoadObject = require('./LoadObject.js');
const {EventCycle, Action} = require('./EventCycle.js');

const preloadedWords = document.getElementById('preloaded');
const {
  ChangeInputStateAction,
  SaveNewWordAction,
  ReceiveNewWordAction,
} = require('./Actions.js');

type State = {
  input: InputState,
  typeaheadCache: {
    [key: string]: LoadObject<Word>,
  },
  entries: Array<WithID<Word>>,
};

function renderWords(words) {
  const entries: any = document.getElementById('entries');
  const input: any = document.getElementById('input-entry');

  const dispatch = action => cycle.dispatch(action);

  const cycle: EventCycle<State> = new EventCycle({
    state: {
      input: {
        state: 'collapsed',
      },
      typeaheadCache: {},
      entries: words,
    },
    render: (prev, state) => {
      input.innerHTML = '';
      input.append(Input({
        input: state.input,
        typeaheadCache: state.typeaheadCache,
        dispatch,
      }));

      if (prev && prev.entries === state.entries) {
        return;
      }

      entries.innerHTML = '';
      const wordEntries = state.entries.map((word, idx) =>
        Entry.render({
          index: words.length - idx,
          entry: word,
        }),
      );
      entries.append(...wordEntries);
    },
  });

  cycle.register((action, state) => {
    console.log(action, state);
    if (action instanceof ChangeInputStateAction) {
      return {
        ...state,
        input: action.state === 'collapsed'
          ? {state : 'collapsed'}
          : {
            state : 'visible',
            word: null,
            context: null,
            password: null,
          },
      };
    }

    if (action instanceof SaveNewWordAction) {
      if (action.data.password !== 'spicy coconut') {
        return state;
      }

      WordsAPI.postWord(action.data).then(
        word => cycle.dispatch(new ReceiveNewWordAction(word))
      );
    }

    if (action instanceof ReceiveNewWordAction) {
      return {
        ...state,
        input: {
          state: 'collapsed',
        },
        entries: [
          action.word,
          ...state.entries,
        ],
      };
    }
    return state;
  });
}


if(!preloadedWords || !preloadedWords.innerHTML) {
  require('./WordsAPI.js').getWords({
    done: renderWords,
    error: (err) => console.log(err.message),
  });
} else {
  renderWords(JSON.parse(preloadedWords.innerHTML));
}
