import { VideoView } from "@/app/modules/studio/ui/views/video-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ videoId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { videoId } = await params;

  void prefetch(trpc.studio.getOne.queryOptions({ id: videoId }));
  void prefetch(trpc.categories.getMany.queryOptions());

  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
};

export default Page;
