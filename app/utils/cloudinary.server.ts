import cloudinary, { UploadApiResponse } from 'cloudinary';
import { Readable, Stream } from 'stream';
import sharp from 'sharp';

const getCircleMask = (size: number) => {
  const radius = size / 2;
  return Buffer.from(
    `<svg width='${size}' height='${size}'><circle cx='${radius}' cy='${radius}' r='${radius}'/></svg>`,
  );
};

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

const test = {
  height: Math.floor(1084.2243154005948),
  width: Math.floor(1084.2243154005948),
  left: Math.floor(432.8524644176553),
  top: Math.floor(90.30432456052212),
};

export async function uploadStreamToCloudinary(
  stream: Readable,
  options: UploadStreamToCloudinaryOptionsInterface,
): Promise<UploadApiResponse | null> {
  const cwd = process.cwd();

  // get the buffer from the stream
  const buffer = await streamToBuffer(stream);

  // create a sharp image from the avatar buffer
  const avaBuffer = await sharp(buffer)
    .resize(test.width, test.height)
    .extract({
      left: test.left,
      top: test.top,
      width: 236,
      height: 236,
    })
    .composite([
      {
        input: getCircleMask(236),
        gravity: 'center',
        blend: 'dest-in',
      },
    ])
    .toFormat('png')
    .toBuffer();

  // composite the avatar image with the ua flag
  const transform = await sharp(`${cwd}/public/ua-flag.png`)
    .resize(256, 256)
    .composite([
      {
        input: getCircleMask(256),
        gravity: 'center',
        blend: 'dest-in',
      },
      {
        input: avaBuffer,
        gravity: 'center',
        blend: 'over',
      },
    ])
    .toFormat('png')
    .toBuffer();

  // get stream from composite image
  const transformedStream = Readable.from(transform);

  // upload the stream to cloudinary
  return new Promise((resolve, reject) => {
    // upload the stream to cloudinary
    const uploader = cloudinary.v2.uploader.upload_stream(
      {
        secure: true,
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(null);
        }
      },
    );

    transformedStream.pipe(uploader);
  });
}
