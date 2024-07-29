import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Config } from "../config/awsconfig";

const s3Client = new S3Client(s3Config);

export const fetchLatestFileFromS3 = async (indexType = 'NIFTY500') => {
  try {
    const metadataKey = indexType === 'NIFTY200' 
      ? "metadata/nifty200_metadata.json" 
      : "metadata/nifty500_metadata.json";

    // Fetch metadata.json
    const metadataCommand = new GetObjectCommand({
      Bucket: s3Config.bucketName,
      Key: metadataKey,
    });

    const metadataResponse = await s3Client.send(metadataCommand);
    const metadataContent = await metadataResponse.Body.transformToString();
    const metadata = JSON.parse(metadataContent);

    // Get the latest_file_path
    const latestFilePath = metadata.latest_file_path;
    if (!latestFilePath) {
      throw new Error("latest_file_path not found in metadata.json");
    }

    // Parse the S3 path
    const bucketName = latestFilePath.split("/")[2];
    const key = latestFilePath.split("/").slice(3).join("/");

    // Fetch the latest file
    const latestFileCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const latestFileResponse = await s3Client.send(latestFileCommand);
    const latestFileContent = await latestFileResponse.Body.transformToString();
    return JSON.parse(latestFileContent);
  } catch (err) {
    throw new Error(`Failed to fetch latest file: ${err.message}`);
  }
};