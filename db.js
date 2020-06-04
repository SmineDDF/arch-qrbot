const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const shortid = require('shortid');

function saveShortOriginalPair(short, original) {
  if (!short || !original) {
    return Promise.reject();
  }

  return dynamoDB
    .put({
      TableName: 'shortToOriginalUrl',
      Item: {
        short,
        original,
        createdTimestamp: +(new Date())
      }
    })
    .promise();
}

async function getShortOriginalPair(short) {
  if (!short) {
    return Promise.reject();
  }

  const params = {
    TableName: 'shortToOriginalUrl',
    Key: {
      short
    }
  }

  const entry = await dynamoDB
    .get(params)
    .promise();

  if (!entry || !entry.Item) {
    return Promise.reject();
  } 

  return entry.Item;
}

function logVisit(short, original) {
  if (!short) {
    return Promise.reject();
  }

  return dynamoDB
    .put({
      TableName: 'logQrVisit',
      Item: {
        uid: shortid.generate(),
        short,
        original,
        timestamp: +(new Date())
      }
    })
    .promise();
}

module.exports = {
  saveShortOriginalPair,
  getShortOriginalPair,
  logVisit
}