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
import { Form, useTransition } from '@remix-run/react';
import AvaPreview from '../../components/AvaPreview';

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

  if (generatedAvatarResult) {
    return redirect(`/download?url=${encodeURIComponent(generatedAvatarResult.secure_url)}`);
  }

  return redirect(request.url);
};

const CropRoute = () => {
  const transition = useTransition();
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
        <AvaPreview>
          <img
            id='preview'
            src={imageUrl}
            width={avaSize}
            height={avaSize}
            alt='ava preview'
            style={avaPreviewStyles}
          />
        </AvaPreview>
      </Form>

      {/*controls*/}
      <div className='mt-8 h-12'>
        <div className='flex flex-wrap items-center justify-center gap-4'>
          {transition.submission?.method === 'DELETE' ? (
            <div>Removing image...</div>
          ) : transition.submission?.method === 'POST' ? (
            <div>
              <div className='text-center'>
                <div className='text-xl'>Generating avatar...</div>
                <div>Please wait</div>
              </div>
            </div>
          ) : (
            <React.Fragment>
              {/*remove uploaded avatar button*/}
              <Form id={'clear'} method={'delete'}>
                <button
                  disabled={transition.state === 'submitting'}
                  form={'clear'}
                  type='submit'
                  formMethod='DELETE'
                  className='h-12 w-[180px] rounded bg-red-800 font-bold text-white disabled:bg-gray-700 disabled:text-white disabled:opacity-80'
                >
                  Go back
                </button>
              </Form>

              {/*generate avatar button*/}
              <button
                disabled={transition.state === 'submitting'}
                form={'generate'}
                type='submit'
                className='h-12 w-[180px] rounded bg-yellow-300 font-bold text-blue-800 disabled:bg-gray-700 disabled:text-white disabled:opacity-80'
              >
                Generate avatar
              </button>
            </React.Fragment>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CropRoute;
