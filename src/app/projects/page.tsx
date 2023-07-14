import Card from "@/components/Card";
import { env } from "@/env.mjs";
import { API_RES_GPDP } from "@/types/response-types";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Projects() {
  const allProjectQuery = await fetch(
    `${env.NEXT_PUBLIC_DOMAIN}/api/database/project/privilege-dependant/${
      cookies().get("emailToken")?.value
    }`,
    { method: "GET" }
  );

  const resData = (await allProjectQuery.json()) as API_RES_GPDP;
  const privilegeLevel = resData.privilegeLevel;
  console.log(resData);
  const projects = resData.rows;

  return (
    <div className="min-h-screen">
      <div className="h-[30vh] w-full bg-[url('/blueprint.jpg')] bg-cover bg-center bg-no-repeat">
        <div className="pt-24 text-center text-6xl font-extralight tracking-widest text-white">
          Projects
        </div>
      </div>
      <div className="px-12 py-6">
        {privilegeLevel == "admin" ? (
          <div className="flex justify-end">
            <Link
              href="/projects/create"
              className="rounded border border-black px-4 py-2 text-black dark:border-white dark:text-white dark:hover:bg-white dark:hover:bg-opacity-20 dark:active:bg-opacity-40"
            >
              Create Post
            </Link>
          </div>
        ) : null}
      </div>
      {projects && projects.length > 0 ? (
        <div className="mx-auto flex w-3/4 flex-col">
          {projects.map((project) => (
            <div key={project.id} className="my-4">
              <Card
                project={project}
                privilegeLevel={privilegeLevel}
                linkTarget={"projects"}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">No projects yet!</div>
      )}
    </div>
  );
}
