const rp = require('request-promise');

function sendTextToUser(chat_id, text) {
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

function sendPhotoToUser(chat_id, photo) {
  const options = {
    method: 'GET',
    uri: `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`,
    qs: {
      chat_id,
      photo
    }
  };

  return rp(options);
}

module.exports = {
  sendTextToUser,
  sendPhotoToUser
}