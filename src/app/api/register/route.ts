import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호가 필요합니다." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "이미 가입된 이메일입니다." },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.user.create({
      data: { email, name: name ?? null, passwordHash },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    console.error("register error", error);
    return NextResponse.json(
      { error: "가입 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}


