import { env } from "@/env.mjs";
import { ConnectionFactory } from "@/app/api/database/ConnectionFactory";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    if (context.params.id !== "undefined") {
      if (context.params.id == env.ADMIN_ID) {
        const conn = ConnectionFactory();
        const query = "SELECT * FROM Project";
        const params = [true];
        const res = await conn.execute(query, params);
        return NextResponse.json(
          { rows: res.rows, privilegeLevel: "admin" },
          { status: 200 }
        );
      } else {
        const conn = ConnectionFactory();
        const query = "SELECT * FROM Project WHERE Published = ?";
        const params = [true];
        const results = await conn.execute(query, params);
        return NextResponse.json(
          { rows: results.rows, privilegeLevel: "user" },
          { status: 200 }
        );
      }
    } else {
      const conn = ConnectionFactory();
      const query = "SELECT * FROM Project WHERE published = ?";
      const params = [true];
      const results = await conn.execute(query, params);
      return NextResponse.json(
        { rows: results.rows, privilegeLevel: "anonymous" },
        { status: 200 }
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { rows: [], privilegeLevel: "anonymous" },
      { status: 200 }
    );
  }
}
