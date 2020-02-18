'use strict'
const https = require('https')
const url = new URL(process.env.SLACK_WEBHOOK)

/*
 * Send a Slack message
 */
exports.postSlackMessage = async message => {
  return new Promise((resolve, reject) => {
    const body = {
      attachments: [
        {
          fallback: 'Unauthorized S3 object copied',
          color: '#9d1111',
          author_name: 'Unauthorized S3 object copied',
          title: message.bucket,
          title_link: `https://s3.console.aws.amazon.com/s3/buckets/${message.bucket}/`,
          text: `S3 object copied to an unknown or unauthorized account.`,
          fields: [
            {
              title: 'Region',
              value: message.region,
              short: false,
            },
            {
              title: 'Initiator',
              value: message.user,
              short: false,
            },
            {
              title: 'Agent',
              value: message.agent,
              short: false,
            },
            {
              title: 'Objects',
              value: message.objects.reverse().join('\n'),
              short: false,
            },
          ],
          footer: 'AWS S3',
          footer_icon:
            'https://user-images.githubusercontent.com/2565382/73571350-40a30580-4466-11ea-81e4-e5a36693f164.png',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }
    const data = JSON.stringify(body)
    const options = {
      hostname: url.host,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    }

    const req = https.request(options, res => {
      res.on('data', () => {
        resolve(res.statusCode)
      })
    })

    req.on('error', err => {
      reject(err)
    })

    // send the request
    req.write(data)
    req.end()
  })
}
