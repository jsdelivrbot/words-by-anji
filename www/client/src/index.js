// @flow

import type {Word} from './../../src/DataTypes.js';
import type {WithID} from './../../src/DB.js';
import type {InputState} from './Input.js';

const WordsAPI = require('./WordsAPI.js');
const Entry = require('./Entry.js');
const Input = require('./Input.js');
const LoadObject = require('./LoadObject.js');
const Wait = require('./Wait.js');
const {EventCycle, Action} = require('./EventCycle.js');

const preloadedWords = document.getElementById('preloaded');
const {
  ChangeInputStateAction,
  SaveNewWordAction,
  ReceiveNewWordAction,
  BackupChangesAction,
  SearchSuccessAction,
  SearchFailedAction,
} = require('./Actions.js');

type State = {
  input: InputState,
  searchCache: {
    [key: string]: LoadObject<Word>,
  },
  entries: Array<WithID<Word>>,
};

let dispatch = (action: Action) => {};

function changeState(
  curr: State,
  action: ChangeInputStateAction | SaveNewWordAction | ReceiveNewWordAction | BackupChangesAction,
): InputState {
  if (action instanceof BackupChangesAction) {
    if (curr.input.state === 'collapsed') {
      return {state: 'collapsed'};
    }

    let next = {
      ...curr.input,
      ...action.data,
    };


    return next;
  }

  if (action instanceof ChangeInputStateAction) {
    const nextInputState = action.state;
    const {state, ...rest} = curr.input;
    if (nextInputState === 'collapsed') {
      return {state: 'collapsed'};
    }

    if (nextInputState === 'invalid') {
      return {
        state: 'invalid',
        ...rest,
        error: action.error,
      };
    }

    return {state: nextInputState, word: null, context: null, password: null, error: null};
  }

  if (curr.input.state === 'collapsed') {
    throw new Error('invalid state');
  }

  if (action instanceof ReceiveNewWordAction) {
    const next = {...curr.input, state: 'success'};
    setTimeout(() => dispatch(new ChangeInputStateAction('collapsed')), 2000);
    return next;
  }

  let errorMessage: ?string = null;
  if (!action.data.word) {
    errorMessage = "Don't forget to write a word";
  }

  if (!action.data.context) {
    errorMessage = "Don't miss the context this was said ;)";
  }

  if (errorMessage) {
    return {...action.data, state: 'invalid', error: errorMessage};
  }

  if (action.data.password === 'spicy coconut') {
    Wait(WordsAPI.postWord(action.data)).then(
      word => {
        if (word.id) {
          dispatch(new ReceiveNewWordAction(word))
        } else {
          dispatch(new ChangeInputStateAction('invalid', 'Word not saved'));
        }
      }
    );

    if (curr.input.state === 'visible' || curr.input.state === 'invalid') {
      return {...action.data, state: 'loading', error: null};
    }
    throw new Error('invalid state');
  }

  return {...action.data, state: 'invalid', error: 'Are you sure you are Anji?'};
}

function renderWords(words) {
  const entries: any = document.getElementById('entries');
  const input: any = document.getElementById('input-entry');
  const placeholder = {
    spelling: 'placeholder',
    definition: 'placeholder',
    example: 'definition',
  };

  dispatch = action => cycle.dispatch(action);
  const cycle: EventCycle<State> = new EventCycle({
    state: {
      input: {
        state: 'collapsed',
      },
      searchCache: {},
      entries: words,
    },
    render: (prev, state) => {
      input.innerHTML = '';
      input.append(Input({
        input: state.input,
        dispatch,
        searchCache: state.searchCache,
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

  // Input interactions
  cycle.register((action, state) => {
    if (action instanceof ChangeInputStateAction) {
      const nextActionState = action.state;
      return {
        ...state,
        input: changeState(state, action),
      };
    }

    if (action instanceof SaveNewWordAction) {
      return {
        ...state,
        input: changeState(state, action),
      };
    }
    return state;
  });

  // Server responses
  cycle.register((action, state) => {
    if (action instanceof BackupChangesAction) {
      const key = action.data.word.toLowerCase();
      if (state.searchCache[key]) {
        return state;
      }

      const searchCache = {
        ...state.searchCache,
        [key]: LoadObject.loading(),
      };

      WordsAPI.search(key, dispatch);

      return {
        ...state,
        searchCache,
      };
    }

    if (action instanceof ReceiveNewWordAction) {
      return {
        ...state,
        input: changeState(state, action),
        entries: [
          action.word,
          ...state.entries,
        ],
      };
    }

    if (action instanceof SearchSuccessAction) {
      const searchCache = state.searchCache;
      return {
        ...state,
        searchCache: {
          ...searchCache,
          [action.word.word]: LoadObject.loaded(action.word),
        }
      }
    }

    if (action instanceof SearchFailedAction) {
      const searchCache = state.searchCache;
      return {
        ...state,
        searchCache: {
          ...searchCache,
          [action.word]: LoadObject.error(new Error(action.error)),
        }
      }
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
