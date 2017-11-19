// @flow

import type {WordDefinition} from './DataTypes.js';

const request = require('request');
const apiEnv = require('../api-env.json');

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
    audio: string,
    dialects: Array<string>,
    phoneticNotation: string,
    phoneticSpelling: string,
  }>,
};

function getWordDefinition(data: OxfordData): WordDefinition {
  return {
    definition: data.senses[0].definitions[0],
    example: data.senses[0].examples[0].text,
    spelling: data.pronunciations[0].phoneticSpelling,
    audio: data.pronunciations[0].audio,
  }
}

function getMetadata({word, done, error}: {
  word: string,
  done: (data: WordDefinition) => mixed,
  error: (error: Error) => mixed},
) {

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
