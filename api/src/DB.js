// @flow

'use strict';

const fs = require('fs');

import type {Word} from './DataTypes.js';

export type WithID<T> = {
  id: string,
  ts: number,
  data: T,
};

class DB<T: Object> {
  collection: Array<WithID<T>>;
  name: string;
  path: string;

  constructor(name: string) {
    this.name = name;
    this.path = `./api/db/${name}.json`;
    // $FlowFixMe
    this.collection = JSON.parse(fs.readFileSync(this.path));
    const d = new Date();
    fs.writeFileSync(
      `./api/db/${name}-${d.toString()}.json`,
      JSON.stringify(this.collection),
    );
  }

  insert(data: T, {done, fail}: {
    done: (withID: WithID<T>) => mixed,
    fail: (error: Error) => mixed,
  }) {
    const saved = {...data};
    const id = `${this.collection.length}`;
    const entry = {
      id,
      ts: Date.now(),
      data: saved,
    }
    this.collection.push(entry);
    fs.writeFile(
      this.path,
      JSON.stringify(this.collection),
      (err: ?Error) => {
        if (err) {
          console.info(err.message);
          fail(err);
          return;
        }
        done(entry);
      },
    );
  }

  update(id: string, data: T, {done, fail}: {
    done: (withID: WithID<T>) => mixed,
    fail: (error: Error) => mixed,
  }) {
    const withID = this.collection.find(entry => entry.id === id);
    if (!withID) {
      console.log(`${id} not found`);
      fail(new Error(`${id} not found`));
      return;
    }

    const saved = {...data};
    withID.data = saved;
    fs.writeFile(
      this.path,
      JSON.stringify(this.collection),
      (err: ?Error) => {
        if (err) {
          console.info(err.message);
          fail(err);
          return;
        }
        done(withID);
      },
    );
  }

  getAll(): Array<WithID<T>> {
    return [...this.collection].sort(
      (a, b) => a.ts > b.ts ? -1 : a.ts < b.ts ? 1 : 0,
    );
  }

  geByID(id: string): ?WithID<T> {
    const withID = this.collection.find(entry => entry.id === id);
    if (!withID) {
      return null;
    }

    return {...withID};
  }
}

module.exports = DB;
