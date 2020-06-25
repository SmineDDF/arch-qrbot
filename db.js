const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

function saveShortOriginalPair(shortUrl, original, trackingId) {
  if (!shortUrl || !original) {
    return Promise.reject();
  }

  return dynamoDB
    .put({
      TableName: 'shortToOriginal',
      Item: {
        trackingId,
        shortUrl,
        original,
        createdTimestamp: +(new Date())
      }
    })
    .promise();
}

async function getShortOriginalPair(shortUrl) {
  if (!shortUrl) {
    return Promise.reject();
  }

  const entry = await dynamoDB
    .get({
      TableName: 'shortToOriginal',
      Key: {
        shortUrl
      }
    })
    .promise();

  if (!entry || !entry.Item) {
    return Promise.reject();
  } 

  return entry.Item;
}

function logVisit(shortUrl, original, uid) {
  if (!shortUrl) {
    return Promise.reject();
  }

  return dynamoDB
    .put({
      TableName: 'logQrVisit',
      Item: {
        uid,
        shortUrl,
        original,
        timestamp: +(new Date())
      }
    })
    .promise();
}

async function deleteAllData(trackingId) {
  if (!trackingId) {
    return Promise.reject();
  }

  const { Items } = await dynamoDB.scan({
    TableName: 'shortToOriginal',
    ProjectionExpression: "trackingId, shortUrl",
    FilterExpression: "trackingId = :trackingId",
    ExpressionAttributeValues: {
        ":trackingId": trackingId
    }
  })
  .promise();

  const { shortUrl } = (Items || [])[0] || {};

  return dynamoDB.delete({
    TableName: 'shortToOriginal',
    Key: {
      shortUrl
    }
  })
  .promise();
}

async function getVisitsByTrackingId(trackingId) {
  if (!trackingId) {
    return Promise.reject();
  }

  const { Items } = await dynamoDB.scan({
    TableName: 'shortToOriginal',
    ProjectionExpression: "trackingId, shortUrl",
    FilterExpression: "trackingId = :trackingId",
    ExpressionAttributeValues: {
        ":trackingId": trackingId
    }
  })
  .promise();

  const { shortUrl } = (Items || [])[0] || {};

  const { Count } = await dynamoDB.scan({
    TableName: 'logQrVisit',
    ProjectionExpression: "shortUrl",
    FilterExpression: "shortUrl = :shortUrl",
    ExpressionAttributeValues: {
        ":shortUrl": shortUrl
    }
  })
  .promise();

  return Count;
}

module.exports = {
  saveShortOriginalPair,
  getShortOriginalPair,
  logVisit,
  deleteAllData,
  getVisitsByTrackingId
}