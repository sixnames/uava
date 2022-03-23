import { useDropzone } from 'react-dropzone';
import * as React from 'react';

export default function Index() {
  // file preview
  const [file, setFile] = React.useState<string>('');

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/jpeg,image/png',
    // set file preview
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(URL.createObjectURL(acceptedFiles[0]));
      }
    },
  });

  // revoke file preview
  React.useEffect(() => {
    return () => {
      if (file && file.length > 0) {
        URL.revokeObjectURL(file);
      }
    };
  }, [file]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-200 text-slate-900 dark:bg-gray-800 dark:text-white'>
      {/*title*/}
      <h1 className='mb-4 pt-24 text-2xl font-bold md:text-3xl'>UAVA</h1>
      <p>Russian warship, go f@ck yourself!</p>

      <form id='form'>
        {/*ava preview*/}
        <div
          {...getRootProps()}
          className='relative mt-8 h-[256px] w-[256px] overflow-hidden rounded-full shadow-lg dark:shadow-2xl'
        >
          <img src='/ua-flag.png' width='256' height='256' alt='ukraine flag' />
          <img
            src={file && file.length > 0 ? file : '/default-ava.png'}
            className='absolute top-[10px] left-[10px] h-[236px] w-[236px] cursor-pointer rounded-full'
            width='236'
            height='236'
            alt='default ava'
          />
          <input {...getInputProps()} />
        </div>
      </form>

      <div className='mt-8 h-12 pb-24'>
        {/*remove uploaded avatar button*/}
        {file && file.length > 0 ? (
          <button
            type='button'
            onClick={() => setFile('')}
            className='h-12 w-[180px] rounded bg-red-800 font-bold uppercase text-white'
          >
            Remove avatar
          </button>
        ) : null}
      </div>
    </div>
  );
}
