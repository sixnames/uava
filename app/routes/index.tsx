import { useDropzone } from 'react-dropzone';
import * as React from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';

const defaultCropSize = 50;
const defaultCrop: PixelCrop = {
  unit: 'px',
  width: defaultCropSize,
  height: defaultCropSize,
  x: 5,
  y: 5,
};

const avaSize = 236;

interface Sizes {
  width: number;
  height: number;
}

const defaultSizes: Sizes = {
  width: 1,
  height: 1,
};

export default function Index() {
  const [crop, setCrop] = React.useState<Crop>();
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>();
  const [srcImg, setSrcImg] = React.useState<string>('');
  const [previewSizes, setPreviewSizes] = React.useState<Sizes>(defaultSizes);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/jpeg,image/png',
    // set file preview
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
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
    },
  });

  // revoke file preview
  React.useEffect(() => {
    return () => {
      if (srcImg && srcImg.length > 0) {
        URL.revokeObjectURL(srcImg);
      }
    };
  }, [srcImg]);

  const isPreviewLoaded = srcImg && srcImg.length > 0;

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

    // console.log(completedCrop);
    /*console.log({
      // cropPositionY,
      // cropPositionX,
      // positionX: (cropPositionY * sizes.height) / previewSizes.height,
      // positionY: (cropPositionX * sizes.width) / previewSizes.width,
      positionY,
      top,
      left,
      width: imageWidth,
      height: imageHeight,
    });*/

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
    <div className='flex flex-col items-center justify-center bg-gray-200 px-6 text-slate-900 dark:bg-gray-800 dark:text-white'>
      <div className='mx-auto flex min-h-screen min-w-[320px] max-w-[480px] flex-col items-center justify-center'>
        {/*title*/}
        <h1 className='mb-4 pt-24 text-2xl font-bold md:text-3xl'>UAVA</h1>
        <p>Russian warship, go f@ck yourself!</p>

        <form className='flex flex-col items-center justify-center' id='form'>
          {/*crop*/}
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
          <div
            {...getRootProps()}
            className='relative mt-8 h-[256px] w-[256px] overflow-hidden rounded-full shadow-lg dark:shadow-2xl'
          >
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
            <input {...getInputProps()} />
          </div>

          {/*controls*/}
          <div className='mt-8 h-12 pb-24'>
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
                  type='button'
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
        </form>
      </div>
    </div>
  );
}
