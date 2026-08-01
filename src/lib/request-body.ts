export class RequestBodyError extends Error {
  readonly status: 400 | 413 | 415;

  constructor(message: string, status: 400 | 413 | 415) {
    super(message);
    this.name = "RequestBodyError";
    this.status = status;
  }
}

function hasAllowedContentType(request: Request, allowed: readonly string[]): boolean {
  const value = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  return Boolean(value && allowed.includes(value));
}

export async function readBoundedBody(
  request: Request,
  options: Readonly<{ allowedContentTypes: readonly string[]; maximumBytes: number }>,
): Promise<string> {
  if (!hasAllowedContentType(request, options.allowedContentTypes)) {
    throw new RequestBodyError("Unsupported Media Type", 415);
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength) {
    const parsed = Number(declaredLength);
    if (!Number.isSafeInteger(parsed) || parsed < 0) {
      throw new RequestBodyError("Bad Request", 400);
    }
    if (parsed > options.maximumBytes) {
      throw new RequestBodyError("Payload Too Large", 413);
    }
  }

  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    let result = await reader.read();
    while (!result.done) {
      total += result.value.byteLength;
      if (total > options.maximumBytes) {
        await reader.cancel("Payload Too Large");
        throw new RequestBodyError("Payload Too Large", 413);
      }
      chunks.push(result.value);
      result = await reader.read();
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(body);
}

export async function readJsonBody(
  request: Request,
  options: Readonly<{ allowedContentTypes: readonly string[]; maximumBytes: number }>,
): Promise<unknown> {
  const body = await readBoundedBody(request, options);
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new RequestBodyError("Bad Request", 400);
  }
}
