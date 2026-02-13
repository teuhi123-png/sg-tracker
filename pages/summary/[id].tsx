import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { Round, Shot } from "../../types/golf";
import { getRound } from "../../lib/storage";
import { calculateStrokesGained } from "../../lib/strokesGained";
import { baselineIsComplete, getExpectedStrokes } from "../../lib/expectedStrokes";
import Card from "../../components/ui/Card";
import StatChip from "../../components/ui/StatChip";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Totals = {
  OTT: number;
  APP: number;
  ARG: number;
  PUTT: number;
  TOTAL: number;
};

export default function SummaryPage() {
  const router = useRouter();
  const { id } = router.query;
  const roundId = typeof id === "string" ? id : "";

  const [round, setRound] = useState<Round | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!router.isReady || !roundId) return;
    const found = getRound(roundId);
    if (!found) {
      setNotFound(true);
      setRound(null);
    } else {
      setRound(found);
      setNotFound(false);
    }
  }, [router.isReady, roundId]);

  const totals: Totals = useMemo(() => {
    const base: Totals = { OTT: 0, APP: 0, ARG: 0, PUTT: 0, TOTAL: 0 };
    if (!round) return base;

    for (const shot of round.shots) {
      const { sg, category, isValid } = calculateStrokesGained(shot);
      if (!isValid) continue;
      base[category] += sg ?? 0;
      base.TOTAL += sg ?? 0;
    }

    return base;
  }, [round]);

  const hasInvalidBaseline = useMemo(() => {
    if (!round) return false;
    return round.shots.some((shot) => !calculateStrokesGained(shot).isValid);
  }, [round]);

  const cumulativeData = useMemo(() => {
    if (!round) return [];
    let running = 0;
    return round.shots.map((shot, idx) => {
      const { sg, isValid } = calculateStrokesGained(shot);
      if (!isValid || sg === null)
        return { index: idx + 1, total: Number(running.toFixed(3)) };
      running += sg;
      return { index: idx + 1, total: Number(running.toFixed(3)) };
    });
  }, [round]);

  const categoryData = useMemo(() => {
    return [
      { name: "OTT", value: Number(totals.OTT.toFixed(2)) },
      { name: "APP", value: Number(totals.APP.toFixed(2)) },
      { name: "ARG", value: Number(totals.ARG.toFixed(2)) },
      { name: "PUTT", value: Number(totals.PUTT.toFixed(2)) },
    ];
  }, [totals]);

  const weakness = useMemo(() => {
    const entries: Array<{ label: string; value: number }> = [
      { label: "Off the Tee", value: totals.OTT },
      { label: "Approach", value: totals.APP },
      { label: "Around the Green", value: totals.ARG },
      { label: "Putting", value: totals.PUTT },
    ];

    const negatives = entries.filter((e) => e.value < 0);
    if (negatives.length === 0) return null;

    let worst = negatives[0];
    for (const entry of negatives) {
      if (entry.value < worst.value) worst = entry;
    }

    return { label: worst.label, value: worst.value };
  }, [totals]);

  const sanity = useMemo(() => {
    if (!round) return null;
    const byHole = new Map<number, Shot[]>();
    for (const shot of round.shots) {
      const list = byHole.get(shot.holeNumber) ?? [];
      list.push(shot);
      byHole.set(shot.holeNumber, list);
    }

    let expectedFromTeeTotal = 0;
    for (const shots of byHole.values()) {
      const firstShot = shots.find((s) => s.shotNumber === 1);
      if (!firstShot) continue;
      const exp = getExpectedStrokes(firstShot.startLie, firstShot.startDistance);
      if (exp !== null && !Number.isNaN(exp)) expectedFromTeeTotal += exp;
    }

    const actualStrokesTotal =
      round.shots.length +
      round.shots.reduce((sum, s) => sum + (s.penaltyStrokes || 0), 0);

    const delta = expectedFromTeeTotal - actualStrokesTotal;

    return {
      expectedFromTeeTotal,
      actualStrokesTotal,
      delta,
    };
  }, [round]);

  const keyInsight = useMemo(() => {
    if (!round) return null;
    const buckets = [
      { key: "long", label: "200m+", total: 0 },
      { key: "mid", label: "100–200m", total: 0 },
      { key: "short", label: "<100m", total: 0 },
      { key: "putting", label: "Putting", total: 0 },
    ];

    for (const shot of round.shots) {
      const { sg, isValid } = calculateStrokesGained(shot);
      if (!isValid || sg === null) continue;

      if (shot.startLie === "GREEN") {
        buckets.find((b) => b.key === "putting")!.total += sg;
        continue;
      }

      if (shot.startDistance >= 200) {
        buckets.find((b) => b.key === "long")!.total += sg;
      } else if (shot.startDistance >= 100) {
        buckets.find((b) => b.key === "mid")!.total += sg;
      } else {
        buckets.find((b) => b.key === "short")!.total += sg;
      }
    }

    let worst = buckets[0];
    for (const b of buckets) {
      if (b.total < worst.total) worst = b;
    }

    let message = "";
    switch (worst.key) {
      case "putting":
        message = "Putting cost you the most strokes.";
        break;
      case "short":
        message = "You lost most strokes inside 100m.";
        break;
      case "mid":
        message = "Mid-range approach play hurt the most.";
        break;
      case "long":
        message = "Long game cost you the round.";
        break;
      default:
        message = "The biggest leak is in your approach play.";
    }

    return { message, value: worst.total };
  }, [round]);

  if (!router.isReady) {
    return <div className="page">Loading...</div>;
  }

  if (notFound) {
    return (
      <div className="page">
        <div className="container">
          <div className="h1">Round not found</div>
          <Link href="/">Back home</Link>
        </div>
      </div>
    );
  }

  if (!round) {
    return <div className="page">Loading...</div>;
  }

  const created = new Date(round.createdAt).toLocaleString();

  return (
    <div className="page">
      <div className="container">
        <div className="top-row">
          <div>
            <div className="h1">Analysis</div>
            <div className="muted">{round.courseName || "Unnamed course"}</div>
            <div className="muted">{created} · {round.shots.length} shots</div>
          </div>
          <div className="nav-links">
            <Link href={`/round/${round.id}`} className="pill">
              Back
            </Link>
            <Link href="/" className="pill">
              Home
            </Link>
          </div>
        </div>

        {(!baselineIsComplete() || hasInvalidBaseline) && (
          <Card title="Baseline incomplete">
            <div className="muted">
              PGA baseline tables are incomplete. Add missing lie tables to enable accurate SG.
            </div>
          </Card>
        )}

        <Card title="Round Performance" subtitle="Strokes Gained vs PGA Tour">
          <div className="hero">
            <div
              className={`stat-total stat-total-xl ${
                totals.TOTAL >= 0 ? "sg-positive" : "sg-negative"
              }`}
            >
              {totals.TOTAL >= 0 ? "+" : ""}
              {totals.TOTAL.toFixed(2)}
            </div>
            <div
              className={`stat-subtitle ${totals.TOTAL >= 0 ? "text-positive" : "text-negative"}`}
            >
              {totals.TOTAL >= 0
                ? `You gained ${Math.abs(totals.TOTAL).toFixed(2)} shots on PGA Tour average.`
                : `You lost ${Math.abs(totals.TOTAL).toFixed(2)} shots to PGA Tour average.`}
            </div>
            <div className="stat-row">
              <StatChip value={totals.OTT} label="OTT" decimals={2} />
              <StatChip value={totals.APP} label="APP" decimals={2} />
              <StatChip value={totals.ARG} label="ARG" decimals={2} />
              <StatChip value={totals.PUTT} label="PUTT" decimals={2} />
            </div>
          </div>
        </Card>

        <Card title="Primary Weakness">
          {weakness ? (
            <div className="hero">
              <div className="stat-total">{weakness.label}</div>
              <div className="muted">
                Cost you {Math.abs(weakness.value).toFixed(2)} shots
              </div>
            </div>
          ) : (
            <div className="muted">No clear weakness this round.</div>
          )}
        </Card>

        {keyInsight && (
          <Card title="Key Insight">
            <div className="hero">
              <div className="muted">{keyInsight.message}</div>
            </div>
          </Card>
        )}

        <Card title="Cumulative SG">
          {cumulativeData.length === 0 ? (
            <div className="muted">No shots yet.</div>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer>
                <LineChart data={cumulativeData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="index" tickLine={false} />
                  <YAxis tickLine={false} />
                  <Tooltip cursor={false} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="SG by category">
          <div className="chart-wrap">
            <ResponsiveContainer>
              <BarChart data={categoryData}>
                <defs>
                  <linearGradient id="barPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="barNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" tickLine={false} />
                <YAxis tickLine={false} />
                <Tooltip cursor={false} />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  activeBar={false}
                  isAnimationActive={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.value >= 0 ? "url(#barPositive)" : "url(#barNegative)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {sanity && (
          <Card title="Round Context">
            <div className="hero">
              <div className="muted">
                PGA Expected: {sanity.expectedFromTeeTotal.toFixed(2)}
              </div>
              <div className="muted">
                Your Score: {sanity.actualStrokesTotal.toFixed(2)}
              </div>
              <div className="stat-value">
                Difference: {sanity.delta >= 0 ? "+" : ""}
                {sanity.delta.toFixed(2)}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
