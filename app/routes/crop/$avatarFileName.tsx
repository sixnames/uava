import * as React from 'react';
import Layout from '../../components/Layout';
import { ActionFunction, LoaderFunction, redirect, useLoaderData } from 'remix';
import { deleteFromCloudinary, getCloudinaryImageUrl } from '../../utils/cloudinary.server';
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

export const action: ActionFunction = async ({ params }) => {
  const avatarFileName = `${params.avatarFileName}`;
  // delete uploaded image from cloudinary
  await deleteFromCloudinary(avatarFileName);
  return redirect(`/upload`);
};

const CropRoute = () => {
  const transition = useTransition();
  const { imageUrl, avatarFileName } = useLoaderData<CropRouteDataInterface>();
  const [crop, setCrop] = React.useState<Crop>();
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>();
  const [previewSizes, setPreviewSizes] = React.useState<Sizes>(defaultSizes);
  const [downloadUrl, setDownloadUrl] = React.useState<string>('');

  // set initial state on image load
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
      setCrop(defaultCrop);
      setCompletedCrop(defaultCrop);
    };
  }, [imageUrl]);

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
    const left = positionX === 0 ? 0 : `-${positionX}px`;
    const top = positionY === 0 ? 0 : `-${positionY}px`;

    // set download url
    setDownloadUrl(
      `/crop/${avatarFileName}.png?x=${positionX}&y=${positionY}&width=${imageWidth}&height=${imageHeight}`,
    );

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
  }, [avatarFileName, completedCrop, previewSizes]);

  return (
    <Layout>
      <div className='flex flex-col items-center'>
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
          <img id='preview' src={imageUrl} alt='ava preview' style={avaPreviewStyles} />
        </AvaPreview>
      </div>

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
    </Layout>
  );
};

export default CropRoute;
