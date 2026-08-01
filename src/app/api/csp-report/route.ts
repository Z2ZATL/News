import { readJsonBody, RequestBodyError } from "@/lib/request-body";
import { allowRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    if (!(await allowRequest(request, { limit: 10, scope: "csp-report", windowSeconds: 60 }))) {
      return new Response(null, { headers: { "Retry-After": "60" }, status: 429 });
    }
  } catch {
    return new Response(null, { headers: { "Retry-After": "60" }, status: 429 });
  }

  let payload: unknown;
  try {
    payload = await readJsonBody(request, {
      allowedContentTypes: ["application/csp-report", "application/json", "application/reports+json"],
      maximumBytes: 16_384,
    });
  } catch (error) {
    return new Response(null, {
      status: error instanceof RequestBodyError ? error.status : 400,
    });
  }

  const report = sanitizeReport(payload);
  if (report) console.info("csp_violation", report);
  return new Response(null, { status: 204 });
}

interface SafeCspReport {
  blockedOrigin?: string;
  disposition?: string;
  documentPath?: string;
  effectiveDirective?: string;
  statusCode?: number;
  violatedDirective?: string;
}

function stringField(
  value: Record<string, unknown>,
  camel: string,
  kebab: string,
): string | undefined {
  const field = value[camel] ?? value[kebab];
  return typeof field === "string" ? field.slice(0, 256) : undefined;
}

function safeUrl(value: string | undefined): URL | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}

function sanitizeReport(payload: unknown): SafeCspReport | null {
  if (!payload || typeof payload !== "object") return null;
  const envelope = payload as Record<string, unknown>;
  const raw = envelope["csp-report"] ?? envelope.body ?? envelope;
  if (typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const document = safeUrl(stringField(value, "documentURL", "document-uri"));
  const blocked = safeUrl(stringField(value, "blockedURL", "blocked-uri"));
  const status = value.statusCode ?? value["status-code"];

  return {
    ...(blocked ? { blockedOrigin: blocked.origin } : {}),
    ...(document ? { documentPath: document.pathname.slice(0, 256) } : {}),
    ...(typeof status === "number" ? { statusCode: status } : {}),
    ...optionalField(value, "disposition", "disposition"),
    ...optionalField(value, "effectiveDirective", "effective-directive"),
    ...optionalField(value, "violatedDirective", "violated-directive"),
  };
}

function optionalField(
  value: Record<string, unknown>,
  camel: keyof SafeCspReport,
  kebab: string,
): Partial<SafeCspReport> {
  const field = stringField(value, camel, kebab);
  return field ? { [camel]: field } : {};
}
