// @flow

'use strict';

const fs = require('fs');

import type {Word} from './DataTypes.js';

type WithID<T> = {
  id: string,
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
    this.collection.push({id, data: saved});
    fs.writeFile(
      this.path,
      JSON.stringify(this.collection),
      (err: ?Error) => {
        if (err) {
          console.info(err.message);
          fail(err);
          return;
        }
        done({id: `${id}`, data: saved});
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
        done({id: `${id}`, data: saved});
      },
    );
  }

  getAll(): Array<WithID<T>> {
    return [...this.collection];
  }

  geByID(id: string): ?T {
    const withID = this.collection.find(entry => entry.id === id);
    if (!withID) {
      return null;
    }

    return {...withID.data};
  }
}

module.exports = DB;
