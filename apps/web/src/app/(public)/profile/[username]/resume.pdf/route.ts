import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  const res = await fetch(`${API_URL}/resumes/u/${username}/resume.pdf`, {
    redirect: "manual",
  });

  // The API returns a 302 redirect to the R2 PDF URL
  const location = res.headers.get("location");
  if (location) {
    return NextResponse.redirect(location);
  }

  // If no redirect (404 etc), forward the status
  const body = await res.json().catch(() => ({ message: "Resume not found" }));
  return NextResponse.json(body, { status: res.status });
}
