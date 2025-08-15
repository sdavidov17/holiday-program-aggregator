import { createNextApiHandler } from '@trpc/server/adapters/next';

import { env } from '~/env.mjs';
import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';

export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === 'development'
      ? ({ path, error, type, ctx, input }) => {
          console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
          console.error('Error details:', {
            path,
            type,
            input,
            code: error.code,
            httpStatus: (error as any).httpStatus,
            cause: error.cause,
          });
        }
      : undefined,
});
