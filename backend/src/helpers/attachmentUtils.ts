import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'

// const XAWS = AWSXRay.captureAWS(AWS)

export function getPutSignedUrl(
  bucket: string,
  key: string,
  expires: number
): string {
  const s3 = new AWS.S3({ signatureVersion: 'v4' })

  return s3.getSignedUrl('putObject', {
    Bucket: bucket,
    Key: key,
    Expires: expires
  })
}
