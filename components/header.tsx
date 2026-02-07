"use client";

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground font-sans">
            SimuShop
          </h1>
          <p className="text-xs text-muted-foreground">
            Test promotions with AI-simulated customers before spending real
            money.
          </p>
        </div>
      </div>
      <nav className="flex items-center gap-1">
        <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground bg-muted">
          Simulation
        </button>
        <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          History
        </button>
      </nav>
    </header>
  );
}
