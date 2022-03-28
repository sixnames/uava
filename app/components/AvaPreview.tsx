import * as React from 'react';
import { avaSize } from '../configs/common';

const AvaPreview: React.FC = () => {
  return (
    <div className='relative mt-8 h-[256px] w-[256px] overflow-hidden rounded-full shadow-lg dark:shadow-2xl'>
      <img src='/ua-flag.png' width='256' height='256' alt='ukraine flag' />

      <div className='absolute top-[10px] left-[10px] h-[236px] w-[236px] cursor-pointer overflow-hidden rounded-full'>
        <img
          id='preview'
          src={'/default-ava.png'}
          className='absolute inset-0 h-[236px] w-[236px] cursor-pointer rounded-full'
          width={avaSize}
          height={avaSize}
          alt='default ava'
        />
      </div>
    </div>
  );
};

export default AvaPreview;
