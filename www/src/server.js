// @flow

'use strict';

import type {Word} from './DataTypes.js';
import type {WithID} from './DB.js';
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

function getLink(file: string, withPrefix: boolean = false): string {
  if (file[0] == '/') {
    file = file.substr(1);
  }
  if (isProd()) {
    const path = `/words-by-anji/${file}`;
    return withPrefix ? 'https://andreq.me' + path : path;
  }
  return `/${file}`;
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

function generateMeta(words: Array<WithID<Word>>): string {
  const randomIndex = Math.floor(Math.random() * Math.floor(words.length));
  const entry = words[randomIndex].data;
  return `
    <meta
      property="og:image"
      content="${getLink('piyomaru.png')}"
    />
    <meta
      property="og:description"
      content="Get literate, one word at a time. '${entry.context} - by Anji'"
    />
    <meta
      property="og:url"
      content="https://andreq.me/words-by-anji"
    />
    <meta
      property="og:title"
      content="Words by Anji"
    />
  `;
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
          ${generateMeta(words)}
          <title>Words by Anji</title>
          <link rel="icon" href="${getLink('anjicon.ico')}" type="image/x-icon" />
          <link rel='shortcut icon' href='${getLink('anjicon.ico')}' type='image/x-icon'/>
          <link rel='stylesheet' href="${getLink('style.css')}" />
          <script id="preloaded" type="application/json">
            ${JSON.stringify(words)}
          </script>
        </head>
        <body>
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
});

handleStaticRoute('anjicon.ico', 'www/client/');
handleStaticRoute('style.css', 'www/client/');
handleStaticRoute('bundle.js', 'www/client/dist/');
handleStaticRoute('piyomaru.png', 'static/imgs/');

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
