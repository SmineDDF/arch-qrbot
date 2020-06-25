const shortid = require('shortid');

const db = require('./db');
const telegram = require('./telegram');
const utils = require('./utils');

function formatVisitData(visitData) {
  return 'Success';
};

async function handleDeleteCommand(trackingId) {  
  if (! trackingId) {
    return 'Provide a valid trackingId';
  }

  try {
    await db.deleteAllData(trackingId);
    return `Visit data for trackingId ${trackingId} completely removed`;
  } catch (e) {
    return 'Delete unsuccessful. Visit data already removed.';
  }
}

async function handleVisitsCommand(trackingId) {
  if (! trackingId) {
    return 'Provide a valid trackingId';
  }

  try {
    const countOfVisits = await db.getVisitsByTrackingId(trackingId);
    return countOfVisits;
  } catch (e) {
    return `Could not find visit data for trackingId ${trackingId}`;
  }
}

const COMMAND_HANDLERS = {
  '/delete': handleDeleteCommand,
  '/visits': handleVisitsCommand
};

function getQRUrl(str = '') {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${str}`
}

function getRedirectUrl(shortUrl) {
  return `${process.env.REDIRECT_URL}/${shortUrl}`;
}

async function handleCommand(chat, text) {
  const [ command, ...args ] = text.split(' ');

  const commandHandler = COMMAND_HANDLERS[command];

  if (! commandHandler) {
    await telegram.sendMessage(chat.id, 'Invalid command')
    return { statusCode: 200 };
  }

  const commandResult = await commandHandler(...args);
  await telegram.sendMessage(chat.id, commandResult);
  return { statusCode: 200 };
}

function processCommand(chat, text = '') {
  if (text.startsWith('/')) {
    return handleCommand(chat, text);
  }

  return null;
}

module.exports.qrbot = async event => {
  const body = JSON.parse(event.body);
  const { chat, text } = body.message;

  if (text) {
    try {
      const commandPromise = processCommand(chat, text);

      if (commandPromise) {
        return commandPromise;
      } 

      if (! utils.isValidUrl(text)) {
        const stringQR = getQRUrl(text);
        await telegram.sendMessage(chat.id, 'Your string-only QR', stringQR)
        return { statusCode: 200 };
      }

      const shortId = shortid.generate();
      const trackingId = shortid.generate();
      await db.saveShortOriginalPair(shortId, text, trackingId);
      const redirectUrl = getRedirectUrl(shortId);
      const stringQR = getQRUrl(redirectUrl);
      await telegram.sendMessage(
        chat.id, 
        `Direct link: ${redirectUrl} \n` +
        `trackingId to access visit count: ${trackingId}`,
        stringQR
      );
    } catch {
      await telegram.sendMessage(chat.id, 'An error has occured');
    }
  } else {
    await telegram.sendMessage(chat.id, 'Your message is empty');
  }

  return { statusCode: 200 };
};

module.exports.qrbotRedirect = async (event = {}) => {
  const { pathParameters } = event;

  if (!pathParameters || !pathParameters.short) {
    return { statusCode: 404 };
  }

  try {
    const { shortUrl, original } = await db.getShortOriginalPair(pathParameters.short);

    await db.logVisit(shortUrl, original, shortid.generate());

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
