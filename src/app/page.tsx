import { BalanceCard } from "@/components/BalanceCard";
import Link from "next/link";

const features = [
  {
    title: "수입·지출 자동 정리",
    desc: "계좌 내역, 카드 사용을 하루 한 번 묶어서 카테고리별로 정리해 줍니다.",
    badge: "자동화",
  },
  {
    title: "가족과 공유되는 공동 가계부",
    desc: "배우자·부모님·자녀와 폴더별로 권한을 나누고 함께 기록합니다.",
    badge: "공동 관리",
  },
  {
    title: "영수증 캡처 + 보관",
    desc: "영수증을 찍으면 항목과 금액을 인식해 월별 영수증 박스에 저장합니다.",
    badge: "보관함",
  },
];

const steps = [
  {
    title: "예산 세우기",
    text: "월 예산을 카테고리별로 설정하고, 초과 예상 시 알림을 받습니다.",
  },
  {
    title: "자동 분류 & 알림",
    text: "하루 한 번 새 내역을 불러오고, 이상 지출이나 중복 결제를 알려줍니다.",
  },
  {
    title: "공유 & 리포트",
    text: "공유 멤버와 실시간으로 맞추고, 주간·월간 리포트를 PDF로 저장합니다.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-purple-600/40 blur-[120px]" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-indigo-500/40 blur-[130px]" />
        <div className="absolute left-20 bottom-10 h-64 w-64 rounded-full bg-cyan-500/30 blur-[110px]" />
      </div>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-20 px-6 py-16 md:py-24">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium shadow-lg shadow-purple-500/10 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              LifeTools 가계부 · 자동 정리 + 가족 공유
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                생활을 가볍게 하는
                <br />
                한 장의 가계부
          </h1>
              <p className="max-w-2xl text-lg text-slate-200">
                계좌·카드 내역을 자동으로 모으고, 가족과 함께 예산을 맞춰요.
                영수증 캡처, 공동 체크리스트, 월말 리포트까지 한 번에 관리되는
                LifeTools의 첫 번째 아이템입니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:translate-y-0.5 hover:shadow-purple-500/40"
                href="/login"
              >
                로그인하고 시작하기
              </Link>
              <Link
                className="rounded-full border border-white/15 px-6 py-3 text-base font-semibold text-white/90 transition hover:border-white/30 hover:text-white"
                href="#features"
              >
                기능 한눈에 보기
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
                ✅ 지출 자동 분류
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
                ✅ 가족 공유 & 권한 설정
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2">
                ✅ 월말 리포트 PDF 저장
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 translate-x-6 translate-y-6 rounded-3xl bg-gradient-to-br from-purple-500/30 via-indigo-500/25 to-cyan-400/25 blur-3xl" />
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-indigo-900/40 backdrop-blur">
              <div className="border-b border-white/10 bg-white/5 px-6 py-4">
                <div className="flex items-center justify-between text-sm font-medium text-slate-200">
                  <span>이번 달 현황</span>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300">
                    실시간 동기화
                  </span>
                </div>
              </div>
              <div className="grid gap-4 p-6">
                <BalanceCard />
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
                  {[
                    { label: "이번 달 수입", value: "3,200,000원" },
                    { label: "지출", value: "1,800,000원" },
                    { label: "공동지출", value: "720,000원" },
                    { label: "예상 남음", value: "1,400,000원" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/5 bg-slate-900/40 px-4 py-3"
                    >
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/60 via-slate-900/50 to-slate-900/60 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>가족 공유</span>
                    <span className="text-xs text-emerald-300">실시간</span>
                  </div>
                  <p className="mt-2 text-base text-slate-200">
                    <span className="font-semibold text-white">민지</span>님이
                    영수증 2건을 추가했고, <span className="font-semibold text-white">주현</span>님이
                    외식 카테고리를 수정했습니다.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    {["민지", "주현", "지훈"].map((name) => (
                      <div
                        key={name}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white"
                      >
                        {name.slice(0, 1)}
                      </div>
                    ))}
                    <span className="text-xs text-slate-400">
                      멤버별 권한 · 알림 ON
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="space-y-8">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-violet-200">
              왜 LifeTools 가계부인가
            </p>
            <h2 className="text-3xl font-semibold text-white">
              복잡한 가계 관리를 한 앱으로 끝냅니다.
            </h2>
            <p className="max-w-3xl text-lg text-slate-200">
              자동 수집, 공유, 리포트. 가계부가 해야 하는 모든 일을 LifeTools가
              대신합니다.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-indigo-900/20 backdrop-blur transition hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition group-hover:opacity-100" />
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                  {feature.badge}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-slate-200">{feature.desc}</p>
                <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <p className="mt-3 text-sm text-slate-300">
                  지출 태그, 반복 수입, 정기 결제일, 영수증 분류까지 자동화.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-indigo-900/30 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
              3단계 온보딩
            </p>
            <h3 className="text-3xl font-semibold text-white">
              5분이면 자동 가계부가 시작됩니다.
            </h3>
            <p className="text-lg text-slate-200">
              계좌 연결 → 예산 설정 → 가족 초대. 세 단계면 자동 분류와 공유가
              바로 동작합니다.
            </p>
            <div className="mt-6 space-y-4">
              {steps.map((step, idx) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4"
                >
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 text-base font-semibold text-white">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">
                      {step.title}
                    </p>
                    <p className="text-sm text-slate-300">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/20 via-slate-900/60 to-cyan-400/15 p-6 shadow-xl shadow-indigo-900/30">
            <p className="text-sm font-semibold text-cyan-100">
              알림 & 리포트 미리보기
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
                <p className="font-semibold text-white">오늘의 자동 분류</p>
                <ul className="mt-2 space-y-1">
                  <li>· 커피 5,200원 · 외식</li>
                  <li>· 대형마트 82,000원 · 식자재</li>
                  <li>· 교통 3,400원 · 교통/이동</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
                <p className="font-semibold text-white">월말 리포트 (요약)</p>
                <p className="mt-2 text-slate-300">
                  예산 대비 8% 절감, 가장 큰 절약은 &ldquo;외식&rdquo; 12만 원.
                  다음 달 추천 예산을 자동 제안합니다.
          </p>
        </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <span>공동 체크리스트 · 교육비 납부</span>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                  완료 3/4
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="cta"
          className="grid gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900/70 to-slate-900 p-10 text-white shadow-2xl shadow-indigo-900/40 md:grid-cols-[1.4fr_0.6fr]"
        >
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-200">
              미리 체험하기
            </p>
            <h3 className="text-3xl font-semibold">
              LifeTools 가계부, 사전 접근 신청
            </h3>
            <p className="max-w-3xl text-lg text-slate-200">
              자동 분류, 가족 공유, 영수증 캡처, 월말 리포트까지 하나로. 베타
              링크를 가장 먼저 받아보세요.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                className="rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:translate-y-0.5 hover:shadow-purple-500/40"
                href="mailto:hello@lifetools.app?subject=LifeTools%20가계부%20베타%20신청"
              >
                hello@lifetools.app
          </a>
          <a
                className="rounded-full border border-white/15 px-6 py-3 text-base font-semibold text-white/90 transition hover:border-white/30 hover:text-white"
                href="https://cal.com"
            target="_blank"
                rel="noreferrer"
          >
                데모 일정 잡기
          </a>
        </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
            <p className="text-base font-semibold text-white">사전 알림 리스트</p>
            <ul className="mt-3 space-y-2">
              <li>· iOS/Android 동시 출시 알림</li>
              <li>· 공동 계좌 연결 베타 우선 초대</li>
              <li>· 월말 리포트 템플릿 무료 제공</li>
            </ul>
            <div className="mt-4 rounded-xl bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
                보너스
              </p>
              <p className="mt-2 text-sm text-slate-200">
                베타 참여자 전원에게 &ldquo;가족 회계 체크리스트&rdquo; PDF를
                보내드립니다.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
