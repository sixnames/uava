import { useDropzone } from 'react-dropzone';
import * as React from 'react';

/*const defaultCrop: Crop = {
  unit: 'px',
  width: 100,
  height: 100,
  x: 0,
  y: 0,
};*/

export default function Index() {
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
    <div className='flex flex-col items-center justify-center bg-gray-200 px-6 text-slate-900 dark:bg-gray-800 dark:text-white'>
      <div className='mx-auto flex min-h-screen min-w-[320px] max-w-[480px] flex-col items-center justify-center'>
        {/*title*/}
        <h1 className='mb-4 pt-24 text-2xl font-bold md:text-3xl'>UAVA</h1>
        <p>Russian warship, go f@ck yourself!</p>

        <form className='flex flex-col items-center justify-center' id='form'>
          {/*crop stage*/}
          {file && file.length > 0 ? <div className='mt-8' /> : null}

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

          {/*controls*/}
          <div className='mt-8 h-12 pb-24'>
            {file && file.length > 0 ? (
              <div className='flex flex-wrap items-center justify-center gap-4'>
                {/*remove uploaded avatar button*/}
                <button
                  type='button'
                  onClick={() => setFile('')}
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
