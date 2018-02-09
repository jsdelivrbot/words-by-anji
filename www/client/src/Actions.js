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

class ChangeInputStateAction extends Action {
  state: 'collapsed' | 'visible';
  constructor(state: 'collapsed' | 'visible') {
    super('ChangeInputState');
    this.state = state;
  }
}

class ReceiveNewWordAction extends Action {
  word: WithID<Word>;
  constructor (word: WithID<Word>) {
    super('ReceiveNewWord');
    this.word = word;
  }
}


module.exports = {
  ChangeInputStateAction,
  SaveNewWordAction,
  ReceiveNewWordAction,
};
