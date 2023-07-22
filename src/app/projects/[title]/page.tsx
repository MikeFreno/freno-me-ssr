import CommentIcon from "@/icons/CommentIcon";
import { env } from "@/env.mjs";
import Link from "next/link";
import { API_RES_GetProjectWithComments } from "@/types/response-types";
import Image from "next/image";
import { cookies } from "next/headers";
import SessionDependantLike from "@/components/SessionDependantLike";
import CommentSection from "@/components/CommentSection";
import { CommentReaction } from "@/types/model-types";
import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default async function DynamicProjectPost({
  params,
}: {
  params: { title: string };
}) {
  const projectQuery = await fetch(
    `${env.NEXT_PUBLIC_DOMAIN}/api/database/project/by-title/${params.title}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const parsedQueryRes =
    (await projectQuery.json()) as API_RES_GetProjectWithComments;

  const currentUserIDCookie = cookies().get("userIDToken");
  const privilegeLevel = currentUserIDCookie
    ? currentUserIDCookie.value == env.ADMIN_ID
      ? "admin"
      : "user"
    : "anonymous";

  const project = parsedQueryRes.project[0];

  const comments = parsedQueryRes.comments;
  const topLevelComments = parsedQueryRes.comments.filter(
    (comment) => comment.parent_comment_id == null
  );
  const likes = parsedQueryRes.likes;
  const reactionMap = new Map<number, CommentReaction[]>(
    parsedQueryRes.reactionArray
  );

  if (!project) {
    return (
      <>
        <div className="pt-[20vh] flex w-full justify-center text-4xl">
          No project found!
        </div>
        <div className="flex justify-center pt-12">
          <Link
            href="/projects"
            className="rounded border text-white shadow-md border-blue-500 bg-blue-400 hover:bg-blue-500 dark: dark:bg-blue-700 dark:hover:bg-blue-800 dark:border-blue-700 active:scale-90 transition-all duration-300 ease-in-out px-4 py-2"
          >
            Back to project main page
          </Link>
        </div>
      </>
    );
  } else if (project) {
    return (
      <div className="min-h-screen select-none">
        <div className="relative z-40 overflow-hidden">
          <div
            className="page-fade-in z-20 h-[50dvh] brightness-75 mx-auto w-full bg-cover bg-fixed bg-center bg-no-repeat image-overlay"
            style={{
              backgroundImage: `url(${
                project.banner_photo ? project.banner_photo : "/bitcoin.jpg"
              })`,
            }}
          >
            <div
              className={`text-shadow absolute md:fixed mt-48 w-full brightness-150 z-10 select-text text-center tracking-widest text-white`}
              style={{ pointerEvents: "none" }}
            >
              <div className="z-10 font-light tracking-widest text-3xl">
                {project.title}
                <div className="py-8 font-light tracking-widest text-xl">
                  {project.subtitle}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="z-40">
          <div className="flex justify-end pr-12 py-4 my-auto">
            <a href="#comments" className="mx-2">
              <div className="flex flex-col tooltip">
                <div className="mx-auto">
                  <CommentIcon strokeWidth={1} height={32} width={32} />
                </div>
                <div
                  className="my-auto pt-0.5 pl-2
              text-black dark:text-white text-sm"
                >
                  {comments.length}{" "}
                  {comments.length == 1 ? "Comment" : "Comments"}
                </div>
                <div className="tooltip-text -ml-[4.5rem]">
                  <div className="px-2 w-fit">Go to Comments</div>
                </div>
              </div>
            </a>
            <div className="mx-2">
              <SessionDependantLike
                currentUserID={currentUserIDCookie?.value}
                privilegeLevel={privilegeLevel}
                likes={likes}
                type={"project"}
                projectID={project.id}
              />
            </div>
          </div>
          <div
            className="px-12 md:px-28 lg:px-32 py-8 select-text"
            dangerouslySetInnerHTML={{ __html: project.body }}
          />
          <div className="mx-4 md:mx-8 lg:mx-12 pb-12">
            <Suspense
              fallback={
                <div className="mx-auto pt-24 w-full">
                  <LoadingSpinner height={48} width={48} />
                </div>
              }
            >
              <CommentSection
                privilegeLevel={privilegeLevel}
                allComments={comments}
                topLevelComments={topLevelComments}
                id={project.id}
                type={"project"}
                reactionMap={reactionMap}
                currentUserID={currentUserIDCookie?.value || ""}
              />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }
}
