/*
 *  Simple test harness for Lambda handler
 *
 *  Run with `node test.js`
 */

const { handler } = require('./s3-dlp-slack')

/*
 * Sample event message payload
 */
const message = {
  detail: {
    awsRegion: 'us-east-1',
    userAgent: 'aws-cli/1.16.310 Python/3.7.4 Darwin/19.2.0 botocore/1.13.46',
    userIdentity: { arn: 'arn:aws:iam::123456789012:user/brandon.michaels' },
    requestParameters: {
      bucketName: 'top-secret-bucket',
    },
    resources: [
      {
        type: 'AWS::S3::Object',
        ARN: 'arn:aws:s3:::exfil-1234567890/file1',
      },
      {
        accountId: '1234567890',
        type: 'AWS::S3::Bucket',
        ARN: 'arn:aws:s3:::exfil-1234567890',
      },
      {
        accountId: '9876543210',
        type: 'AWS::S3::Bucket',
        ARN: 'arn:aws:s3:::secret-9876543210',
      },
      {
        type: 'AWS::S3::Object',
        ARN: 'arn:aws:s3:::secret-9876543210/file1',
      },
    ],
  },
}

/*
 * Format a test message with the same shape as an SNS message
 */
const dummy = {
  Records: [
    {
      Sns: {
        Message: JSON.stringify(message),
      },
    },
  ],
}

handler(dummy, {})
