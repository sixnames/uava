import * as React from 'react';
import Layout from '../components/Layout';
import { LoaderFunction, useLoaderData } from 'remix';
import { flagSize } from '../configs/common';

export interface DownloadRouteDataInterface {
  imageUrl: string | null;
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get('url');
  const data: DownloadRouteDataInterface = {
    imageUrl,
  };

  return data;
};

const DownloadRoute: React.FC = () => {
  const { imageUrl } = useLoaderData();
  return (
    <Layout>
      <div className='mt-8 flex flex-col items-center justify-center gap-8'>
        <img src={imageUrl} width={flagSize} height={flagSize} alt='avatar' />

        {/*download generated avatar button*/}
        <a
          href={imageUrl}
          target={'_blank'}
          download='uava-avatar.png'
          className='flex h-12 w-[180px] items-center justify-center rounded bg-yellow-300 font-bold text-blue-800 disabled:bg-gray-700 disabled:text-white disabled:opacity-80'
          rel='noreferrer'
        >
          Download avatar
        </a>
      </div>
    </Layout>
  );
};

export default DownloadRoute;
