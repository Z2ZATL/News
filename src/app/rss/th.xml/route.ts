import { createRss } from "@/lib/rss";

export async function GET() {
  return createRss("th");
}
