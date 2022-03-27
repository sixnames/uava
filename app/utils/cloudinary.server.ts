import cloudinary from 'cloudinary';
import { Readable, Stream } from 'stream';
import sharp from 'sharp';

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

async function streamToBuffer(stream: Stream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = Array<any>();
    stream.on('data', (chunk) => _buf.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(_buf)));
    stream.on('error', (err) => reject(`error converting stream - ${err}`));
  });
}

interface UploadStreamToCloudinaryOptionsInterface {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface UploadStreamToCloudinaryPayloadInterface {
  url: string;
  publicId: string;
}

export async function uploadStreamToCloudinary(
  stream: Readable,
  options: UploadStreamToCloudinaryOptionsInterface,
): Promise<UploadStreamToCloudinaryPayloadInterface> {
  const buffer = await streamToBuffer(stream);
  const transform = await sharp(buffer)
    // .resize(options.width, options.height)
    .extract({
      width: 236,
      height: 236,
      left: 1,
      top: 1,
      // left: options.x,
      // top: options.y,
    })
    .resize(236, 236)
    .toFormat('png')
    .toBuffer();

  const transformedStream = Readable.from(transform);

  return new Promise((resolve, reject) => {
    // upload the stream to cloudinary
    const uploader = cloudinary.v2.uploader.upload_stream({}, (error, result) => {
      if (result) {
        // generate an avatar
        const url = cloudinary.v2.url('ua-flag.png', {
          secure: true,
          width: 256,
          height: 256,
          radius: 'max',
          transformation: [
            {
              overlay: result.public_id,
              width: options.width,
              opacity: options.height,
              radius: 'max',
            },
          ],
        });

        resolve({
          url,
          publicId: result.public_id,
        });
      } else {
        reject(error);
      }
    });

    transformedStream.pipe(uploader);
  });
}
