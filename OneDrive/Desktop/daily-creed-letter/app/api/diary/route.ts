import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { text, mood } = await req.json();

    if (!text || text.trim().length < 5) {
      return NextResponse.json(
        { error: "일기가 너무 짧아요. 최소 5자 이상 작성해주세요." },
        { status: 400 }
      );
    }

    const today = new Date();
    // 날짜만 00:00:00으로 맞추기 (시간 제거)
    const dateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // upsert: 오늘 날짜 일기가 있으면 업데이트, 없으면 생성
    const diary = await prisma.diaryEntry.upsert({
      where: { date: dateOnly },
      update: { text, mood },
      create: { date: dateOnly, text, mood },
    });

    return NextResponse.json({ ok: true, diary });
  } catch (error: any) {
    console.error("Diary save error:", error);
    return NextResponse.json(
      { error: "저장 중 오류가 발생했어요." },
      { status: 500 }
    );
  }
}

// GET 요청: 특정 날짜의 일기 조회 (옵션)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    let targetDate: Date;
    if (dateStr) {
      targetDate = new Date(dateStr);
    } else {
      // 날짜 파라미터가 없으면 오늘 일기
      const today = new Date();
      targetDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
    }

    const diary = await prisma.diaryEntry.findUnique({
      where: { date: targetDate },
    });

    if (!diary) {
      return NextResponse.json(
        { error: "해당 날짜의 일기가 없어요." },
        { status: 404 }
      );
    }

    return NextResponse.json({ diary });
  } catch (error: any) {
    console.error("Diary fetch error:", error);
    return NextResponse.json(
      { error: "조회 중 오류가 발생했어요." },
      { status: 500 }
    );
  }
}
