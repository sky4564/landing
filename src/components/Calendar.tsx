"use client";

import { useState, useMemo } from "react";

interface CalendarProps {
  /** 선택된 날짜 */
  selectedDate?: Date;
  /** 날짜 선택 핸들러 */
  onDateSelect?: (date: Date) => void;
  /** 날짜별 데이터 (날짜 문자열을 키로 사용, 예: "2024-12-18") */
  dateData?: Record<string, { income?: number; expense?: number }>;
}

/**
 * 월별 달력 컴포넌트
 * 
 * 한 달씩 달력을 표시하고, 날짜별 예산/지출 정보를 표시할 수 있습니다.
 * 
 * @example
 * ```tsx
 * <Calendar
 *   selectedDate={new Date()}
 *   onDateSelect={(date) => console.log(date)}
 *   dateData={{
 *     "2024-12-18": { income: 100000, expense: 50000 }
 *   }}
 * />
 * ```
 */
export function Calendar({
  selectedDate,
  onDateSelect,
  dateData = {},
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date()
  );

  // 현재 월의 첫 번째 날과 마지막 날
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  }, [currentMonth]);

  const lastDayOfMonth = useMemo(() => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  }, [currentMonth]);

  // 달력에 표시할 날짜들 생성 (이전 달의 마지막 주 + 현재 달 + 다음 달의 첫 주)
  const calendarDays = useMemo(() => {
    const days: Date[] = [];

    // 이전 달의 마지막 주 (첫 번째 날이 일요일이 아니면)
    const startDay = firstDayOfMonth.getDay(); // 0 (일요일) ~ 6 (토요일)
    const prevMonthLastDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0
    ).getDate();

    // 이전 달의 날짜들
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() - 1,
          prevMonthLastDay - i
        )
      );
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      );
    }

    // 다음 달의 첫 주 (마지막 날이 토요일이 아니면)
    const remainingDays = 42 - days.length; // 6주 * 7일 = 42
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day)
      );
    }

    return days;
  }, [firstDayOfMonth, lastDayOfMonth, currentMonth]);

  // 월 이동 함수들
  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  };

  // 날짜 포맷팅
  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // 날짜가 오늘인지 확인
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 날짜가 선택된 날짜인지 확인
  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // 날짜가 현재 월인지 확인
  const isCurrentMonth = (date: Date): boolean => {
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  };

  // 월 이름 포맷팅
  const monthYearLabel = `${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`;

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
      {/* 헤더: 월/년 표시 및 네비게이션 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="이전 달"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-white">{monthYearLabel}</h2>
          <button
            onClick={goToNextMonth}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="다음 달"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <button
          onClick={goToToday}
          className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-200 transition hover:bg-purple-500/20"
        >
          오늘
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const dateKey = formatDateKey(date);
          const data = dateData[dateKey];
          const isCurrentMonthDay = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          const isSelectedDate = isSelected(date);

          return (
            <button
              key={index}
              onClick={() => onDateSelect?.(date)}
              className={`
                relative rounded-lg border p-2 text-left transition
                ${!isCurrentMonthDay
                  ? "border-transparent bg-transparent text-slate-600"
                  : isSelectedDate
                    ? "border-purple-500 bg-purple-500/20 text-white"
                    : isTodayDate
                      ? "border-cyan-400/50 bg-cyan-400/10 text-white"
                      : "border-white/5 bg-white/5 text-slate-200 hover:border-white/10 hover:bg-white/10"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${isTodayDate ? "text-cyan-300" : ""
                    }`}
                >
                  {date.getDate()}
                </span>
              </div>
              {data && isCurrentMonthDay && (
                <div className="mt-1 space-y-0.5 text-xs">
                  {data.income !== undefined && data.income > 0 && (
                    <div className="text-emerald-400">
                      +{data.income.toLocaleString()}
                    </div>
                  )}
                  {data.expense !== undefined && data.expense > 0 && (
                    <div className="text-red-400">
                      -{data.expense.toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}


