// @flow

'use strict';

import type {Word} from './DataTypes.js';

const express = require('express');
const bodyParser = require('body-parser');
const Oxford = require('./Oxford.js');

const env = require('../api-env.json');
const app = express();

const DB = require('./DB.js');

const wordDB: DB<Word> = new DB('words');

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// respond with "hello world" when a GET request is made to the homepage
app.get('/words', (req, res) => {
  res.send(wordDB.getAll());
});

app.post('/word', (req, res) => {
  console.log(req.body);
  const word: string = req.body.word;
  const context: string = req.body.context;
  Oxford.getMetadata({
    word,
    done: (definition) => {
      const data: Word = {
        word,
        context,
        definition,
      };
      wordDB.insert(data, {
        done: (withID) => res.send(withID),
        fail: (e) => res.send(e),
      })
    },
    error: (e) => res.send('FAIL'),
  });
});

app.listen(5000, () => console.log('Listening on port 5000!'))
