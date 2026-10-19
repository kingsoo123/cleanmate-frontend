const features = [
  {
    title: "Role-based workspaces",
    body: "Administrators, managers, front desk, laundry staff, and drivers each see what they need—nothing more.",
  },
  {
    title: "Quotations that stick",
    body: "Agreed prices are snapshotted on activation so later price list changes never surprise customers.",
  },
  {
    title: "Installments & balances",
    body: "Record cash, transfer, or integrated payments; outstanding amounts stay accurate automatically.",
  },
  {
    title: "Pickup & delivery jobs",
    body: "Assign drivers, update en-route status, and confirm receipt at the facility or at the customer door.",
  },
  {
    title: "Processing timeline",
    body: "Stage history from received through quality check—with notes for stains, damage, or special care.",
  },
  {
    title: "Notifications ready",
    body: "Hooks for SMS, email, and WhatsApp when you connect providers—core ops keep running if they are offline.",
  },
];

export function FeaturesGrid() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-t border-border bg-surface px-4 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Services & platform
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything a modern laundry operation expects
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Washing, dry cleaning, ironing, pickup, and delivery—managed in one
            place for businesses and customers alike.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="rounded-2xl border border-border bg-secondary-surface/40 p-6 transition-shadow hover:shadow-md"
            >
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
