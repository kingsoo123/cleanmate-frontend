const steps = [
  {
    title: "Request pickup",
    description:
      "Choose your address, time window, and services. Walk-ins are welcome at partner laundries too.",
  },
  {
    title: "We collect & care",
    description:
      "Drivers or front-desk staff log items, share a quotation, and process garments through every stage.",
  },
  {
    title: "Delivered fresh",
    description:
      "Track status, settle your balance, and collect at the shop or at your door—fully paid, fully ready.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-surface px-4 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          How our home{" "}
          <span className="text-brand">pickup</span> works
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
          Simple steps for customers—and the same workflow powers laundry
          businesses on CleanMate from quote to quality check.
        </p>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-border bg-secondary-surface/50 p-6 text-center sm:p-8"
            >
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
