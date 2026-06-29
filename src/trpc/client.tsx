'use client';

import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import React, { useState } from 'react';
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';

export const trpc = createTRPCReact<AppRouter>();

let clientQueryClientSingleton: QueryClient;
function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  return (clientQueryClientSingleton ??= makeQueryClient());
}

function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return '';
    return process.env.NEXT_PUBLIC_APP_URL;
  })();
  return `${base}/api/trpc`;
}

let trpcClient: ReturnType<typeof trpc.createClient>;
function getTRPCClient() {
  return (trpcClient ??= trpc.createClient({
    links: [httpBatchLink({ url: getUrl() })],
  }));
}

export function TRPCProvider(props: Readonly<{ children: React.ReactNode }>) {
  const queryClient = getQueryClient();
  const [client] = useState(() => getTRPCClient());

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}


export const useTRPC = () => trpc;