### qrbot

#### description
serverless telegram bot running on serverless nodejs framework and aws

this bot creates qrcodes from text and links sent to it

link hits are tracked and saved to aws dynamodb

installation:
1. install serverless globally:
```
npm i -g serverless
```
2. set up serverless to use your aws account
```
npm install -g serverless serverless config credentials --provider aws --key <key> --secret <secret>
```
[How to find key and secret](https://www.msp360.com/resources/blog/how-to-find-your-aws-access-key-id-and-secret-access-key/)

3. install dependencies
```
yarn
```
or
```
npm i
```
4. deploy
```
serverless deploy
```
5. create a tg bot using [BotFather](https://telegram.me/BotFather)

6. create a `tg_token.json` file in current directory containing bot token. file should have following stucture:
```
{
  "token": "zzz:yyy"
}
```
where `zzz:yyy` is the token BotFather sent after successful bot creation

7. set bot webhook
```
curl --request POST --url https://api.telegram.org/bot<TELEGRAM_TOKEN>/setWebhook --header 'content-type: application/json' --data '{"url": "<LINK>"}'
```
where `<TELEGRAM_TOKEN>` is bot's token and `<LINK>` is the link to your endpoint (printed in terminal after deployment and has following form: `https://abcdefg123.execute-api.us-east-1.amazonaws.com/dev/qrbot`)

#### disclaimer
this code is nowhere near being production-ready, it's written just for a software architecture class assignment