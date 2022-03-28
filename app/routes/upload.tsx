import * as React from 'react';
import Layout from '../components/Layout';
import { Form, useSubmit, useTransition } from '@remix-run/react';
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
  const submit = useSubmit();
  const transition = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLFormElement>) {
    submit(event.currentTarget, { replace: true });
  }

  return (
    <Layout>
      <Form
        id={'upload-form'}
        className='flex flex-col items-center'
        encType='multipart/form-data'
        method='post'
        onChange={handleChange}
      >
        <div className='mt-12'>
          {transition.state === 'submitting' ? (
            <div>
              <div className='text-center'>
                <div className='text-xl'>Uploading...</div>
                <div>Please wait</div>
              </div>
            </div>
          ) : (
            <div className='relative'>
              <input
                id='file'
                name='file'
                type='file'
                accept='image/jpeg,image/png,image/jpg,image/webp,image/avif'
                className='absolute inset-0 z-20 block h-full w-full cursor-pointer opacity-0'
              />
              <div className='z-10 block flex h-12 items-center justify-center rounded-lg bg-yellow-300 px-8 font-bold text-blue-800'>
                Click to upload an image
              </div>
            </div>
          )}
        </div>
      </Form>
    </Layout>
  );
}
