// @flow

'use strict';

import type {Word} from './DataTypes.js';

const DB = require('./DB.js');
const Oxford = require('./Oxford.js');

const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');

const app = express();
const wordDB = new DB();

function handleStaticRoute(filename, path) {
  app.get('/' + filename, (req, res) => {
    fs.readFile(path + filename, (err, buffer) => {
      if (err) {
        res.send(err);
        return;
      }
      res.send(buffer);
    });
  });
}

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/', (req, res) => {
  wordDB.getAll().then(
    words =>
      res.send(`
        <head>
          <title> Words by Anji </title>
          <link rel="stylesheet" href="style.css">
          <script id="preloaded" type="application/json">
            ${JSON.stringify(words)}
          </script>
        </head>
        <body>
          <h1 id="title">
            <div class="words">Words</div> 
            <div class="by">by Anji</div>
          </h1>

          <div id=entries>
          </div >
          <script src="bundle.js"> </script>
        </body>
      `)
  );
});

handleStaticRoute('style.css', 'www/client/');
handleStaticRoute('bundle.js', 'www/client/dist/');

// respond with "hello world" when a GET request is made to the homepage
app.get('/words', (req, res) => {
  wordDB.getAll().then(
    words => res.send(words),
    error => res.send(error)
  )
});

app.post('/word', (req, res) => {
  const word: string = req.body.word;
  const context: string = req.body.context;
  Oxford.getMetadata({
    word,
    done: (definition) => {
      const data: Word = {
        word,
        context,
        ...definition,
      };
      wordDB.insert(
        data,
        {
          done: (withID) => res.send(withID),
          fail: (e) => res.send(e),
        }
      )
    },
    error: res.send,
  });
});

app.listen(1234, () => console.log('Listening on port 1234!'));
