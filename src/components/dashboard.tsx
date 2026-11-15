import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HomeUpload } from "@/components/community-feed";
import { getDesk } from "@/lib/connect.functions";
import { useConnect } from "@/lib/connect";
import { errorText, formatClock, secondsUntilManilaMidnight } from "@/lib/manila";
import type { Desk } from "@/lib/types";

async function notifyPick() {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const body = "Today’s pick is ready.";
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification("AI Master Plan", { body });
      return;
    }
  } catch {
    /* fall through to the page toast */
  }
  try {
    new Notification("AI Master Plan", { body });
  } catch {
    /* some browsers only allow service-worker notifications */
  }
}

function Ring({ value }: { value: number }) {
  const radius = 18;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.max(0, Math.min(100, value)) / 100) * circ;
  return (
    <svg viewBox="0 0 44 44" className="size-12 shrink-0" aria-hidden>
      <circle cx="22" cy="22" r={radius} className="fill-none stroke-line" strokeWidth="3" />
      <circle
        cx="22"
        cy="22"
        r={radius}
        className="fill-none stroke-teal"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 22 22)"
      />
    </svg>
  );
}

function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(secondsUntilManilaMidnight());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums">{left === null ? "--:--:--" : formatClock(left)}</span>;
}

export function Dashboard() {
  const { session } = useConnect();
  const [desk, setDesk] = useState<Desk | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    let cancel = false;
    setLoading(true);
    void getDesk({ data: { idToken: session.idToken } })
      .then((next) => {
        if (!cancel) setDesk(next);
      })
      .catch((caught) => {
        if (!cancel) setError(errorText(caught));
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [session]);

  useEffect(() => {
    if (!desk?.todayId) return;
    const key = "dc.seenPick";
    const prev = localStorage.getItem(key);
    if (prev && prev !== desk.todayId) {
      toast("A new daily pick is up.");
      void notifyPick();
    }
    localStorage.setItem(key, desk.todayId);
  }, [desk?.todayId]);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-5 py-8 text-sm text-muted">Loading the desk…</div>;
  }
  if (error || !desk) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16">
        <p className="text-muted">{error || "Could not load the desk."}</p>
        <button type="button" className="mt-4 text-teal" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  const byId = new Map(desk.tutorials.map((tutorial) => [tutorial.id, tutorial]));
  const today = byId.get(desk.todayId) ?? desk.tutorials[0];

  if (!today) return <p className="px-5 py-16 text-muted">No lessons yet.</p>;

  const finished = desk.progress.filter((row) => row.completed).length;
  const totalLessons = Math.max(desk.tutorials.length, 1);
  const percent = Math.round((finished / totalLessons) * 100);
  const level = percent >= 70 ? "Advanced" : percent >= 30 ? "Learner" : "Beginner";
  const firstName = desk.profile.name?.split(" ")[0] || "there";
  return (
    <div className="mx-auto max-w-3xl px-4 py-5 md:px-8">
      <article className="media-card overflow-hidden rounded-[1.6rem] bg-black">
        <video
          src="/reels/welcome.mp4"
          controls
          playsInline
          autoPlay
          muted
          loop
          className="aspect-video w-full bg-black object-contain"
        />
        <div className="bg-raise px-4 py-3.5">
          <p className="text-[11px] font-medium tracking-[0.18em] text-teal">WELCOME</p>
          <h2 className="mt-1 font-display text-2xl">Welcome to AI Master Plan</h2>
          <p className="text-sm text-muted">A short note from Emil before the lessons.</p>
        </div>
      </article>
      {session ? <div className="mt-4"><HomeUpload session={session} name={desk.profile.name || firstName} /></div> : null}
      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const q = String(data.get("q") ?? "").trim();
          window.location.assign(q ? `/learn?q=${encodeURIComponent(q)}` : "/learn");
        }}
      >
        <input name="q" placeholder="Search lessons, tools, or topics" className="h-12 w-full rounded-2xl border border-white/8 bg-raise px-4" />
      </form>

      <section className="surface-card mt-5 rounded-[1.4rem] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Your progress</h2>
          <p className="rounded-full bg-teal/15 px-2.5 py-1 text-xs font-medium text-teal">{level}</p>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Ring value={percent} />
          <p className="text-sm text-muted">
            <span className="text-2xl font-medium tracking-tight text-fg">{percent}%</span>
            <span className="mt-0.5 block">{finished} of {totalLessons} lessons completed</span>
          </p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-teal" style={{ width: `${percent}%` }} />
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Master piece</h2>
          <Link to="/csr" className="text-sm text-teal">Open</Link>
        </div>
        <Link to="/csr" className="surface-card mt-3 block rounded-[1.4rem] p-4">
          <p className="text-[11px] font-medium tracking-[0.18em] text-teal">STEP BY STEP</p>
          <p className="mt-1 text-lg font-medium">Creating a CSR Agent</p>
          <p className="mt-1 text-sm text-muted">A preset agent you can use, sell, or rent. You only fill the facts that belong to the business.</p>
        </Link>
      </section>
      <p className="mt-5 text-center text-xs text-muted">Today’s pick swaps in <Countdown /></p>
    </div>
  );
}
