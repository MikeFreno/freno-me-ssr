"use client";

import Link from "next/link";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function CardLinks(props: {
  projectTitle: string;
  projectID: number;
  linkTarget: string;
  privilegeLevel: string;
}) {
  const [readLoading, setReadingLoading] = useState<boolean>(false);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  return (
    <div className="flex flex-row">
      <Link
        onClick={() => setReadingLoading(true)}
        href={`/${props.linkTarget}/${props.projectTitle}`}
        className={`${
          readLoading
            ? "bg-zinc-400"
            : props.linkTarget == "projects"
            ? "bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700"
            : "bg-orange-400 hover:bg-orange-500"
        }  active:scale-90 transition-all duration-300 ease-out text-white rounded px-4 py-2 flex`}
      >
        {readLoading ? <LoadingSpinner height={24} width={24} /> : "Read"}
      </Link>

      {props.privilegeLevel === "admin" && (
        <Link
          onClick={() => setEditLoading(true)}
          href={`/${props.linkTarget}/edit/${props.projectID}`}
          className={`${
            editLoading ? "bg-zinc-400" : "bg-green-400 hover:bg-green-500"
          } active:scale-90 flex transition-all duration-300 ease-out text-white rounded px-4 py-2 ml-2`}
        >
          {editLoading ? <LoadingSpinner height={24} width={24} /> : "Edit"}
        </Link>
      )}
    </div>
  );
}
