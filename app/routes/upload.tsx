import * as React from 'react';
import Layout from '../components/Layout';
import { Form } from '@remix-run/react';
import { avaSize } from '../configs/common';
import { ActionFunction, redirect, UploadHandler } from 'remix';
import { uploadStreamToCloudinary } from '../utils/cloudinary.server';
import { parseMultipartFormData } from '@remix-run/node/parseMultipartFormData';

export const action: ActionFunction = async ({ request }) => {
  const uploadHandler: UploadHandler = async ({ name, stream }) => {
    if (name !== 'file') {
      stream.resume();
      return;
    }
    const uploadedImage = await uploadStreamToCloudinary(stream);
    return uploadedImage?.public_id;
  };

  const formData = await parseMultipartFormData(request, uploadHandler);
  const avatarPublicId = formData.get('file');
  return redirect(`/crop/${avatarPublicId}`);
};

export default function Upload() {
  const [srcImg, setSrcImg] = React.useState<string>('');
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
      // const reader = new FileReader();
      // reader.readAsDataURL(file);
      setSrcImg(src);
    }
  };

  return (
    <Layout>
      <Form className='flex flex-col items-center' encType='multipart/form-data' method='post'>
        <div className='mt-12'>
          {isPreviewLoaded ? (
            <React.Fragment>
              <img
                src={srcImg}
                className='h-auto w-full'
                width={avaSize}
                height={avaSize}
                alt='ava preview'
              />

              {/*controls*/}
              <div className='mt-8 h-12'>
                <div className='flex flex-wrap items-center justify-center gap-4'>
                  {/*remove uploaded avatar button*/}
                  <button
                    type='button'
                    onClick={() => {
                      setSrcImg('');
                    }}
                    className='h-12 w-[180px] rounded bg-red-800 font-bold uppercase text-white'
                  >
                    Remove avatar
                  </button>

                  {/*upload an image and redirect to the crop page*/}
                  <button
                    type='submit'
                    className='h-12 w-[180px] rounded bg-yellow-300 font-bold uppercase text-blue-800'
                  >
                    Crop avatar
                  </button>
                </div>
              </div>
            </React.Fragment>
          ) : null}

          <div className={isPreviewLoaded ? 'relative opacity-0' : 'relative'}>
            <input
              id='file'
              name='file'
              type='file'
              accept='image/jpeg,image/png,image/jpg,image/webp,image/avif'
              className='absolute inset-0 z-20 block h-full w-full cursor-pointer opacity-0'
              onChange={uploadHandler}
            />
            <div className='z-10 block flex h-12 items-center justify-center rounded-lg bg-yellow-300 px-8 font-bold text-blue-800'>
              Click to upload an image
            </div>
          </div>
        </div>
      </Form>
    </Layout>
  );
}
