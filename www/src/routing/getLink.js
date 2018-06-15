// @flow

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


module.exports = getLink;
