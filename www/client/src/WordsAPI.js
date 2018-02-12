// @flow

import type {Word} from './../../src/DataTypes.js';
import type {WithID} from './../../src/DB.js';

const {
  SearchSuccessAction,
  SearchFailedAction,
} = require('./Actions.js');

const Wait = require('./Wait.js');

const {Action} = require('./EventCycle.js');
const {debounce} = require('./Utils.js');

type Handler<T> = {
  done: (data: Array<WithID<T>>) => mixed,
  error: (e: Error) => mixed,
};

const clientEnv = require('./client-env.json');

function post(endpoint: string, data: Object): Promise<*> {
  return fetch(
    `${clientEnv.api_url}/${endpoint}`,
    {
      method: 'POST',
      headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
     },
      body: JSON.stringify(data),
    },
  ).then((resp) => resp.json());
}

function get(endpoint: string, opts: {[keys: string]: string} = {}): Promise<*> {
  return fetch(
    `${clientEnv.api_url}/${endpoint}`,
    {method: 'GET', mode: 'cors', ...opts},
  ).then((resp) => {
    return resp.json();
  });
}

function getWords({done, error}: Handler<Word>) {
  get('words').then(
    json => done(json),
    err => error(err),
  );
}

function postWord(data: {word: string, context: string}): Promise<WithID<Word>> {
  return post('word', data);
}


function search(word: string, dispatch: (action: Action) => void): void {
  Wait(get(`search/${word}`))
    .then(entry => {
      if (entry.error) {
        dispatch(new SearchFailedAction(word, entry.message));
        return;
      }
      dispatch(new SearchSuccessAction(entry));
    })
    .catch(text => console.log(text));
}

const WordsAPI = {
  getWords,
  postWord,
  search: debounce(search),
}

module.exports = WordsAPI;
