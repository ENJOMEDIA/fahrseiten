import { NextResponse } from "next/server";
import { parseStoredBlocks } from "@/modules/cms/block-schema";
import { isTrustedMutationRequest } from "@/modules/security/origin";
export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request))
    return new NextResponse(null, { status: 403 });
  if (process.env.NODE_ENV === "production")
    return new NextResponse(null, { status: 404 });
  try {
    const blocks = parseStoredBlocks(await request.json());
    return NextResponse.json({ saved: true, revision: blocks.length });
  } catch {
    return NextResponse.json({ saved: false }, { status: 422 });
  }
}
