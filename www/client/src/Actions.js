// @flow

import type {Word} from './../../src/DataTypes.js';
import type {WithID} from './../../src/DB.js';

const {Action} = require('./EventCycle');

type SaveNewWordData = {
  word: string,
  context: string,
  password: string,
};

class SaveNewWordAction extends Action {
  data: SaveNewWordData;
  constructor(data: SaveNewWordData) {
    super('SaveNewWord');
    this.data = data;
  }
}

class BackupChangesAction extends SaveNewWordAction {
}

type ChangeInputState = 'collapsed' | 'visible' | 'loading' | 'invalid' | 'success';

class ChangeInputStateAction extends Action {
  state: ChangeInputState;
  error: ?string;
  constructor(state: ChangeInputState, error?: string) {
    super('ChangeInputState');
    this.state = state;
    this.error = error;
  }
}

class ReceiveNewWordAction extends Action {
  word: WithID<Word>;
  constructor (word: WithID<Word>) {
    super('ReceiveNewWord');
    this.word = word;
  }
}

class SearchSuccessAction extends Action {
  word: Word;
  constructor(word: Word) {
    super('SearchSuccessAction');
    this.word = word;
  }
}

class SearchFailedAction extends Action {
  error: string;
  word: string;
  constructor(word: string, error: string) {
    super('SearchFailedAction');
    this.word = word;
    this.error = error;
  }
}

module.exports = {
  ChangeInputStateAction,
  SaveNewWordAction,
  ReceiveNewWordAction,
  BackupChangesAction,
  SearchSuccessAction,
  SearchFailedAction,
};
