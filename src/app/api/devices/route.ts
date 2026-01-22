import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const deviceSchema = z.object({
  serialNumber: z.string().min(3).max(120),
  barcode: z.string().min(3).max(120).optional(),
  name: z.string().min(2).max(120).optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Neoprávnený prístup." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ devices: [] });
  }

  const devices = await prisma.device.findMany({
    where: {
      OR: [
        { serialNumber: { contains: query, mode: "insensitive" } },
        { barcode: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 25,
  });

  return NextResponse.json({ devices });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = deviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatné údaje." }, { status: 400 });
  }

  const device = await prisma.device.create({
    data: parsed.data,
  });

  return NextResponse.json({ device }, { status: 201 });
}
