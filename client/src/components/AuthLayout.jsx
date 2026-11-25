import Logo from "./Logo";
import FlowGraphic from "./FlowGraphic";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="forge-backdrop grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sand-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-sm text-sand-400">{footer}</p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-ink-700 bg-ink-900 lg:flex lg:flex-col lg:justify-center lg:px-14">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(36rem 24rem at 70% 20%, rgb(255 106 31 / 0.18), transparent 65%)",
          }}
        />
        <div className="relative">
          <FlowGraphic className="w-full max-w-xl" />
          <p className="mt-10 max-w-md font-display text-2xl font-semibold leading-snug tracking-tight">
            Every step is a node. Every node hands its output to the next.
          </p>
          <p className="mt-3 max-w-md text-sand-400">
            Chain prompts into a graph, run it with one click, and read exactly what each step produced.
          </p>
        </div>
      </aside>
    </div>
  );
}
