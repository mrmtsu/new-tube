import { categoriesRouter } from "@/app/modules/categories/server/procedures";
import { createTRPCRouter } from "../init";
import { studioRouter } from "@/app/modules/studio/server/procedures";
import { videosRouter } from "@/app/modules/videos/server/prrocedures";
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
