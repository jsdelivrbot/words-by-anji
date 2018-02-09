// @flow

import type {Word} from './../../src/DataTypes.js';
import type {WithID} from './../../src/DB.js';

function card(config: {
  spelling: string,
  word: string,
  context: string,
  definition: string,
  example: string,
  audio: string,
  controls: string,
}) {
  return `
    <div class="card-container">
      <div class="card u-clearfix">
        <div class="card-body">
          <span id="spelling" class="card-author subtle">
            ${config.spelling}
          </span>
          <div class="card-title">
            ${config.word}
          </div>
          <span class="card-description">
            ${config.context}
          </span>
          <span class="card-description subtle">
            ${config.definition}
            ${config.example}
          </span>
          </span>
          ${config.controls}
        </div>
        <div class="card-media">
          <div class="icon icon-play audio-control">
            <svg xmlns="http://www.w3.org/2000/svg" height="50" width="50" viewBox="0 0 21 26" id="play" y="58">
              <g transform="translate(-606 -232)" fill="#fff">
                <g id="play-Player" transform="translate(125 60)">
                  <g id="play-Play" transform="translate(453 149)">
                    <path
                      d="m47.193 33.899l-7.721-5.346-6.666-4.615c-1.835-1.27-4.341
                         0.043-4.341 2.275v9.96 9.96c0 2.232 2.506 3.545 4.341
                         2.275l6.666-4.615 7.721-5.346c1.589-1.099 1.589-3.448
                         0-4.548z"
                    />
                  </g>
                </g>
              </g>
            </svg>
            </a>
          </div>
          ${config.audio}
        </div>
      </div>
      <div class="card-shadow"></div>
    </div>
  `;
}

function render({index, entry}: {index: number, entry: WithID<Word>}) {
  const div = document.createElement('div');
  const data = entry.data;
  div.innerHTML = card({
    spelling: data.spelling || '',
    word: data.word,
    context: data.context,
    definition: data.definition
      ? `<div>Definition: ${data.definition}</div>`
      : '',
    example: data.example
      ? `<div>Example: ${data.example}</div>`
      : '',
    audio: data.audio
      ? `<audio class="word-audio">
          <source src="${data.audio}" type="audio/mpeg" />
         </audio>`
      : '',
    controls: '',
  });
  div.getElementsByClassName('audio-control')[0].onclick = () => {
    (div.getElementsByClassName('word-audio')[0]: any).play();
  };
  return div;
}

const Entry = {
  render,
  card,
}

module.exports = Entry;
