import cloudinary, { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import sharp from 'sharp';
import https from 'https';
import { avaSize, flagSize } from '../configs/common';

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

async function getBufferFromUrl(url: string): Promise<Buffer> {
  return new Promise((resolve) => {
    https.get(url, (response) => {
      const body: Buffer[] = [];
      response
        .on('data', (chunk: Buffer) => {
          body.push(chunk);
        })
        .on('end', () => {
          resolve(Buffer.concat(body));
        });
    });
  });
}

const getCircleMask = (size: number) => {
  const radius = size / 2;
  return Buffer.from(
    `<svg width='${size}' height='${size}'><circle cx='${radius}' cy='${radius}' r='${radius}'/></svg>`,
  );
};

export async function uploadStreamToCloudinary(
  stream: Readable,
): Promise<UploadApiResponse | null> {
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

    stream.pipe(uploader);
  });
}

export async function getCloudinaryImageUrl(imageId: string): Promise<string> {
  return cloudinary.v2.url(imageId, {
    secure: true,
  });
}

export interface GenerateAvatarOptionsInterface {
  avatarFileName: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export async function generateAvatar(
  args: GenerateAvatarOptionsInterface,
): Promise<UploadApiResponse | null> {
  // get avatar buffer
  const avatarUrl = await getCloudinaryImageUrl(args.avatarFileName);
  const avatarBuffer = await getBufferFromUrl(avatarUrl);

  // create a sharp image from the avatar buffer
  const width = Math.floor(args.width);
  const height = Math.floor(args.height);
  const avaBuffer = await sharp(avatarBuffer)
    .resize(width, height)
    .extract({
      left: Math.floor(args.x),
      top: Math.floor(args.y),
      width: avaSize,
      height: avaSize,
    })
    .composite([
      {
        input: getCircleMask(avaSize),
        gravity: 'center',
        blend: 'dest-in',
      },
    ])
    .toFormat('png')
    .toBuffer();

  // get flag buffer
  const flagUrl = await getCloudinaryImageUrl('ua-flag.png');
  const flagBuffer = await getBufferFromUrl(flagUrl);

  // composite the avatar image with the ua flag
  const transform = await sharp(flagBuffer)
    .resize(flagSize, flagSize)
    .composite([
      {
        input: getCircleMask(flagSize),
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
