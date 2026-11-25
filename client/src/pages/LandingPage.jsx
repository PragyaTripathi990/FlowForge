import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import FlowGraphic from "../components/FlowGraphic";
import { LogoMark } from "../components/Logo";
import { ArrowRightIcon } from "../components/Icons";
import { NODE_TYPES } from "../lib/nodeTypes";

const FEATURES = [
  {
    title: "Runs in dependency order",
    body: "Your graph is topologically sorted before it runs, and cycles are caught up front instead of mid-execution.",
  },
  {
    title: "Context flows downstream",
    body: "Each node receives the output of every node feeding into it, so later prompts build on earlier answers.",
  },
  {
    title: "Variables at run time",
    body: "Write {{topic}} once in a prompt and supply the value when you run. The same workflow, any input.",
  },
  {
    title: "A log for every step",
    body: "See what each node produced, how long it took and exactly where a run failed.",
  },
];

const STEPS = [
  { n: "01", title: "Describe the steps", body: "Name an input, then list the prompts you want the model to work through." },
  { n: "02", title: "Shape the graph", body: "Drag nodes, connect branches and edit prompts directly on the canvas." },
  { n: "03", title: "Run and inspect", body: "Fill in the variables, run the workflow and read the result step by step." },
];

const rise = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="forge-backdrop min-h-screen">
      <Navbar />

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
        <div>
          <motion.p {...rise} transition={{ duration: 0.5 }} className="eyebrow">
            AI workflow orchestration
          </motion.p>
          <motion.h1
            {...rise}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-4 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Forge AI workflows, <span className="text-ember-gradient">node by node.</span>
          </motion.h1>
          <motion.p
            {...rise}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-sand-400"
          >
            FlowForge turns a chain of prompts into a graph you can see, edit and run. Connect the steps, pass
            context between them, and get a result you can trace back to every node.
          </motion.p>
          <motion.div
            {...rise}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start building
              <ArrowRightIcon />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              I have an account
            </Link>
          </motion.div>
          <motion.ul
            {...rise}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-sm text-sand-400"
          >
            {Object.values(NODE_TYPES).map((t) => (
              <li key={t.label} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                {t.label} nodes
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="card relative overflow-hidden p-4 shadow-2xl shadow-black/50 sm:p-6"
        >
          <div className="mb-3 flex items-center justify-between border-b border-ink-700 pb-3">
            <span className="font-mono text-xs text-sand-400">research-brief.flow</span>
            <span className="flex items-center gap-1.5 rounded-full bg-ember-500/10 px-2.5 py-1 text-xs font-medium text-ember-300">
              <span className="h-1.5 w-1.5 rounded-full bg-ember-400" />
              Running
            </span>
          </div>
          <FlowGraphic className="w-full" />
        </motion.div>
      </section>

      <section className="border-y border-ink-700/70 bg-ink-900/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="eyebrow">What you get</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            An execution engine you can actually see into.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink-700 bg-ink-700 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-ink-900 p-7">
                <h3 className="font-display text-xl font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-sand-400">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow">How it works</p>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t border-ink-600 pt-5">
              <span className="font-mono text-sm text-ember-400">{s.n}</span>
              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-sand-400">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="card mt-16 flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Build your first workflow.</h2>
            <p className="mt-1 text-sand-400">It takes one input, one prompt and one click to run.</p>
          </div>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Get started
            <ArrowRightIcon />
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-700/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-sm text-sand-500">
          <span className="flex items-center gap-2">
            <LogoMark size={18} /> FlowForge
          </span>
          <span>DAG-based AI workflow orchestration</span>
        </div>
      </footer>
    </div>
  );
}
