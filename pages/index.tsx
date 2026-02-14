import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  deleteRound,
  exportRounds,
  getRounds,
  importRounds,
  saveRound,
  updateRound,
} from "../lib/storage";
import type { Round } from "../types/golf";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

export default function Home() {
  const router = useRouter();
  const [course, setCourse] = useState("");
  const [targetHoles, setTargetHoles] = useState<9 | 18>(18);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setRounds(getRounds());
    if (typeof window !== "undefined") {
      const seen = window.localStorage.getItem("sg_onboarding_seen");
      if (!seen) setShowOnboarding(true);
    }
  }, []);

  function refreshRounds() {
    setRounds(getRounds());
  }

  function onStart() {
    const round: Round = {
      id: crypto.randomUUID(),
      courseName: course.trim() || undefined,
      createdAt: Date.now(),
      targetHoles,
      holes: targetHoles,
      shots: [],
    };

    saveRound(round);
    refreshRounds();
    setCourse("");
    void router.push(`/round/${round.id}`);
  }

  function markOnboardingSeen() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sg_onboarding_seen", "1");
    }
    setShowOnboarding(false);
  }

  function resetOnboarding() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("sg_onboarding_seen");
    }
    setShowOnboarding(true);
  }

  function onEdit(round: Round) {
    setEditingId(round.id);
    setEditingName(round.courseName ?? "");
  }

  function onSaveEdit(round: Round) {
    updateRound({
      ...round,
      courseName: editingName.trim() || undefined,
    });
    setEditingId(null);
    setEditingName("");
    refreshRounds();
  }

  function onDelete(id: string) {
    const ok = confirm("Delete this round? This cannot be undone.");
    if (!ok) return;
    deleteRound(id);
    refreshRounds();
  }

  function onExport() {
    const data = exportRounds();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "strokes-gained-rounds.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImport(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const updated = importRounds(text, "merge");
      setRounds(updated);
    };
    reader.readAsText(file);
  }

  return (
    <main className="page">
      <div className="container">
        <section className="card">
          <div className="card-body hero">
            <div className="h1">Strokes Gained Tracker</div>
            <div className="hero-sub">Tour-Level Strokes Gained Analytics</div>
            <Card title="Start a new round">
              <div className="form-stack">
                <Input
                  label="Course name"
                  placeholder="Course name (optional)"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
                <div>
                  <div className="label">Round length</div>
                  <div className="pill-group">
                    <button
                      type="button"
                      className={`pill ${targetHoles === 9 ? "active" : ""}`.trim()}
                      onClick={() => setTargetHoles(9)}
                    >
                      9 holes
                    </button>
                    <button
                      type="button"
                      className={`pill ${targetHoles === 18 ? "active" : ""}`.trim()}
                      onClick={() => setTargetHoles(18)}
                    >
                      18 holes
                    </button>
                  </div>
                </div>
                <div className="actions">
                  <Button onClick={onStart}>Start Round</Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="section">
          <div className="h2">Your Rounds</div>
          {rounds.length === 0 ? (
            <div className="muted">No rounds yet. Start your first round.</div>
          ) : (
            rounds.map((r) => (
              <div key={r.id} className="card round-card">
                <div className="card-body">
                  {editingId === r.id ? (
                    <div className="form-stack">
                      <Input
                        label="Course name"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                      <div className="actions">
                        <Button onClick={() => onSaveEdit(r)}>Save</Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="round-title">
                        {r.courseName || "Unnamed course"}
                      </div>
                      <div className="muted">
                        {new Date(r.createdAt).toLocaleString()} · {r.shots.length} shots
                      </div>
                      <div className="actions">
                        <Link href={`/round/${r.id}`}>
                          <Button variant="secondary">Continue</Button>
                        </Link>
                        <Link href={`/summary/${r.id}`}>
                          <Button variant="secondary">Summary</Button>
                        </Link>
                        <Button variant="secondary" onClick={() => onEdit(r)}>
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          className="btn-outline-danger"
                          onClick={() => onDelete(r.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        <section className="section">
          <details className="card">
            <summary className="settings-summary">Settings</summary>
            <div className="card-body">
              <div className="section">
                <div className="h2">Backup & restore</div>
                <div className="actions">
                  <Button variant="secondary" onClick={onExport}>
                    Export data
                  </Button>
                  <label className="pill">
                    Import data
                    <input
                      type="file"
                      accept="application/json"
                      onChange={(e) => onImport(e.target.files?.[0] ?? null)}
                      className="visually-hidden"
                    />
                  </label>
                </div>
                <div className="muted">
                  Import merges valid rounds by id and ignores invalid entries.
                </div>
              </div>
              <div className="section">
                <div className="h2">Onboarding</div>
                <div className="actions">
                  <Button variant="secondary" onClick={resetOnboarding}>
                    Reset onboarding
                  </Button>
                </div>
              </div>
            </div>
          </details>
        </section>
      </div>

      {showOnboarding && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="h2">Welcome</div>
            <ul className="onboarding-list">
              <li>Create a round</li>
              <li>Enter shots: From → To, toggle Holed when in</li>
              <li>View Summary for insights</li>
            </ul>
            <div className="actions">
              <Button
                onClick={() => {
                  onStart();
                  markOnboardingSeen();
                }}
              >
                Start a round
              </Button>
              <Button variant="secondary" onClick={markOnboardingSeen}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
