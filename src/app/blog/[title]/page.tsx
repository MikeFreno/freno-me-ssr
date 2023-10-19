import "@/styles/content.scss";
import CommentIcon from "@/icons/CommentIcon";
import { env } from "@/env.mjs";
import Link from "next/link";
import Image from "next/image";
import SessionDependantLike from "@/components/SessionDependantLike";
import { Blog, CommentReaction, Comment, BlogLike } from "@/types/model-types";
import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import PostBodyClient from "@/components/PostBodyClient";
import { incrementReads } from "@/app/globalActions";
import { ConnectionFactory, getPrivilegeLevel, getUserID } from "@/app/utils";
import CommentSectionWrapper from "@/components/CommentSectionWrapper";

function hasCodeBlock(str: string): boolean {
  return str.includes("<code") && str.includes("</code>");
}

export default async function DynamicBlogPost({
  params,
}: {
  params: { title: string };
}) {
  let userID: string | null = null;
  const privilegeLevel = await getPrivilegeLevel();
  userID = await getUserID();
  let query = "SELECT * FROM Blog WHERE title = ?";
  if (privilegeLevel !== "admin") {
    query += ` AND published = TRUE`;
  }
  const conn = ConnectionFactory();
  const blog = (await conn.execute(query, [decodeURIComponent(params.title)]))
    .rows[0] as Blog;
  const containsCodeBlock = hasCodeBlock(blog.body);

  if (!blog) {
    return (
      <>
        <div className="flex w-full justify-center pt-[20vh] text-4xl">
          No blog found!
        </div>
        <div className="flex justify-center pt-12">
          <Link
            href="/blog"
            className="dark: rounded border border-blue-500 bg-blue-400 px-4 py-2 text-white shadow-md transition-all duration-300 ease-in-out hover:bg-blue-500 active:scale-90 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Back to blog main page
          </Link>
        </div>
      </>
    );
  } else if (blog) {
    let comments: Comment[];
    let likes;
    let reactionMap: Map<number, CommentReaction[]> = new Map();
    const commentQuery = "SELECT * FROM Comment WHERE blog_id = ?";
    comments = (await conn.execute(commentQuery, [blog.id])).rows as Comment[];

    let commenterToCommentIDMap = new Map<string, number[]>();
    comments.forEach((comment) => {
      const prev = commenterToCommentIDMap.get(comment.commenter_id) || [];
      commenterToCommentIDMap.set(comment.commenter_id, [...prev, comment.id]);
    });
    let commentIDToCommenterMap = new Map<
      { email?: string; display_name?: string; image?: string | undefined },
      number[]
    >();
    const commenterQuery =
      "SELECT email, display_name, image FROM User WHERE id = ?";

    let promises = Array.from(commenterToCommentIDMap.keys()).map(
      async (key) => {
        const value = commenterToCommentIDMap.get(key) as number[];
        const res = await conn.execute(commenterQuery, [key]);
        const user = res.rows[0] as {
          email?: string;
          display_name?: string;
          image?: string;
        };
        commentIDToCommenterMap.set(user, value);
      },
    );

    await Promise.all(promises);

    const topLevelComments = comments.filter(
      (comment) => comment.parent_comment_id == null,
    );
    const blogLikesQuery = "SELECT * FROM BlogLike WHERE blog_id = ?";
    likes = (await conn.execute(blogLikesQuery, [blog.id])).rows as BlogLike[];
    for (const comment of comments) {
      const reactionQuery =
        "SELECT * FROM CommentReaction WHERE comment_id = ?";
      const reactionParam = [comment.id];
      const res = await conn.execute(reactionQuery, reactionParam);
      reactionMap.set(comment.id, res.rows as CommentReaction[]);
    }
    incrementReads({ postID: blog.id, postType: "Blog" });
    return (
      <div className="select-none overflow-x-hidden">
        <div className="z-30">
          <div className="page-fade-in z-20 mx-auto h-80 sm:h-96 md:h-[50vh]">
            <div className="image-overlay fixed h-80 w-full brightness-75 sm:h-96 md:h-[50vh]">
              <Image
                src={blog.banner_photo ? blog.banner_photo : "/blueprint.jpg"}
                alt="post-cover"
                width={1000}
                height={1000}
                quality={100}
                priority={true}
                className="h-80 w-full object-cover sm:h-96 md:h-[50vh]"
              />
            </div>
            <div
              className={`text-shadow fixed top-36 sm:top-44 md:top-[20vh] w-full brightness-150 z-10 select-text text-center tracking-widest text-white`}
              style={{ pointerEvents: "none" }}
            >
              <div className="z-10 text-3xl font-light tracking-widest">
                {blog.title.replaceAll("_", " ")}
                <div className="py-8 text-xl font-light tracking-widest">
                  {blog.subtitle}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-40 bg-zinc-100 pb-24 dark:bg-zinc-800">
          {privilegeLevel == "admin" ? (
            <div className="flex justify-center pt-4 md:-mb-8">
              <Link
                className="rounded border border-blue-500 bg-blue-400 px-4 py-2 text-white shadow-md transition-all duration-300  ease-in-out hover:bg-blue-500 active:scale-90 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                href={`${env.NEXT_PUBLIC_DOMAIN}/blog/edit/${blog.id}`}
              >
                Edit
              </Link>
            </div>
          ) : null}
          <div className="my-auto flex justify-center py-4 md:justify-end md:pr-12">
            <a href="#comments" className="mx-2">
              <div className="tooltip flex flex-col">
                <div className="mx-auto">
                  <CommentIcon strokeWidth={1} height={32} width={32} />
                </div>
                <div
                  className="my-auto pl-2 pt-0.5
              text-sm text-black dark:text-white"
                >
                  {comments.length}{" "}
                  {comments.length == 1 ? "Comment" : "Comments"}
                </div>
                <div className="tooltip-text -ml-[4.5rem]">
                  <div className="w-fit px-2">Go to Comments</div>
                </div>
              </div>
            </a>
            <div className="mx-2">
              <SessionDependantLike
                currentUserID={userID}
                privilegeLevel={privilegeLevel}
                likes={likes}
                type={"blog"}
                projectID={blog.id}
              />
            </div>
          </div>
          <div className="flex justify-center italic md:justify-start md:pl-24">
            Written {`${new Date(blog.date).toDateString()}`}
            <br />
            By Michael Freno
          </div>
          <PostBodyClient
            body={blog.body}
            hasCodeBlock={containsCodeBlock}
            banner_photo={blog.banner_photo}
          />
          <div className="mx-4 pb-12 md:mx-8 lg:mx-12">
            <Suspense
              fallback={
                <div className="mx-auto w-full pt-24">
                  <LoadingSpinner height={48} width={48} />
                </div>
              }
            >
              <CommentSectionWrapper
                privilegeLevel={privilegeLevel}
                allComments={comments}
                topLevelComments={topLevelComments}
                id={blog.id}
                type={"blog"}
                reactionMap={reactionMap}
                currentUserID={userID || ""}
                userCommentMap={commentIDToCommenterMap}
              />
            </Suspense>
          </div>
        </div>
      </div>
    );
  }
}
