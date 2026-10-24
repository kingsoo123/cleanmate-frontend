"use client";

import { useMemo, useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { formatNgn } from "@/lib/business-dashboard/format";
import {
  getActiveRiderJob,
  getUpcomingRiderJobs,
  mapsSearchHref,
  nextStage,
  phoneTelHref,
  primaryActionLabel,
  stageProgressIndex,
} from "@/lib/rider-dashboard/get-rider-jobs-data";
import type { RiderDashboardData, RiderJob } from "@/lib/rider-dashboard/types";

const stageLabels = ["Assigned", "En route", "At customer", "Done"];

export function RiderDashboardView({ initialData }: { initialData: RiderDashboardData }) {
  const [jobs, setJobs] = useState(initialData.jobs);
  const { session } = initialData;

  const activeJob = useMemo(() => getActiveRiderJob(jobs), [jobs]);
  const upcoming = useMemo(
    () => getUpcomingRiderJobs(jobs, activeJob?.id ?? null),
    [jobs, activeJob?.id],
  );
  const completedCount = jobs.filter((j) => j.stage === "completed").length;

  function advanceJob(jobId: string) {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;
        const next = nextStage(job);
        if (!next) return job;
        return { ...job, stage: next };
      }),
    );
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-md space-y-5 pb-8">
      <header className="rounded-2xl border border-border bg-surface px-4 py-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          {session.laundryName}
        </p>
        <h1 className="mt-1 text-xl font-bold text-foreground">
          Hi, {session.riderName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {session.dateLabel} · {jobs.length - completedCount} job
          {jobs.length - completedCount === 1 ? "" : "s"} remaining
        </p>
      </header>

      {activeJob ? (
        <ActiveJobCard job={activeJob} onAdvance={() => advanceJob(activeJob.id)} />
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-emerald-900">All done for now</p>
          <p className="mt-2 text-sm text-emerald-900/80">
            New assignments from your laundry will show up here automatically.
          </p>
        </div>
      )}

      {upcoming.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Up next
          </h2>
          <ul className="space-y-3">
            {upcoming.map((job) => (
              <UpcomingJobCard key={job.id} job={job} />
            ))}
          </ul>
        </section>
      ) : null}

      {completedCount > 0 ? (
        <p className="text-center text-xs text-muted">
          {completedCount} job{completedCount === 1 ? "" : "s"} completed today
          (preview)
        </p>
      ) : null}

      <LogoutButton
        role="rider"
        className="block w-full text-center text-sm font-semibold text-brand hover:underline"
      />
    </div>
  );
}

function ActiveJobCard({
  job,
  onAdvance,
}: {
  job: RiderJob;
  onAdvance: () => void;
}) {
  const progress = stageProgressIndex(job.stage);
  const isDone = job.stage === "completed";

  return (
    <article className="overflow-hidden rounded-2xl border-2 border-brand/30 bg-surface shadow-md">
      <div className="bg-brand px-4 py-3 text-white">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wide opacity-90">
            Active · {job.kind}
          </span>
          <span className="font-mono text-sm font-semibold">{job.reference}</span>
        </div>
        {job.orderNumber ? (
          <p className="mt-1 font-mono text-xs opacity-90">{job.orderNumber}</p>
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <p className="text-lg font-bold text-foreground">{job.customerName}</p>
          <p className="text-sm text-muted">{job.scheduledFor}</p>
        </div>

        <p className="text-sm leading-relaxed text-foreground">{job.address}</p>
        <p className="text-sm text-muted">{job.itemsSummary}</p>

        {job.customerNotes ? (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-200">
            {job.customerNotes}
          </p>
        ) : null}

        {job.collectCashNgn > 0 ? (
          <p className="rounded-xl bg-brand-light/80 px-3 py-2 text-sm font-semibold text-brand">
            Collect {formatNgn(job.collectCashNgn)} on delivery
          </p>
        ) : null}

        <JobProgress progress={progress} />

        {!isDone ? (
          <button
            type="button"
            onClick={onAdvance}
            className="flex h-12 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90"
          >
            {primaryActionLabel(job)}
          </button>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <a
            href={phoneTelHref(job.customerPhone)}
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold text-foreground hover:bg-secondary-surface"
          >
            Call customer
          </a>
          <a
            href={mapsSearchHref(job.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold text-foreground hover:bg-secondary-surface"
          >
            Open maps
          </a>
        </div>
      </div>
    </article>
  );
}

function JobProgress({ progress }: { progress: number }) {
  return (
    <div>
      <div className="flex justify-between gap-1">
        {stageLabels.map((label, index) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={`h-2 w-full max-w-[3rem] rounded-full ${
                index <= progress ? "bg-brand" : "bg-secondary-surface"
              }`}
            />
            <span className="text-[10px] font-medium text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingJobCard({ job }: { job: RiderJob }) {
  return (
    <li className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {job.kind}
          </p>
          <p className="font-mono text-sm font-semibold text-brand">{job.reference}</p>
        </div>
        <span className="rounded-full bg-secondary-surface px-2 py-0.5 text-[10px] font-semibold uppercase text-muted">
          Queued
        </span>
      </div>
      <p className="mt-2 font-medium text-foreground">{job.customerName}</p>
      <p className="text-xs text-muted">{job.scheduledFor}</p>
      <p className="mt-1 truncate text-xs text-muted">{job.address}</p>
    </li>
  );
}
