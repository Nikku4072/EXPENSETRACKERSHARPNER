const AWS = require('aws-sdk');

const uploadToS3 = async (stringifiedExpenses, fileName) => {
  try {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_ACCESS;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
    const AWS_REGION = process.env.AWS_REGION;  // ⬅️ Added

    let s3bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
      region: AWS_REGION      // ⬅️ Very important
    });

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: stringifiedExpenses,
    };

    const { Location: fileUrl } = await s3bucket.upload(params).promise();
    return fileUrl;

  } catch (err) {
    console.log("Error in uploading expenses data to S3, error: ", JSON.stringify(err));
    throw new Error(err);
  }
};

module.exports = { uploadToS3 };