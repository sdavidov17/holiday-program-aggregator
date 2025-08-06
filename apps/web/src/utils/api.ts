import { type AppRouter } from "~/server/api/root";
import { createTRPCNext } from "@trpc/next";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          headers() {
            return {
              "content-type": "application/json",
            };
          },
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            }).then(async (response) => {
              if (response.ok) {
                return response;
              }
              
              // Check if response is HTML (likely an error page)
              const contentType = response.headers.get("content-type");
              if (contentType?.includes("text/html")) {
                const text = await response.text();
                console.error("Received HTML instead of JSON:", text.substring(0, 200));
                throw new Error("API returned HTML instead of JSON. This might indicate an authentication or routing issue.");
              }
              
              return response;
            });
          },
        }),
      ],
    };
  },
  transformer: superjson,
  ssr: false,
});

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;