import { User } from "@/types/model-types";
import { ConnectionFactory } from "@/app/api/database/ConnectionFactory";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  if (context.params.id !== "undefined") {
    const conn = ConnectionFactory();
    const userQuery = "SELECT * FROM User WHERE id =?";
    const userParams = [context.params.id];
    const res = await conn.execute(userQuery, userParams);
    const user = res.rows[0] as User;
    return NextResponse.json(
      {
        email: user.email,
        id: user.id,
        image: user.image,
      },
      { status: 202 }
    );
  } else {
    return NextResponse.json({ status: 204 });
  }
}
