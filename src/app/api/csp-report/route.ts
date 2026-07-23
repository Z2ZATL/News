export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 16_384) return new Response(null, { status: 413 });
  try {
    await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  return new Response(null, { status: 204 });
}
