"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { videoUpdateSchema } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  LockIcon,
  MoreVerticalIcon,
  TrashIcon,
} from "lucide-react";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { VideoPlayer } from "@/app/modules/videos/ui/components/video-palyer";
import Link from "next/link";
import { snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface FormSectionProps {
  videoId: string;
}

export const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSkeleton = () => {
  return <p>Loading...</p>;
};

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: video } = useSuspenseQuery(
    trpc.studio.getOne.queryOptions({ id: videoId })
  );
  const { data: categories } = useSuspenseQuery(
    trpc.categories.getMany.queryOptions()
  );

  const update = useMutation(
    trpc.videos.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.studio.getMany.infiniteQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.studio.getOne.queryKey({ id: videoId }),
        });
        toast.success("Video updated");
      },
      onError: () => {
        toast.error("Something went wrong");
      },
    })
  );

  const remove = useMutation(
    trpc.videos.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.studio.getMany.infiniteQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.studio.getOne.queryKey({ id: videoId }),
        });
        toast.success("Video removed");
        router.push("/studio");
      },
      onError: () => {
        toast.error("Something went wrong");
      },
    })
  );

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  const onSubmit = async (data: z.infer<typeof videoUpdateSchema>) => {
    update.mutate(data);
  };

  const fullUrl = `${
    process.env.VERCEL_URL || "http://localhost:3000"
  }/videos/${video.id}`;
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Video details</h1>
            <p className="text-xs text-muted-foreground">
              Manage your video details
            </p>
          </div>
          <div className="flex items-center gap-x-2">
            <Button type="submit" disabled={update.isPending}>
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => remove.mutate({ id: videoId })}
                >
                  <TrashIcon className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="space-y-8 lg:col-span-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Add a title to your video" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      rows={10}
                      className="resize-none pr-10"
                      placeholder="Add a description to your video"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            {/* TODO: Add thumbnail field here */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </div>
          <div className="flex flex-col gap-y-8 lg:col-span-2">
            <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
              <div className="aspect-video overflow-hidden relative">
                <VideoPlayer
                  playbackId={video.muxPlaybackId}
                  thumbnailUrl={video.thumbnailUrl}
                />
              </div>
              <div className="p-4 flex flex-col gap-y-6">
                <div className="flex justify-between items-center gap-x-2">
                  <div className="flex flex-col gap-y-1">
                    <Link href={`/videos/${video.id}`}>
                      <p className="line-clamp-1 text-sm text-blue-500">
                        {fullUrl}
                      </p>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={onCopy}
                      disabled={isCopied}
                    >
                      {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-y-1">
                  <p className="text-muted-foreground text-xs">Video status</p>
                  <p className="">
                    {snakeCaseToTitle(video.muxStatus || "preparing")}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-y-1">
                  <p className="text-muted-foreground text-xs">
                    Subtitles status
                  </p>
                  <p className="">
                    {snakeCaseToTitle(video.muxTrackStatus || "no_subtitles")}
                  </p>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center">
                          <Globe2Icon className="size-4 mr-2" />
                          Public
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center">
                          <LockIcon className="size-4 mr-2" />
                          Private
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </div>
        </div>
      </form>
    </Form>
  );
};
