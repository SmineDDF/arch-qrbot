const rp = require('request-promise');

function sendText(chat_id, text) {
  const options = {
    method: 'GET',
    uri: `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
    qs: {
      chat_id,
      text
    }
  };

  return rp(options);
}

function sendPhoto(chat_id, caption, photo) {
  const options = {
    method: 'GET',
    uri: `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`,
    qs: {
      chat_id,
      photo,
      caption
    }
  };

  return rp(options);
}

function sendMessage(chat_id, text, photo) {
  if (! photo) {
    return sendText(chat_id, text);
  }

  return sendPhoto(chat_id, text, photo)
}

module.exports = {
  sendMessage
}