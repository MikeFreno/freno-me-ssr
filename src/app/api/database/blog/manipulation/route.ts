import { NextRequest, NextResponse } from "next/server";
import { ConnectionFactory } from "../../ConnectionFactory";
import { cookies } from "next/headers";
import { env } from "@/env.mjs";

interface POSTInputData {
  title: string;
  subtitle: string | null;
  body: string | null;
  banner_photo: string | null;
  published: boolean;
}

interface PATCHInputData {
  id: number;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  banner_photo: string | null;
  published: boolean | null;
}

export async function POST(input: NextRequest) {
  try {
    const inputData = (await input.json()) as POSTInputData;
    const { title, subtitle, body, banner_photo, published } = inputData;
    const userIDCookie = cookies().get("userIDToken");
    const fullURL = env.NEXT_PUBLIC_AWS_BUCKET_STRING + banner_photo;

    if (userIDCookie) {
      const author_id = userIDCookie.value;
      const conn = ConnectionFactory();
      const query = `
    INSERT INTO Blog (title, subtitle, body, banner_photo, published, author_id)
    VALUES (?, ?, ?, ?, ?, ?)
    `;
      const params = [
        title,
        subtitle,
        body,
        banner_photo ? fullURL : null,
        published,
        author_id,
      ];
      const results = await conn.execute(query, params);
      console.log(results);
      return NextResponse.json({ data: results.insertId }, { status: 201 });
    }
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e }, { status: 400 });
  }
}
export async function PATCH(input: NextRequest) {
  try {
    const inputData = (await input.json()) as PATCHInputData;

    const conn = ConnectionFactory();
    const { query, params } = createUpdateQuery(inputData);
    console.log("query: " + query, "params: " + params);
    const results = await conn.execute(query, params);
    return NextResponse.json({ data: results.insertId }, { status: 201 });
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e }, { status: 400 });
  }
}

function createUpdateQuery(data: PATCHInputData) {
  const { id, title, subtitle, body, banner_photo, published } = data;

  let query = "UPDATE Blog SET ";
  let params = [];
  let first = true;

  if (title !== null) {
    query += first ? "title = ?" : ", title = ?";
    params.push(title);
    first = false;
  }

  if (subtitle !== null) {
    query += first ? "subtitle = ?" : ", subtitle = ?";
    params.push(subtitle);
    first = false;
  }

  if (body !== null) {
    query += first ? "body = ?" : ", body = ?";
    params.push(body);
    first = false;
  }

  if (banner_photo !== null) {
    query += first ? "banner_photo = ?" : ", banner_photo = ?";
    if (banner_photo == "_DELETE_IMAGE_") {
      params.push(undefined);
    } else {
      params.push(env.NEXT_PUBLIC_AWS_BUCKET_STRING + banner_photo);
    }
    first = false;
  }

  if (published !== null) {
    query += first ? "published = ?" : ", published = ?";
    params.push(published);
    first = false;
  }

  query += first ? "author_id = ?" : ", author_id = ?";
  params.push(cookies().get("userIDToken")?.value);

  query += " WHERE id = ?";
  params.push(id);

  return { query, params };
}
