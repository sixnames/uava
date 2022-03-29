import * as React from 'react';
import { LoaderFunction, Outlet, redirect } from 'remix';
import Layout from '../components/Layout';

export const loader: LoaderFunction = async () => {
  return redirect('/upload');
};

export default function Index() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
