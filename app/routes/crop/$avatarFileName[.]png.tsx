import { LoaderFunction } from 'remix';
import {
  deleteFromCloudinary,
  generateAvatarBuffer,
  GenerateAvatarOptionsInterface,
} from '../../utils/cloudinary.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const avatarFileName = `${params.avatarFileName}`;
  const url = new URL(request.url);
  const formData = url.searchParams;
  const x = formData.get('x') as string;
  const y = formData.get('y') as string;
  const width = formData.get('width') as string;
  const height = formData.get('height') as string;

  // generate new avatar
  const args: GenerateAvatarOptionsInterface = {
    x: parseInt(x, 10),
    y: parseInt(y, 10),
    width: parseInt(width, 10),
    height: parseInt(height, 10),
    avatarFileName,
  };
  const buffer = await generateAvatarBuffer(args);
  if (!buffer) {
    return {
      status: 404,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'Not found',
    };
  }

  // delete old avatar
  await deleteFromCloudinary(avatarFileName);

  // create response headers
  const fileName = new Date().getTime();
  const headers = {
    'Content-Type': 'image/png',
    'Content-Disposition': `attachment; filename="uava-${fileName}.png"`,
  };
  return new Response(buffer, {
    status: 200,
    headers,
  });
};
