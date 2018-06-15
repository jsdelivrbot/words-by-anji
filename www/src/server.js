// @flow

'use strict';

import type {Word} from './DataTypes.js';
import type {WithID} from './DB.js';

const DB = require('./DB.js');
const Oxford = require('./Oxford.js');

const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const generateMetadata = require('./headers/generateMetadata.js');
const getLink = require('./routing/getLink.js');

const wordDB = new DB();

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

handleStaticRoute('anjicon.ico', 'www/client/');
handleStaticRoute('style.css', 'www/client/');
handleStaticRoute('bundle.js', 'www/client/dist/');
handleStaticRoute('piyomaru.png', 'static/imgs/');

function renderMain(req, res, hint: string = ""): void {
  wordDB.getAll().then(
    words =>
      res.send(`
        <head>
          ${generateMetadata(words, hint)}
          <title>Words by Anji</title>
          <link rel="icon" href="${getLink('anjicon.ico')}" type="image/x-icon" />
          <link rel='shortcut icon' href='${getLink('anjicon.ico')}' type='image/x-icon'/>
          <link rel='stylesheet' href="${getLink('style.css')}" />
        </head>
        <body>
          <script id="preloaded" type="application/json">
            ${JSON.stringify(words)}
          </script>
          <h1 id="title">
            <div class="words">Words</div>
            <div class="by">by Anji</div>
          </h1>

          <div id="input-entry"></div>
          <div id="entries"></div>
          <script src="${getLink('bundle.js')}"> </script>
        </body>
      `)
  );
}

app.get('/lucky/:word', (req, res) => {
  console.log(req.params.word);
  renderMain(req, res, req.params.word.trim());
});

app.get('/', (req, res) => renderMain(req, res));

// respond with "hello world" when a GET request is made to the homepage
app.get('/words', (req, res) => {
  wordDB.getAll().then(
    words => res.send(words),
    error => res.send(error)
  )
});

app.get('/search/:word', (req, res) => {
  const word: string = req.params.word;
  Oxford.getMetadata({
    word,
    done: (definition) => {
      res.send({
        word,
        context: '',
        ...definition,
      });
    },
    error: (_) => res.send(
      {error: true, message: 'This is not a word, \u{1F481}.'},
    ),
  })
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
      );
    },
    error: (_) => {
      wordDB.insert(
        {word, context},
        {
          done: (withID) => res.send(withID),
          fail: (e) => res.send(e),
        }
      );
    },
  });
});

app.listen(1234, () => console.log('Listening on port 1234!'));
