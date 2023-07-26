import Card from "@/components/Card";
import { env } from "@/env.mjs";
import { API_RES_GetPrivilegeDependantBlogs } from "@/types/response-types";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default async function Blog() {
  const userID = cookies().get("userIDToken")?.value;

  const allBlogsQuery = await fetch(
    `${env.NEXT_PUBLIC_DOMAIN}/api/database/blog/privilege-dependant/${userID}`,
    { method: "GET", cache: "no-store" }
  );

  const resData =
    (await allBlogsQuery.json()) as API_RES_GetPrivilegeDependantBlogs;
  const privilegeLevel = resData.privilegeLevel;
  const blogs = resData.rows;

  return (
    <>
      <div className="min-h-screen overflow-x-hidden bg-white dark:bg-zinc-900">
        <div className="z-30">
          <div className="page-fade-in z-20 h-80 sm:h-96 md:h-[30vh] mx-auto">
            <div className="fixed w-full h-80 sm:h-96 md:h-[50vh] brightness-75 image-overlay">
              <Image
                src={"/manhattan-night-skyline.jpg"}
                alt="post-cover"
                fill={true}
                quality={100}
                priority={true}
                className="object-cover w-full h-80 sm:h-96 md:h-[50vh]"
              />
            </div>
            <div
              className={`text-shadow fixed top-36 sm:top-44 md:top-[20vh] w-full brightness-150 z-10 select-text text-center tracking-widest text-white`}
              style={{ pointerEvents: "none" }}
            >
              <div className="z-10 font-light tracking-widest text-3xl">
                Blog
              </div>
            </div>
          </div>
        </div>
        <div className="z-40 relative -mt-16 sm:-mt-20 md:mt-0 rounded-lg w-11/12 md:w-3/4 mx-auto min-h-screen shadow-2xl bg-zinc-50 dark:bg-zinc-800 pt-8 pb-24">
          <div>
            {privilegeLevel == "admin" ? (
              <div className="flex justify-end">
                <Link
                  href="/blog/create"
                  className="rounded border mr-4 dark:border-white border-zinc-800 px-4 py-2 dark:hover:bg-zinc-700 hover:bg-zinc-200 active:scale-90 transition-all duration-300 ease-out"
                >
                  Create Post
                </Link>
              </div>
            ) : null}
          </div>
          <Suspense
            fallback={
              <div className="mx-auto pt-24">
                <LoadingSpinner height={48} width={48} />
              </div>
            }
          >
            {blogs && blogs.length > 0 ? (
              <div className="mx-auto flex w-11/12 md:w-5/6 lg:w-3/4 flex-col">
                {blogs.map((blog) => (
                  <div key={blog.id} className="my-4">
                    <Card
                      project={blog}
                      privilegeLevel={privilegeLevel}
                      linkTarget={"blog"}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">No blogs yet!</div>
            )}
          </Suspense>
        </div>
      </div>
    </>
  );
}
