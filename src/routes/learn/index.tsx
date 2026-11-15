import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Play, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Shell, Splash } from "@/components/shell";
import { listCommunity } from "@/lib/community.functions";
import { getDesk } from "@/lib/connect.functions";
import { useConnect } from "@/lib/connect";
import { errorText } from "@/lib/manila";
import type { TutorialCard } from "@/lib/types";

export const Route = createFileRoute("/learn/")({ component: Learn });

const filters = ["All", "Start", "Intermediate", "Advanced", "Community"] as const;

type CommunityPost = {
  id: string;
  name: string;
  caption: string;
  mediaUrl: string;
  createdAt: number;
};

function LessonCard({ tutorial, featured }: { tutorial: TutorialCard; featured?: boolean }) {
  return (
    <Link to="/learn/$tutorialId" params={{ tutorialId: tutorial.id }} className="media-card block overflow-hidden rounded-[1.4rem] bg-black">
      <span className="relative block">
        <img src={tutorial.thumbnail} alt="" className="aspect-video w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/10" />
        {featured ? (
          <span className="absolute left-3 top-3 rounded-full bg-teal px-2.5 py-1 text-[11px] font-medium text-ink">Start here</span>
        ) : null}
        <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-medium text-white">{tutorial.title}</span>
            <span className="mt-0.5 block text-[11px] text-white/70">
              {tutorial.difficulty === "Start" ? "Beginner" : tutorial.difficulty} · {tutorial.durationMin} min
              {tutorial.id === "free-video" ? " · Google Flow" : ""}
            </span>
          </span>
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teal text-ink shadow-[0_8px_20px_rgba(212,175,55,0.35)]">
            <Play className="ml-0.5 size-5 fill-current" />
          </span>
        </span>
      </span>
    </Link>
  );
}

function Reel({ post }: { post: CommunityPost }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.65 },
    );
    watcher.observe(video);
    return () => watcher.disconnect();
  }, []);

  return (
    <article className="overflow-hidden rounded-3xl bg-black">
      <video ref={videoRef} src={post.mediaUrl} playsInline muted loop controls className="mx-auto max-h-[78dvh] w-full bg-black object-contain" />
      <div className="bg-raise px-4 py-3">
        <p className="text-sm font-medium">{post.name}</p>
        <p className="mt-1 inline-flex rounded-full bg-teal/15 px-2 py-0.5 text-[11px] text-teal">Content Author</p>
        {post.caption ? <p className="mt-2 text-sm text-muted">{post.caption}</p> : null}
      </div>
    </article>
  );
}

function Learn() {
  const { ready, session, profile } = useConnect();
  const [items, setItems] = useState<TutorialCard[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  useEffect(() => {
    if (!session || profile?.membershipStatus !== "active") return;
    let cancel = false;
    void getDesk({ data: { idToken: session.idToken } })
      .then((desk) => {
        if (!cancel) setItems(desk.tutorials);
      })
      .catch((caught) => {
        if (!cancel) setError(errorText(caught));
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    void listCommunity({ data: { idToken: session.idToken } })
      .then((result) => {
        if (!cancel) setPosts(result.posts as CommunityPost[]);
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [profile?.membershipStatus, session]);

  if (!ready) return <Splash />;
  if (!session || !profile) return <Navigate to="/login" />;
  if (profile.membershipStatus !== "active") return <Navigate to="/checkout" />;

  const community = filter === "Community";
  const needle = query.trim().toLowerCase();
  const shown = items
    .filter((tutorial) => {
      const matchesFilter = filter === "All" || tutorial.difficulty === filter;
      const hay = `${tutorial.title} ${tutorial.tags.join(" ")} ${tutorial.description}`.toLowerCase();
      return matchesFilter && hay.includes(needle);
    })
    .sort((a, b) => {
      if (a.id === "free-video") return -1;
      if (b.id === "free-video") return 1;
      return a.sortOrder - b.sortOrder;
    });
  const reels = posts.filter((post) => `${post.name} ${post.caption}`.toLowerCase().includes(needle));

  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-5 md:px-8">
        <p className="text-[11px] font-medium tracking-[0.18em] text-teal">{community ? "MEMBERS" : "LESSONS"}</p>
        <h1 className="mt-1 font-display text-3xl">{community ? "Community" : "Short Guides"}</h1>
        <p className="mt-1 text-sm text-muted">
          {community ? "Member videos, newest at the top." : "Watch a guide, then try it on your own work."}
        </p>
        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={community ? "Search videos" : "Search guides"}
            className="h-12 w-full rounded-2xl border border-white/8 bg-raise pr-4 pl-11 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          />
        </label>
        <div className="chip-row mt-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={
                filter === item
                  ? "h-9 shrink-0 rounded-full bg-teal px-4 text-sm font-medium text-ink"
                  : "h-9 shrink-0 rounded-full bg-surface px-4 text-sm text-muted"
              }
            >
              {item === "Start" ? "Beginner" : item}
            </button>
          ))}
        </div>
        {community ? (
          reels.length === 0 ? (
            <p className="mt-8 text-sm text-muted">No community videos yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {reels.map((post) => (
                <Reel key={post.id} post={post} />
              ))}
            </div>
          )
        ) : (
          <>
            {loading ? <p className="mt-8 text-sm text-muted">Loading lessons…</p> : null}
            {error ? <p className="mt-8 text-sm text-teal">{error}</p> : null}
            {!loading && shown.length === 0 ? <p className="mt-8 text-sm text-muted">Nothing matches.</p> : null}
            <ul className="mt-4 space-y-4">
              {shown.map((tutorial, index) => (
                <li key={tutorial.id}>
                  <LessonCard tutorial={tutorial} featured={index === 0 && !needle} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Shell>
  );
}
