import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "members.json");

function supabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
}

async function readLocal() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(dataFile, "utf8"));
  } catch {
    return [];
  }
}

async function writeLocal(rows) {
  await fs.writeFile(dataFile, JSON.stringify(rows, null, 2));
}

export async function findMemberByEmail(email) {
  const db = supabase();
  if (db) {
    const { data, error } = await db.from("members").select("*").eq("email", email).maybeSingle();
    if (error) throw error;
    return data;
  }

  const rows = await readLocal();
  return rows.find((row) => row.email === email) || null;
}

export async function savePendingMember(member) {
  const now = new Date().toISOString();
  const payload = { ...member, verified: false, created_at: now, updated_at: now };
  const db = supabase();

  if (db) {
    const { data, error } = await db.from("members").upsert(payload, { onConflict: "email" }).select().single();
    if (error) throw error;
    return data;
  }

  const rows = await readLocal();
  const index = rows.findIndex((row) => row.email === member.email);
  if (index >= 0) rows[index] = { ...rows[index], ...payload };
  else rows.push(payload);
  await writeLocal(rows);
  return payload;
}

export async function verifyMember(email) {
  const now = new Date().toISOString();
  const db = supabase();

  if (db) {
    const { data, error } = await db
      .from("members")
      .update({ verified: true, verified_at: now, updated_at: now })
      .eq("email", email)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const rows = await readLocal();
  const index = rows.findIndex((row) => row.email === email);
  if (index === -1) return null;
  rows[index] = { ...rows[index], verified: true, verified_at: now, updated_at: now };
  await writeLocal(rows);
  return rows[index];
}

export async function listMembers() {
  const db = supabase();
  if (db) {
    const { data, error } = await db.from("members").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  return readLocal();
}
