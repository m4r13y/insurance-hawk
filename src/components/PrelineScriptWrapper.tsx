'use client';

import dynamic from 'next/dynamic';

const PrelineScript = dynamic(() => import('../app/PrelineScript'), {
  ssr: false,
});

export default function PrelineScriptWrapper() {
  return <PrelineScript />;
}