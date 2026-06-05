import { NextResponse } from "next/server";
import { isWallboxAdminAuthorized } from "@/lib/config/admin-auth";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const key = String(form?.get("key") || "");

  if (!isWallboxAdminAuthorized(key)) {
    return NextResponse.redirect(new URL("/admin?invalid=1", request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  response.cookies.set("wallbox_admin", key, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 6,
  });
  return response;
}

export async function DELETE(request: Request) {
  const response = NextResponse.json({ status: "ok" });
  response.cookies.set("wallbox_admin", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
