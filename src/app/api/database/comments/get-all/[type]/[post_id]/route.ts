import { ConnectionFactory } from "@/app/api/database/ConnectionFactory";
import { NextResponse } from "next/server";

export async function GET(context: {
  params: { type: string; post_id: string };
}) {
  const conn = ConnectionFactory();
  const query = `SELECT * FROM Comment WHERE ${context.params.type}_id = ?`;
  const params = [context.params.post_id];
  const res = await conn.execute(query, params);
  return NextResponse.json({ comments: res.rows }, { status: 302 });
}
