import { StudioView } from "@/app/modules/studio/ui/view/studio-view";
import { DEFAULT_LIMIT } from "@/constants";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

const Page = async () => {
  prefetch(
    trpc.studio.getMany.infiniteQueryOptions({
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
