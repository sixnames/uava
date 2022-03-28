import * as React from 'react';

const Layout: React.FC = ({ children }) => {
  return (
    <div className='flex flex-col items-center bg-gray-200 px-6 py-24 text-slate-900 dark:bg-gray-800 dark:text-white'>
      <div className='mx-auto flex min-h-screen min-w-[320px] max-w-[480px] flex-col items-center'>
        <h1 className='mb-4 text-3xl'>UAVA</h1>
        <p>Russian warship, go f@ck yourself!</p>
        {children}
      </div>
    </div>
  );
};

export default Layout;
