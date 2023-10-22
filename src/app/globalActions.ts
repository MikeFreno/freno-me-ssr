"use server";

import { env } from "@/env.mjs";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ConnectionFactory } from "./utils";

export async function signOut() {
  try {
    cookies().set({
      name: "userIDToken",
      value: "",
      maxAge: 0,
      expires: new Date("2016-10-05"),
    });
  } catch (e) {
    console.log("error in action: " + e);
  }
}

interface ContactRequest {
  name: string;
  email: string;
  message: string;
}
export async function sendContactRequest({
  name,
  email,
  message,
}: ContactRequest) {
  const contactExp = cookies().get("contactRequestSent");
  let remaining = 0;
  if (contactExp) {
    const expires = new Date(contactExp?.value);
    remaining = expires.getTime() - Date.now();
  }
  if (remaining <= 0) {
    if (message && message.length <= 500) {
      const apiKey = env.SENDINBLUE_KEY as string;
      const apiUrl = "https://api.sendinblue.com/v3/smtp/email";

      const sendinblueData = {
        sender: {
          name: "freno.me",
          email: "michael@freno.me",
        },
        to: [
          {
            email: "michael@freno.me",
          },
        ],
        htmlContent: `<html><head></head><body><div>Request Name: ${name}</div><div>Request Email: ${email}</div><div>Request Message: ${message}</div></body></html>`,
        subject: `freno.me Contact Request`,
      };
      try {
        await fetch(apiUrl, {
          method: "POST",
          headers: {
            accept: "application/json",
            "api-key": apiKey,
            "content-type": "application/json",
          },
          body: JSON.stringify(sendinblueData),
        });
        const exp = new Date(Date.now() + 1 * 60 * 1000);
        cookies().set("contactRequestSent", exp.toUTCString());
        return "email sent";
      } catch (e) {
        console.log(e);
        return "SMTP server error: Sorry! You can reach me at michael@freno.me";
      }
    }
    return "message too long!";
  }
  return "countdown not expired";
}

interface deletePostInput {
  type: string;
  postId: number;
}
export async function deletePost({ type, postId }: deletePostInput) {
  const cookie = cookies().get("userIDToken");

  if (!cookie) {
    console.log("unauthorized");
    return "unauthorized";
  }

  let userID: string;

  try {
    userID = (
      await new Promise<JwtPayload>((resolve, reject) => {
        jwt.verify(cookie.value, env.JWT_SECRET_KEY, (err, decoded) => {
          if (err) {
            console.log("Failed to authenticate token.");
            reject(err);
          } else {
            resolve(decoded as JwtPayload);
          }
        });
      })
    ).id;
  } catch (e) {
    console.log(e);
    return "unauthorized";
  }

  if (userID == env.ADMIN_ID) {
    try {
      const conn = ConnectionFactory();
      const query = `DELETE FROM ${type} WHERE id = ?`;
      const params = [postId];
      const res = await conn.execute(query, params);
      console.log(res.statement);
      const commentDeleteQuery = `DELETE FROM Comment WHERE ${type}_id = ?`;
      const commentDeleteParams = [postId];
      const commentDeleteConn = await conn.execute(
        commentDeleteQuery,
        commentDeleteParams,
      );
      console.log(commentDeleteConn.statement);
      return "good";
    } catch (e) {
      console.log(e);
      return "failure. check server logs";
    }
  } else {
    console.log("unauthorized");
    return "unauthorized";
  }
}

interface incrementReadsInput {
  postID: number;
  postType: "Blog" | "Project";
}
export async function incrementReads({
  postID,
  postType,
}: incrementReadsInput) {
  const conn = ConnectionFactory();
  const query = `UPDATE ${postType} SET reads = reads + 1 WHERE id=?`;
  const params = [postID];
  await conn.execute(query, params);
}
