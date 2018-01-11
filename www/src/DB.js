// @flow

'use strict';

const env = require('../config/env.json');
const fs = require('fs');
const path = require('path');

import type {Word} from './DataTypes.js';

export type WithID<T> = {
  id: string,
  ts: number,
  data: T,
};

const PATH: string = (env.DB_PATH: any);

function getID(word: string): string {
  const hash = (Math.random() * 10000)
    .toString(20)
    .replace('.','');

  return `${word}_${hash}`;
}

function parse(buffer: Buffer): WithID<Word> {
  const raw = {};
  const content = buffer.toString();
  content.split('\n').forEach(line => {
    if (line.indexOf(':') <= 0) {
      return;
    }
    const separator = line.indexOf(':');
    const key = line.substring(0, separator).trim();
    const value = line.substring(separator + 1).trim();
    raw[key] = value;
  });

  const {id, ts, ...data} = raw;

  return {
    id,
    ts: parseInt(ts, 10),
    data: (data: any),
  };
}

function parseFile(path: string): Promise<WithID<Word>> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(parse(data));
    });
  });
}

class DB {
  insert(data: Word, {done, fail}: {
    done: (withID: WithID<Word>) => mixed,
    fail: (error: Error) => mixed,
  }): void {
    const id = getID(data.word);
    const ts = Date.now();
    const bundle = {id, ts, ...data};
    let rawString = '';
    Object.keys(bundle).forEach(key => {
      rawString = key + ' : ' + bundle[key] + '\n' + rawString;
    });
    const filename = id + '.anji';
    fs.writeFile(path.join(PATH, filename), rawString, err => {
      if (err) {
        fail(err);
        return;
      }
      done({id, ts, data});
      return;
    });
  }

  getAll(): Promise<Array<WithID<Word>>> {
    return new Promise((resolve, reject) => {
      fs.readdir(PATH, (err, files) => {
        if (err) {
          return reject(err);
        }

        const words = files
          .map(file => path.join(PATH, file))
          .filter(file => fs.statSync(file).isFile())
          .map(parseFile);

        Promise.all(words).then(
          words => {
            words.sort(
              (a, b) => a.ts > b.ts ? -1 : a.ts < b.ts ? 1 : 0,
            );
            resolve(words);
          }
        );
      });
    });
  }
}

module.exports = DB;
