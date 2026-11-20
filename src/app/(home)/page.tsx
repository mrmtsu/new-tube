import {
  getCategoriesQueryOptions,
  HydrateClient,
  prefetch,
} from "@/trpc/server";
import { HomeView } from "../modules/home/ui/views/home-view";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

const Home = async ({ searchParams }: PageProps) => {
  const { categoryId } = await searchParams;

  prefetch(getCategoriesQueryOptions());

  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Home;
