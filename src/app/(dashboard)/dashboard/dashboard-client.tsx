"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type DashboardStats = {
  totalLeads: number;
  engagedCount: number;
  engagedLeadRate: number;
  interestedLeads: number;
  bookedLeads: number;
  statusCounts: { new: number; active: number; done: number };
  outcomeCounts: Record<string, number>;
  totalAttempts: number;
  callsConnected: number;
  contactRate: number;
  smsSent: number;
  totalCalls: number;
  callsAnswered: number;
  totalMinutes: number;
};

// ─── AnimatedNumber ────────────────────────────────────────────────────────────

function AnimatedNumber({
  value,
  duration = 1200,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const end = value;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(end * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── DonutChart ────────────────────────────────────────────────────────────────

function DonutChart({
  data,
  size = 180,
}: {
  data: { new: number; active: number; done: number };
  size?: number;
}) {
  const total = data.new + data.active + data.done;
  const radius = 70;
  const cx = 100;
  const cy = 100;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;

  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const segments = [
    { value: data.new, color: "#3B82F6", label: "New" },
    { value: data.active, color: "#F59E0B", label: "Active" },
    { value: data.done, color: "#10B981", label: "Done" },
  ];

  let offset = -circumference * 0.25;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 200 200">
        {total === 0 ? (
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-border/30"
            strokeWidth={strokeWidth}
          />
        ) : (
          segments.map((seg, i) => {
            const pct = total > 0 ? seg.value / total : 0;
            const dashLen = circumference * pct;
            const dashOffset = -offset;
            offset += dashLen;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={
                  animated
                    ? `${dashLen} ${circumference - dashLen}`
                    : `0 ${circumference}`
                }
                strokeDashoffset={dashOffset}
                style={{
                  transition:
                    "stroke-dasharray 1s ease, stroke-dashoffset 1s ease",
                  opacity: 0.9,
                }}
              />
            );
          })
        )}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          className="fill-foreground"
          fontSize="28"
          fontWeight="700"
          fontFamily="var(--font-mono), monospace"
        >
          {total.toLocaleString()}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="11"
          letterSpacing="0.08em"
        >
          LEADS LOADED
        </text>
      </svg>
      <div className="flex flex-col gap-2.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div
              className="size-2.5 rounded-full"
              style={{
                background: seg.color,
                boxShadow: `0 0 8px ${seg.color}66`,
              }}
            />
            <span className="text-[13px] text-muted-foreground min-w-[50px]">
              {seg.label}
            </span>
            <span className="text-sm font-semibold font-[family-name:var(--font-mono)] text-foreground">
              {seg.value.toLocaleString()}
            </span>
            <span className="text-xs font-[family-name:var(--font-mono)] text-muted-foreground/70">
              {total > 0 ? ((seg.value / total) * 100).toFixed(1) : "0.0"}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── OutcomeBar ────────────────────────────────────────────────────────────────

function OutcomeBar({
  label,
  value,
  maxValue,
  color,
  icon,
  delay = 0,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  icon: string;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(
      () => setWidth((value / maxValue) * 100),
      100 + delay
    );
    return () => clearTimeout(timer);
  }, [value, maxValue, delay]);

  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-sm min-w-[18px] text-center">{icon}</span>
      <span className="text-[13px] text-muted-foreground min-w-[120px] whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-6 bg-muted/40 rounded overflow-hidden relative">
        <div
          className="h-full rounded flex items-center justify-end pr-2"
          style={{
            width: `${width}%`,
            background: color,
            transition: "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {width > 15 && (
            <span className="text-[11px] font-semibold font-[family-name:var(--font-mono)] text-white drop-shadow-sm">
              {value}
            </span>
          )}
        </div>
        {width <= 15 && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold font-[family-name:var(--font-mono)] text-muted-foreground">
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── CounterCard ───────────────────────────────────────────────────────────────

function CounterCard({
  label,
  value,
  suffix = "",
  color,
  sub,
}: {
  label: string;
  value: number;
  suffix?: string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 flex-1 min-w-[140px]">
      <div
        className="absolute top-0 left-0 right-0 h-[3px] opacity-70"
        style={{ background: color }}
      />
      <div className="text-[11px] tracking-wider uppercase text-muted-foreground mb-2">
        {label}
      </div>
      <div className="text-[28px] font-bold font-[family-name:var(--font-mono)] text-foreground leading-none">
        <AnimatedNumber
          value={value}
          suffix={suffix}
          decimals={suffix === "%" ? 1 : 0}
        />
      </div>
      {sub && (
        <div className="text-[11px] text-muted-foreground/70 mt-1.5">{sub}</div>
      )}
    </div>
  );
}

// ─── Main Dashboard Client ─────────────────────────────────────────────────────

export function DashboardClient({ stats }: { stats: DashboardStats }) {
  const maxOutcome = Math.max(...Object.values(stats.outcomeCounts), 1);

  const outcomeItems = [
    { label: "Interested Lead", key: "interested", color: "#10B981", icon: "check", group: "positive" },
    { label: "Booked", key: "booked", color: "#34D399", icon: "check", group: "positive" },
    { label: "Unreachable", key: "unreachable", color: "#64748B", icon: "neutral", group: "neutral" },
    { label: "Not Interested", key: "not_interested", color: "#EF4444", icon: "negative", group: "negative" },
    { label: "Wrong Number", key: "wrong_number", color: "#F87171", icon: "negative", group: "negative" },
    { label: "DNC", key: "dnc", color: "#FB923C", icon: "negative", group: "negative" },
    { label: "Unqualified", key: "unqualified", color: "#F97316", icon: "negative", group: "negative" },
  ];

  const iconMap: Record<string, string> = {
    check: "\u2705",
    neutral: "\u26AA",
    negative: "\u274C",
  };

  const metricChainSteps = [
    "Leads Loaded",
    "Attempts",
    "Connected",
    "Interested",
    "Booked",
    "Show Rate",
    "Close",
    "Revenue",
  ];

  return (
    <div className="space-y-5">
      {/* ═══════ PANEL 1: HERO — Engaged Leads ═══════ */}
      <div
        className="relative overflow-hidden rounded-2xl border border-emerald/20 p-8 animate-fade-in-up"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.25 0.06 160) 0%, oklch(0.16 0.03 160) 40%, oklch(0.13 0.01 260) 100%)",
          animationDelay: "100ms",
        }}
      >
        {/* Glow decoration */}
        <div
          className="absolute -top-10 -right-5 w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.15 160 / 0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] tracking-widest text-emerald uppercase font-semibold">
              Engaged Leads
            </span>
          </div>

          <div className="flex items-baseline gap-4 mb-3">
            <div
              className="text-6xl font-bold font-[family-name:var(--font-mono)] text-emerald leading-none"
              style={{ textShadow: "0 0 40px oklch(0.7 0.18 160 / 0.2)" }}
            >
              <AnimatedNumber value={stats.engagedCount} duration={1500} />
            </div>
            <div className="flex flex-col">
              <span className="text-emerald/80 text-xl font-semibold font-[family-name:var(--font-mono)]">
                <AnimatedNumber
                  value={stats.engagedLeadRate}
                  suffix="%"
                  decimals={1}
                />
              </span>
              <span className="text-muted-foreground text-[11px] tracking-wider">
                ENGAGED LEAD RATE
              </span>
            </div>
          </div>

          <div className="flex gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald/70" />
              <span className="text-[13px] text-muted-foreground">
                Interested
              </span>
              <span className="text-sm font-semibold font-[family-name:var(--font-mono)] text-foreground">
                {stats.interestedLeads}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald" />
              <span className="text-[13px] text-muted-foreground">Booked</span>
              <span className="text-sm font-semibold font-[family-name:var(--font-mono)] text-foreground">
                {stats.bookedLeads}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ PANELS 2 & 3: Status Donut + Activity Counters ═══════ */}
      <div
        className="flex gap-5 flex-wrap animate-fade-in-up"
        style={{ animationDelay: "200ms" }}
      >
        {/* Panel 2: Donut */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 flex-[1_1_420px]">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] tracking-widest text-amber-500 uppercase font-semibold">
              Lead Status
            </span>
            <span className="text-[11px] text-muted-foreground/50">
              &middot;
            </span>
            <span className="text-[11px] tracking-wider text-muted-foreground uppercase">
              Pipeline Throughput
            </span>
          </div>
          <DonutChart data={stats.statusCounts} />
        </div>

        {/* Panel 3: Activity Counters */}
        <div className="flex-[1_1_420px] flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] tracking-widest text-blue-500 uppercase font-semibold">
              Activity
            </span>
            <span className="text-[11px] text-muted-foreground/50">
              &middot;
            </span>
            <span className="text-[11px] tracking-wider text-muted-foreground uppercase">
              Leading Indicators
            </span>
          </div>
          <div className="flex gap-3 flex-wrap">
            <CounterCard
              label="Total Attempts"
              value={stats.totalAttempts}
              color="#3B82F6"
              sub="calls + VM + SMS"
            />
            <CounterCard
              label="Calls Connected"
              value={stats.callsConnected}
              color="#8B5CF6"
              sub="two-way conversations"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <CounterCard
              label="Contact Rate"
              value={stats.contactRate}
              suffix="%"
              color="#10B981"
              sub="connected / attempts"
            />
            <CounterCard
              label="SMS Sent"
              value={stats.smsSent}
              color="#F59E0B"
              sub="links + reminders"
            />
          </div>
        </div>
      </div>

      {/* ═══════ PANEL 4: Outcome Bars ═══════ */}
      <div
        className="rounded-2xl border border-border/50 bg-card p-6 animate-fade-in-up"
        style={{ animationDelay: "300ms" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[11px] tracking-widest text-red-500 uppercase font-semibold">
            Outcomes
          </span>
          <span className="text-[11px] text-muted-foreground/50">
            &middot;
          </span>
          <span className="text-[11px] tracking-wider text-muted-foreground uppercase">
            What Prospects Decided
          </span>
        </div>

        {outcomeItems.map((item, i) => {
          const showDivider =
            (i === 2 || i === 3) &&
            item.group !==
              outcomeItems[i - 1]?.group;
          return (
            <div key={item.key}>
              {showDivider && (
                <div className="h-px bg-border/40 my-3" />
              )}
              <OutcomeBar
                label={item.label}
                value={stats.outcomeCounts[item.key] ?? 0}
                maxValue={maxOutcome}
                color={item.color}
                icon={iconMap[item.icon]}
                delay={i * 80}
              />
            </div>
          );
        })}
      </div>

      {/* ═══════ Metric Chain ═══════ */}
      <div
        className="rounded-xl border border-border/30 bg-card/50 px-6 py-4 flex items-center justify-center gap-2 flex-wrap animate-fade-in-up"
        style={{ animationDelay: "400ms" }}
      >
        {metricChainSteps.map((step, i, arr) => (
          <span key={i} className="flex items-center gap-2">
            <span
              className={`text-[11px] font-[family-name:var(--font-mono)] tracking-wide px-2 py-1 rounded ${
                i <= 4
                  ? "text-emerald font-semibold bg-emerald/10"
                  : "text-muted-foreground/50 font-normal"
              }`}
            >
              {step}
            </span>
            {i < arr.length - 1 && (
              <span className="text-[10px] text-border">
                &rarr;
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
