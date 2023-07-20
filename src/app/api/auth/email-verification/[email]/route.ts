import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "@/env.mjs";
import { ConnectionFactory } from "@/app/api/database/ConnectionFactory";

export async function GET(
  request: NextRequest,
  context: { params: { email: string } }
) {
  const secretKey = env.JWT_SECRET_KEY;
  const params = request.nextUrl.searchParams;
  const token = params.get("token");
  console.log(token);
  const userEmail = context.params.email;
  try {
    if (token) {
      const decoded = jwt.verify(token, secretKey) as JwtPayload;
      if (decoded.email == userEmail) {
        const conn = ConnectionFactory();
        const query = `UPDATE User SET email_verified = ? WHERE email = ?`;
        const params = [true, userEmail];
        const res = await conn.execute(query, params);
        console.log(res);
        return new NextResponse(
          JSON.stringify({
            success: true,
            message: "email verification success, you may close this window",
          }),
          { status: 202, headers: { "content-type": "application/json" } }
        );
      }
    }
  } catch (err) {
    console.error("Invalid token:", err);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "authentication failed: Invalid token",
      }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  }
}
