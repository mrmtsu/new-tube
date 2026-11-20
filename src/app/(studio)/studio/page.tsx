import { StudioView } from "@/app/modules/studio/ui/views/studio-view";
import { DEFAULT_LIMIT } from "@/constants";
import {
  getStudiosInfiniteQueryOptions,
  HydrateClient,
  prefetch,
} from "@/trpc/server";

const Page = async () => {
  prefetch(
    getStudiosInfiniteQueryOptions({
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrateClient>
      <StudioView />
    </HydrateClient>
  );
};

export default Page;
