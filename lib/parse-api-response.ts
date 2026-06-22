export async function parseApiResponse<T>(
  res: Response
): Promise<{ data: T | null; error: string | null }> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return {
      data: null,
      error: `Request failed (${res.status}). Please try again.`,
    };
  }
  return res.json() as Promise<{ data: T | null; error: string | null }>;
}
