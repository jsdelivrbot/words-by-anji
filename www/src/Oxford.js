// @flow

import type {WordDefinition} from './DataTypes.js';

const request = require('request');
const apiEnv = require('../config/env.json');

function getURL(word: string) {
  return `https://od-api.oxforddictionaries.com:443/api/v1/entries/en/${word}`;
}

type OxfordData = {
  senses: Array<{
    definitions: Array<string>,
    examples: Array<{text: string}>,
    id: string,
  }>,
  pronunciations: Array<{
    audioFile: string,
    dialects: Array<string>,
    phoneticNotation: string,
    phoneticSpelling: string,
  }>,
};

function getWordDefinition(data: OxfordData): WordDefinition {
  const pronunciations = data.pronunciations || [{}];
  const senses = data.senses || [{
    definitions: [],
    examples: [{}],
  }];
  const sense = senses[0];
  const definition = sense.definitions && sense.definitions.length
    ? sense.definitions[0]
    : '';
  const example = sense.examples && sense.examples.length
    ? sense.examples[0].text
    : '';
  return {
    definition,
    example,
    spelling: pronunciations[0].phoneticSpelling,
    audio: pronunciations[0].audioFile,
  }
}

function getMetadata({word, done, error}: {
  word: string,
  done: (data: WordDefinition) => mixed,
  error: (error: Error) => mixed},
) {
  word = word.toLowerCase();

  const options = {
    url: getURL(word),
    headers: {
      "app_id": apiEnv['OXFORD_APP'],
      "app_key": apiEnv['OXFORD_TOKEN'],
    },
  };

  request(options, (err, response, body) => {
    if (err || !response) {
      const e = err || new Error('Empty response from ' + getURL(word));
      console.log(e);
      console.log(e.message);
      return error(e);
    }

    if (response.statusCode !== 200) {
      console.log(body);
      console.log(response.statusCode);
      return error(new Error('Request failed ' + getURL(word)));
    }

    const result = JSON.parse(body).results.find(entry => entry.word === word);
    if (!result) {
      console.log(result);
      return error(new Error('Empty find ' + getURL(word)));
    }
    const lexicalEntries = result.lexicalEntries[0] || {};
    const entry = lexicalEntries.entries[0] || {};

    return done(
      getWordDefinition({
        senses: entry.senses,
        pronunciations: lexicalEntries.pronunciations,
      }),
    );
  });
}

const Oxford = {
  getMetadata,
}

module.exports = Oxford;
