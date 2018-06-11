// @flow

function bindAudioHandlers(div: HTMLDivElement) {
  div.getElementsByClassName('audio-control')[0].onclick = () => {
    (div.getElementsByClassName('word-audio')[0]: any).play();
  };
}

module.exports = {
  bindAudioHandlers,
};
