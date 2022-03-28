import * as React from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { Form } from '@remix-run/react';
import { ActionFunction, redirect, UploadHandler } from 'remix';
import { uploadStreamToCloudinary } from '../utils/cloudinary.server';
import { parseMultipartFormData } from '@remix-run/node/parseMultipartFormData';
import { avaSize, defaultCropSize } from '../configs/common';

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

export const action: ActionFunction = async ({ request }) => {
  const uploadHandler: UploadHandler = async ({ name, stream }) => {
    if (name !== 'file') {
      stream.resume();
      return;
    }
    const uploadedImage = await uploadStreamToCloudinary(stream);
    return uploadedImage?.url;
  };

  const formData = await parseMultipartFormData(request, uploadHandler);
  const file = formData.get('file');

  console.log('file', file);

  return redirect('/');
};

export default function Index() {
  const [crop, setCrop] = React.useState<Crop>();
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>();
  const [srcImg, setSrcImg] = React.useState<string>('');
  const [previewSizes, setPreviewSizes] = React.useState<Sizes>(defaultSizes);
  const isPreviewLoaded = srcImg && srcImg.length > 0;

  // revoke file preview
  React.useEffect(() => {
    return () => {
      if (isPreviewLoaded) {
        URL.revokeObjectURL(srcImg);
      }
    };
  }, [isPreviewLoaded, srcImg]);

  // upload handler
  const uploadHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const files = target.files;
    if (files && files[0]) {
      const file = files[0];
      const src = URL.createObjectURL(file);

      // get image sizes
      const reader = new FileReader();
      reader.onload = function () {
        const img = new Image();
        img.src = src;
        img.onload = function () {
          const cropImage = document.querySelector('#crop-image');
          if (cropImage) {
            const cropImageRect = cropImage.getBoundingClientRect();
            setPreviewSizes({
              width: cropImageRect.width,
              height: cropImageRect.height,
            });
          }

          // const path = e.path[0] || {};
          // const width = path.width;
          // const height = path.height;
          /*setSizes({
            width: width || defaultSizes.width,
            height: height || defaultSizes.height,
          });*/
        };
      };
      reader.readAsDataURL(file);

      setCrop(defaultCrop);
      setCompletedCrop(defaultCrop);
      setSrcImg(src);
    }
  };

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

  return (
    <div className='flex flex-col items-center bg-gray-200 px-6 py-24 text-slate-900 dark:bg-gray-800 dark:text-white'>
      <div className='mx-auto flex min-h-screen min-w-[320px] max-w-[480px] flex-col items-center'>
        {/*title*/}
        <h1 className='mb-4 text-2xl font-bold md:text-3xl'>UAVA</h1>
        <p>Russian warship, go f@ck yourself!</p>

        <Form className='flex flex-col items-center' encType='multipart/form-data' method='post'>
          {/*crop*/}
          {/*TODO input refs*/}
          {/*<input type={'hidden'} value={completedCrop?.height} name={'height'} />*/}
          {/*<input type={'hidden'} value={completedCrop?.width} name={'width'} />*/}
          {/*<input type={'hidden'} value={completedCrop?.x} name={'x'} />*/}
          {/*<input type={'hidden'} value={completedCrop?.y} name={'y'} />*/}
          {/*<input type={'hidden'} value={previewSizes.width} name={'previewWidth'} />*/}
          {/*<input type={'hidden'} value={previewSizes.height} name={'previewHeight'} />*/}

          {/*image*/}
          {isPreviewLoaded ? (
            <div className='mt-8'>
              <ReactCrop
                aspect={1}
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
              >
                <img id={'crop-image'} className='block' alt='Crop me' src={srcImg} />
              </ReactCrop>
            </div>
          ) : null}

          {/*ava preview*/}
          <div className='relative mt-8 h-[256px] w-[256px] overflow-hidden rounded-full shadow-lg dark:shadow-2xl'>
            <img src='/ua-flag.png' width='256' height='256' alt='ukraine flag' />

            <div className='absolute top-[10px] left-[10px] h-[236px] w-[236px] cursor-pointer overflow-hidden rounded-full'>
              {isPreviewLoaded ? (
                <img
                  id='preview'
                  src={srcImg}
                  width={avaSize}
                  height={avaSize}
                  alt='ava preview'
                  style={avaPreviewStyles}
                />
              ) : (
                <img
                  id='preview'
                  src={'/default-ava.png'}
                  className='absolute inset-0 h-[236px] w-[236px] cursor-pointer rounded-full'
                  width={avaSize}
                  height={avaSize}
                  alt='default ava'
                />
              )}
            </div>
            <input
              id='file'
              name='file'
              type='file'
              accept='image/jpeg,image/png,image/jpg,image/webp,image/avif'
              className='absolute inset-0 block h-full w-full cursor-pointer opacity-0'
              onChange={uploadHandler}
            />
          </div>

          {/*controls*/}
          <div className='mt-8 h-12'>
            {isPreviewLoaded ? (
              <div className='flex flex-wrap items-center justify-center gap-4'>
                {/*remove uploaded avatar button*/}
                <button
                  type='button'
                  onClick={() => {
                    setSrcImg('');
                    // setSizes(defaultSizes);
                  }}
                  className='h-12 w-[180px] rounded bg-red-800 font-bold uppercase text-white'
                >
                  Remove avatar
                </button>

                {/*download generated avatar button*/}
                <button
                  type='submit'
                  className='h-12 w-[180px] rounded bg-yellow-300 font-bold uppercase text-blue-800'
                >
                  Download avatar
                </button>
              </div>
            ) : (
              /*hint*/
              <div className='flex h-12 items-center text-center'>
                <span>Click on avatar preview or drag and drop your photo</span>
              </div>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
