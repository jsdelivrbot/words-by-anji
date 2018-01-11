// @flow

import type {Word} from './../../src/DataTypes.js';
import type {WithID} from './../../src/DB.js';

type Handler<T> = {
  done: (data: Array<WithID<T>>) => mixed,
  error: (e: Error) => mixed,
};

const clientEnv = require('./client-env.json');

function getWords({done, error}: Handler<Word>) {
  fetch(`${clientEnv.api_url}/words`, {method: 'GET', mode: 'cors'})
  .then(
    (resp) => resp.json().then(
      (json) => done(json),
      (err) => {
        console.log(err);
        error(err);
      },
    ),
    (err) => console.log(err),
  );
}

const WordsAPI = {
  getWords,
}

module.exports = WordsAPI;
