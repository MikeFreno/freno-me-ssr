import { NextResponse } from "next/server";
import { ConnectionFactory } from "../../ConnectionFactory";

export async function GET() {
  const conn = ConnectionFactory();
  const query = `SELECT * FROM Comment`;
  const res = await conn.execute(query);
  return NextResponse.json({ comments: res.rows });
}
