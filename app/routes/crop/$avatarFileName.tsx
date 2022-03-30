import * as React from 'react';
import Layout from '../../components/Layout';
import { ActionFunction, LoaderFunction, redirect, useLoaderData } from 'remix';
import { deleteFromCloudinary, getCloudinaryImageUrl } from '../../utils/cloudinary.server';
import { avaSize, defaultCropSize } from '../../configs/common';
import ReactCrop, { PixelCrop } from 'react-image-crop';
import { Form, useTransition } from '@remix-run/react';
import queryString from 'query-string';

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

// delete uploaded image from cloudinary
export const action: ActionFunction = async ({ params }) => {
  const avatarFileName = `${params.avatarFileName}`;
  await deleteFromCloudinary(avatarFileName);
  return redirect(`/upload`);
};

const CropRoute = () => {
  const transition = useTransition();
  const { imageUrl, avatarFileName } = useLoaderData<CropRouteDataInterface>();
  const [crop, setCrop] = React.useState<PixelCrop>(defaultCrop);
  const [previewSizes, setPreviewSizes] = React.useState<Sizes>(defaultSizes);

  // set preview image sizes
  React.useEffect(() => {
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      const cropImage = document.querySelector('#crop-image');
      if (cropImage) {
        const cropImageRect = cropImage.getBoundingClientRect();
        setPreviewSizes({
          width: cropImageRect.width,
          height: cropImageRect.height,
        });
      }
    };
  }, [imageUrl]);

  // get download url
  const downloadUrl = React.useMemo<string>(() => {
    // get initial values
    const cropWidth = crop?.width || defaultCrop.width;
    const cropHeight = crop?.height || defaultCrop.height;
    const cropPositionX = crop?.x === 0 ? 0 : crop?.x || defaultCrop.x;
    const cropPositionY = crop?.y === 0 ? 0 : crop?.y || defaultCrop.y;

    // count preview sizes
    const imageWidth = (previewSizes.width * avaSize) / cropWidth;
    const imageHeight = (previewSizes.height * avaSize) / cropHeight;

    // count preview crop position
    const positionX = (cropPositionX * imageWidth) / previewSizes.width;
    const positionY = (cropPositionY * imageHeight) / previewSizes.height;

    // set download url
    const queryParams = queryString.stringify({
      x: positionX,
      y: positionY,
      width: imageWidth,
      height: imageHeight,
    });
    return `/crop/${avatarFileName}.png?${queryParams}`;
  }, [avatarFileName, crop, previewSizes]);

  return (
    <Layout>
      <div className='relative'>
        {/*crop*/}
        <div className='mt-8 pb-4'>
          <ReactCrop aspect={1} crop={crop} onChange={(pixelCrop) => setCrop(pixelCrop)}>
            <img id={'crop-image'} className='block' alt='Crop me' src={imageUrl} />
          </ReactCrop>
        </div>

        {/*controls*/}
        <div className='sticky left-0 bottom-0 rounded-lg bg-gray-400 p-4 dark:bg-gray-700'>
          <div className='flex flex-wrap items-center justify-center gap-4'>
            {transition.state === 'submitting' ? (
              <div>
                <div className='text-center'>
                  <div className='text-xl'>Removing image...</div>
                  <div>Please wait</div>
                </div>
              </div>
            ) : (
              <React.Fragment>
                {/*remove uploaded avatar button*/}
                <Form method='post'>
                  <button
                    type='submit'
                    className='h-12 w-[180px] rounded bg-red-800 font-bold text-white'
                  >
                    Go back
                  </button>
                </Form>

                {/*generate avatar button*/}
                <button
                  type='button'
                  className='flex h-12 w-[180px] items-center justify-center rounded bg-yellow-300 font-bold text-blue-800'
                  onClick={() => {
                    window.open(downloadUrl, '_blank');
                    window.location.href = '/upload';
                  }}
                >
                  Download avatar
                </button>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CropRoute;
