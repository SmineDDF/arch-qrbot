const shortid = require('shortid');

const db = require('./db');
const telegram = require('./telegram');
const utils = require('./utils');

function getQRUrl(str = '') {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${str}`
}

function getRedirectUrl(short) {
  return `${process.env.REDIRECT_URL}/${short}`;
}

module.exports.qrbot = async event => {
  const body = JSON.parse(event.body);
  const { chat, text } = body.message;

  if (text) {
    try {
      if (! utils.isValidUrl(text)) {
        const stringQR = getQRUrl(text);
        await telegram.sendPhotoToUser(chat.id, stringQR)
        return { statusCode: 200 };
      }

      const shortId = shortid.generate();
      await db.saveShortOriginalPair(shortId, text);
      const redirectUrl = getRedirectUrl(shortId);
      const stringQR = getQRUrl(redirectUrl);
      await telegram.sendPhotoToUser(chat.id, stringQR);
    } catch {
      await telegram.sendTextToUser(chat.id, 'An error has occured');
    }
  } else {
    await telegram.sendTextToUser(chat.id, 'Your message is empty');
  }

  return { statusCode: 200 };
};

module.exports.qrbotRedirect = async (event = {}) => {
  const { pathParameters } = event;

  if (!pathParameters || !pathParameters.short) {
    return { statusCode: 404 };
  }

  try {
    const { short, original } = await db.getShortOriginalPair(pathParameters.short);

    await db.logVisit(short, original);

    return {
      statusCode: 302,
      headers: {
        Location: original,
      }
    };
  } catch(e) {
    return { statusCode: 404 }
  }
}
