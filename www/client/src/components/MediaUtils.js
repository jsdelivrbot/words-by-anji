// @flow

function bindAudioHandlers(div: HTMLDivElement) {
  const control = div.getElementsByClassName('audio-control')[0];
  control.onclick = () => {
    control.className += " icon-click";
    const wordAudio = (div.getElementsByClassName('word-audio')[0]: any);
    if (wordAudio) {
      wordAudio.play();
    }
    setTimeout(
      () => {
        control.className = control.className.replace(" icon-click", "");
      },
      1000,
    );
  };
}

module.exports = {
  bindAudioHandlers,
};
