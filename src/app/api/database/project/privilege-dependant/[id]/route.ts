import { env } from "@/env.mjs";
import { ConnectionFactory } from "@/app/api/database/ConnectionFactory";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    console.log("param: " + context.params.id);
    if (context.params.id !== ("undefined" || undefined)) {
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
    console.log(e);
    return NextResponse.json(
      { rows: [], privilegeLevel: "anonymous" },
      { status: 200 }
    );
  }
}
