import type { UploadApiErrorResponse, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import cloudinary from 'cloudinary';
import { Readable } from 'stream';

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export async function uploadStreamToCloudinary(
  stream: Readable,
  options?: UploadApiOptions,
): Promise<UploadApiResponse | UploadApiErrorResponse> {
  return new Promise((resolve, reject) => {
    const uploader = cloudinary.v2.uploader.upload_stream(options, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });

    stream.pipe(uploader);
  });
}
