'use client';

import dynamic from 'next/dynamic';

const AppLayout = dynamic(
  () => import('@/components/layout/AppLayout').then((mod) => mod.AppLayout),
  { ssr: false }
);

export default function HomePage() {
  return <AppLayout />;
}
