import { VideoView } from "@/app/modules/studio/ui/views/video-view";
import {
  getCategoriesQueryOptions,
  getStudioQueryOptions,
  HydrateClient,
  prefetch,
} from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ videoId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { videoId } = await params;

  void prefetch(getStudioQueryOptions({ id: videoId }));
  void prefetch(getCategoriesQueryOptions());

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default Page;
