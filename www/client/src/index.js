// @flow

import type {Word} from './../../src/DataTypes.js';
import type {WithID} from './../../src/DB.js';
import type {InputState} from './Entry.js';

const WordsAPI = require('./WordsAPI.js');
const Entry = require('./Entry.js');
const LoadObject = require('./LoadObject.js');
const {EventCycle, Action} = require('./EventCycle.js');

const preloadedWords = document.getElementById('preloaded');

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
      input.append(Entry.renderInput({
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
    if (action.type === 'collapsed') {
      return {
        ...state,
        input: {
          state: 'visible',
        },
      };
    } else {
      return {
        ...state,
        input: {
          state: 'collapsed',
        },
      };
    }
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
