import { NextResponse } from "next/server";
import { listMembers } from "@/lib/store";

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET(request) {
  const token = request.nextUrl.searchParams.get("token") || request.headers.get("x-admin-token");
  if (!process.env.ADMIN_EXPORT_TOKEN || token !== process.env.ADMIN_EXPORT_TOKEN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rows = await listMembers();
  const header = ["full_name", "email", "instagram", "creative_field", "verified", "created_at"];
  const csv = [
    header.join(","),
    ...rows.map((row) => header.map((key) => csvEscape(row[key])).join(","))
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=nexwave-members.csv"
    }
  });
}
