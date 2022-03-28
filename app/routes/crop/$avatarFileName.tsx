import * as React from 'react';
import Layout from '../../components/Layout';
import { ActionFunction, LoaderFunction, redirect, useLoaderData } from 'remix';
import {
  deleteFromCloudinary,
  generateAvatar,
  GenerateAvatarOptionsInterface,
  getCloudinaryImageUrl,
} from '../../utils/cloudinary.server';
import { avaSize, defaultCropSize } from '../../configs/common';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { Form } from '@remix-run/react';

const defaultCrop: PixelCrop = {
  unit: 'px',
  width: defaultCropSize,
  height: defaultCropSize,
  x: 5,
  y: 5,
};

interface Sizes {
  width: number;
  height: number;
}

const defaultSizes: Sizes = {
  width: 1,
  height: 1,
};

export interface CropRouteDataInterface {
  imageUrl: string;
  avatarFileName: string;
}

export const loader: LoaderFunction = async ({ params }) => {
  const avatarFileName = `${params.avatarFileName}`;
  const imageUrl = await getCloudinaryImageUrl(avatarFileName);
  const data: CropRouteDataInterface = {
    imageUrl,
    avatarFileName,
  };

  return data;
};

export const action: ActionFunction = async ({ request, params }) => {
  const avatarFileName = `${params.avatarFileName}`;
  const formData = await request.formData();
  const x = formData.get('x') as string;
  const y = formData.get('y') as string;
  const width = formData.get('width') as string;
  const height = formData.get('height') as string;

  // delete uploaded image from cloudinary
  if (request.method === 'DELETE') {
    await deleteFromCloudinary(avatarFileName);
    return redirect(`/upload`);
  }

  // generate new avatar
  const generatedAvatarResult = await generateAvatar({
    x: parseInt(x, 10),
    y: parseInt(y, 10),
    width: parseInt(width, 10),
    height: parseInt(height, 10),
    avatarFileName,
  });

  console.log(generatedAvatarResult?.url);

  return {};
};

const CropRoute = () => {
  const { imageUrl, avatarFileName } = useLoaderData<CropRouteDataInterface>();
  const [crop, setCrop] = React.useState<Crop>();
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>();
  const [previewSizes, setPreviewSizes] = React.useState<Sizes>(defaultSizes);
  const [params, setParams] = React.useState<GenerateAvatarOptionsInterface>({
    avatarFileName,
    width: avaSize,
    height: avaSize,
    x: 0,
    y: 0,
  });

  // get preview styles
  const avaPreviewStyles = React.useMemo<React.CSSProperties>(() => {
    // get initial values
    const cropWidth = completedCrop?.width || defaultCrop.width;
    const cropHeight = completedCrop?.height || defaultCrop.height;
    const cropPositionX = completedCrop?.x === 0 ? 0 : completedCrop?.x || defaultCrop.x;
    const cropPositionY = completedCrop?.y === 0 ? 0 : completedCrop?.y || defaultCrop.y;

    // count preview sizes
    const imageWidth = (previewSizes.width * avaSize) / cropWidth;
    const imageHeight = (previewSizes.height * avaSize) / cropHeight;

    // count preview crop position
    const positionX = (cropPositionX * imageWidth) / previewSizes.width;
    const positionY = (cropPositionY * imageHeight) / previewSizes.height;
    const top = positionY === 0 ? 0 : `-${positionY}px`;
    const left = positionX === 0 ? 0 : `-${positionX}px`;

    // set params for next crop
    setParams((prevParams) => ({
      ...prevParams,
      width: imageWidth,
      height: imageHeight,
      x: positionX,
      y: positionY,
    }));

    return {
      position: 'absolute',
      display: 'block',
      top,
      left,
      width: imageWidth,
      height: imageHeight,
      minWidth: imageWidth,
      minHeight: imageHeight,
    };
  }, [completedCrop, previewSizes]);

  React.useEffect(() => {
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      const width = image.width;
      const height = image.height;
      const sizes = {
        width,
        height,
      };
      setPreviewSizes(sizes);
      setCrop(defaultCrop);
      setCompletedCrop(defaultCrop);
    };
  }, [imageUrl]);

  return (
    <Layout>
      <Form
        id='generate'
        className='flex flex-col items-center'
        encType='multipart/form-data'
        method='post'
      >
        {/*crop*/}
        <input type={'hidden'} value={params.x} name={'x'} />
        <input type={'hidden'} value={params.y} name={'y'} />
        <input type={'hidden'} value={params.width} name={'width'} />
        <input type={'hidden'} value={params.height} name={'height'} />

        {/*crop*/}
        <div className='mt-8'>
          <ReactCrop
            aspect={1}
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
          >
            <img id={'crop-image'} className='block' alt='Crop me' src={imageUrl} />
          </ReactCrop>
        </div>

        {/*ava preview*/}
        <div className='relative mt-8 h-[256px] w-[256px] overflow-hidden rounded-full shadow-lg dark:shadow-2xl'>
          <img src='/ua-flag.png' width='256' height='256' alt='ukraine flag' />

          <div className='absolute top-[10px] left-[10px] h-[236px] w-[236px] cursor-pointer overflow-hidden rounded-full'>
            <img
              id='preview'
              src={imageUrl}
              width={avaSize}
              height={avaSize}
              alt='ava preview'
              style={avaPreviewStyles}
            />
          </div>
        </div>
      </Form>

      {/*controls*/}
      <div className='mt-8 h-12'>
        <div className='flex flex-wrap items-center justify-center gap-4'>
          {/*remove uploaded avatar button*/}
          <Form id={'clear'} method={'delete'}>
            <button
              form={'clear'}
              type='submit'
              formMethod='DELETE'
              className='h-12 w-[180px] rounded bg-red-800 font-bold uppercase text-white'
            >
              Go back
            </button>
          </Form>

          {/*download generated avatar button*/}
          <button
            form={'generate'}
            type='submit'
            className='h-12 w-[180px] rounded bg-yellow-300 font-bold uppercase text-blue-800'
          >
            Download avatar
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CropRoute;
