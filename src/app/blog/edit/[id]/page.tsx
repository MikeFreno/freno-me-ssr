import EditingClient from "@/components/EditingClient";
import LoadingSpinner from "@/components/LoadingSpinner";
import { env } from "@/env.mjs";
import { Blog } from "@/types/model-types";
import { Suspense } from "react";

export default async function ProjectEditing({
  params,
}: {
  params: { id: string };
}) {
  const res = await fetch(
    `${env.NEXT_PUBLIC_DOMAIN}/api/database/blog/by-id/${params.id}`,
    { method: "GET", cache: "no-store" }
  );
  const post = (await res.json()).blog as Blog;
  return (
    <>
      <Suspense
        fallback={
          <div className="pt-48">
            <LoadingSpinner height={48} width={48} />
          </div>
        }
      >
        <EditingClient post={post} type={"blog"} />
      </Suspense>
    </>
  );
}
