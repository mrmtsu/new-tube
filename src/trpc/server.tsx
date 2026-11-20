import "server-only"; // <-- ensure this file cannot be imported from the client
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";
import { createTRPCClient, httpLink } from "@trpc/client";
// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});
// If your router is on a separate server, pass a client:
createTRPCOptionsProxy({
  client: createTRPCClient({
    links: [httpLink({ url: "..." })],
  }),
  queryClient: getQueryClient,
});
export const caller = appRouter.createCaller(createTRPCContext);
export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

const categoriesQueryOptions = () =>
  trpc.categories.getMany.queryOptions();
type CategoriesQueryOptions = ReturnType<typeof categoriesQueryOptions>;

export function getCategoriesQueryOptions() {
  return {
    kind: "categories",
    queryOptions: categoriesQueryOptions(),
  } satisfies { kind: "categories"; queryOptions: CategoriesQueryOptions };
}

const studioQueryOptions = (input: { id: string }) =>
  trpc.studio.getOne.queryOptions(input);
type StudioQueryOptions = ReturnType<typeof studioQueryOptions>;

export function getStudioQueryOptions(input: { id: string }) {
  return {
    kind: "studio",
    queryOptions: studioQueryOptions(input),
  } satisfies { kind: "studio"; queryOptions: StudioQueryOptions };
}

const studiosInfiniteQueryOptions = (input: { limit: number }) =>
  trpc.studio.getMany.infiniteQueryOptions(input);
type StudiosInfiniteQueryOptions = ReturnType<
  typeof studiosInfiniteQueryOptions
>;

export function getStudiosInfiniteQueryOptions(input: { limit: number }) {
  return {
    kind: "studios-infinite",
    queryOptions: studiosInfiniteQueryOptions(input),
  } satisfies {
    kind: "studios-infinite";
    queryOptions: StudiosInfiniteQueryOptions;
  };
}

type QueryOptions =
  | { kind: "categories"; queryOptions: CategoriesQueryOptions }
  | { kind: "studio"; queryOptions: StudioQueryOptions }
  | {
      kind: "studios-infinite";
      queryOptions: StudiosInfiniteQueryOptions;
    };

export function prefetch(queryOptions: QueryOptions) {
  const queryClient = getQueryClient();
  switch (queryOptions.kind) {
    case "categories":
      void queryClient.prefetchQuery(queryOptions.queryOptions);
      break;
    case "studio":
      void queryClient.prefetchQuery(queryOptions.queryOptions);
      break;
    case "studios-infinite":
      void queryClient.prefetchInfiniteQuery(queryOptions.queryOptions);
      break;
    default: {
      const _exhaustive: never = queryOptions;
      return _exhaustive;
    }
  }
}
