import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type ApiResponse<T> = { data: T | null; error: string | null };

export function jsonResponse<T>(data: T, status = 200) {
  return Response.json({ data, error: null } satisfies ApiResponse<T>, { status });
}

export function jsonError(message: string, status = 400) {
  return Response.json({ data: null, error: message } satisfies ApiResponse<null>, { status });
}

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session;
}
