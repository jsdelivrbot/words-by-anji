// @flow

'use strict';

import type {Word} from './DataTypes.js';

const DB = require('./DB.js');
const Oxford = require('./Oxford.js');

const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');

const wordDB = new DB();

function isProd() {
  const isProd = process.env.NODE_ENV === 'PROD';
  return isProd;
}

function getLink(file: string): string {
  if (file[0] == '/') {
    file = file.substr(1);
  }
  return isProd() ? `/words-by-anji/${file}` : `/${file}`;
}

function decorateForProd(app) {
  function decorateMethod(method) {
    const old = app[method].bind(app);
    app[method] = (route, ...rest) => {
      old(getLink(route), ...rest)
    };
  }

  decorateMethod('get');
  decorateMethod('post');
  return app;
}

const app = decorateForProd(express());

function handleStaticRoute(filename, path) {
  app.get('/' + filename, (req, res) => {
    fs.readFile(path + filename, (err, buffer) => {
      res.contentType(filename)
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
          <title>Words by Anji</title>
          <link rel="icon" href="${getLink('anjicon.ico')}" type="image/x-icon" />
          <link rel='shortcut icon' href='${getLink('anjicon.ico')}' type='image/x-icon'/>
          <link rel="stylesheet" href="${getLink('style.css')}" />
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
          <script src="${getLink('bundle.js')}"> </script>
        </body>
      `)
  );
});

handleStaticRoute('anjicon.ico', 'www/client/');
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
