// @flow

'use strict';

function assert<T: string>(value: T, expected: T, message: string) {
  if (value != expected) {
    console.error('[FAILED] ' + message);
    console.error('returned: ' + value);
    console.error('expected: ' + expected);
    return;
  }
  console.error('[PASS] ' + message);
}

const fs = require('fs');

// 1. Setup database
const DB = require('./DB.js');
const path = './api/db/test.json';

function assertDB({name, state, operation, expected, next}: {
  name: string,
  state: Array<Object>,
  operation: (db: DB<any>, done: any) => mixed,
  expected: Array<Object>,
  next: () => mixed,
}) {
  fs.writeFileSync(path, JSON.stringify(state));
  const testDB: DB<{name: string}> = new DB(`test`);
  operation(testDB, () => {
    assert(fs.readFileSync(path).toString(), JSON.stringify(expected), name);
    next();
  });
}

const emptyAnswer = {done: () => {}, fail: () => {}};

assertDB({
  name: "insert test data into file",
  state: [],
  operation: (db, done) => db.insert({name: 'test insert'}, {done, fail: done}),
  expected: [{
    id: "0",
    data: {name: 'test insert'},
  }],
  next: () => assertDB({
    name: "update existing entry",
    state: [{id: "10", data: {name: 'test'}}],
    operation: (db, done) => db.update("10", {name: 'updated'}, {done, fail: done}),
    expected: [{id: "10", data: {name: 'updated'}}],
    next: () => {},
  }),
});

const Oxford = require('./Oxford.js');
Oxford.getMetadata({
  word: 'digress',
  done: (definition) => {
    console.log(JSON.stringify(definition));
  },
  error: (e) => {
    console.log(e.message);
  },
})
