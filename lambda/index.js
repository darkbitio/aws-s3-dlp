'use strict'
const { postSlackMessage } = require('./slack')

exports.handler = (event, {}) => {
  let details = {}
  let promises = []

  // Event contains one or more records from SNS
  if (event.Records) {
    event.Records.map(record => {
      let message = JSON.parse(record.Sns.Message)

      details.resources = message.detail.resources
      details.region = message.detail.awsRegion
      details.bucket = message.detail.requestParameters.bucketName
      details.agent = message.detail.userAgent
      details.user = message.detail.userIdentity.arn

      promises.push(this.checkObjectCopyDestination(details))
    })
  }

  Promise.all(promises)
    .then(res => {
      res.map(response => console.log(response))
    })
    .catch(err => {
      console.log(`ERROR: ${err}`)
    })
}

/*
 * Check copied object destination account
 */
exports.checkObjectCopyDestination = async details => {
  // const validAccounts = ['9876543210', '1234567890']
  const validAccounts = process.env.AUTHORIZED_ACCOUNTS.split(',')
  // compare resources with accountId field
  // check for any unknown or unauthorized accounts
  const unauthorized = !!details.resources
    .filter(resource => resource.accountId)
    .filter(resource => !validAccounts.includes(resource.accountId)).length

  // collect object ARNs involved in CopyObject operation
  if (unauthorized) {
    details.objects = details.resources
      .filter(object => object.type === 'AWS::S3::Object')
      .map(object => object.ARN)
  }

  return new Promise((resolve, reject) => {
    if (unauthorized) {
      postSlackMessage(details)
        .then(() => {
          resolve('S3 CopyObject is NOT authorized - posted Slack message')
        })
        .catch(err => {
          reject(err)
        })
    } else {
      resolve('S3 CopyObject is authorized')
    }
  })
}
