import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteChain, getChain } from "../api/chains";
import AppShell from "../components/AppShell";
import FlowGraphic from "../components/FlowGraphic";
import { PlusIcon, SearchIcon, TrashIcon, ArrowRightIcon } from "../components/Icons";
import { nodeMeta } from "../lib/nodeTypes";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function ChainCard({ chain, onDelete, deleting }) {
  const [confirming, setConfirming] = useState(false);
  const nodes = Array.isArray(chain.nodes) ? chain.nodes : [];

  return (
    <article className="card group relative flex flex-col p-5 transition-colors hover:border-ember-500/60">
      <div className="mb-4 flex items-center gap-1" aria-hidden="true">
        {nodes.slice(0, 8).map((node, i) => (
          <span key={node.id || i} className="flex items-center gap-1">
            {i > 0 && <span className="h-px w-3 bg-ink-600" />}
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: nodeMeta(node.type).color }} />
          </span>
        ))}
        {nodes.length > 8 && <span className="ml-1 text-xs text-sand-500">+{nodes.length - 8}</span>}
      </div>

      <h3 className="font-display text-xl font-semibold tracking-tight">
        <Link to={`/chains/${chain.id}`} className="after:absolute after:inset-0 after:rounded-2xl">
          {chain.title}
        </Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-sand-400">
        {chain.description || "No description"}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-ink-700 pt-4 text-xs text-sand-500">
        <span>
          {nodes.length} {nodes.length === 1 ? "node" : "nodes"} · Updated {formatDate(chain.updatedAt)}
        </span>
        <div className="relative z-10 flex items-center gap-1.5">
          {confirming ? (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" disabled={deleting} onClick={() => onDelete(chain.id)}>
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-ghost btn-sm opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                onClick={() => setConfirming(true)}
                aria-label={`Delete ${chain.title}`}
                title="Delete workflow"
              >
                <TrashIcon />
              </button>
              <ArrowRightIcon className="text-sand-500 transition-all group-hover:translate-x-0.5 group-hover:text-ember-400" />
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ChainList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const { data: chains = [], isLoading, error } = useQuery({
    queryKey: ["chains"],
    queryFn: getChain,
  });

  const removeMutation = useMutation({
    mutationFn: deleteChain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chains"] });
      toast.success("Workflow deleted");
    },
    onError: () => toast.error("Could not delete the workflow"),
  });

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...chains]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .filter((c) => !q || `${c.title} ${c.description || ""}`.toLowerCase().includes(q));
  }, [chains, search]);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Workflows</h1>
          <p className="mt-1.5 text-sand-400">
            {chains.length > 0
              ? `${chains.length} ${chains.length === 1 ? "workflow" : "workflows"} ready to run.`
              : "Build, edit and run your AI workflows."}
          </p>
        </div>
        {chains.length > 0 && (
          <div className="relative w-full sm:w-72">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workflows"
              aria-label="Search workflows"
              className="field !pl-9"
            />
          </div>
        )}
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-44 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="card p-8 text-center">
            <p className="font-semibold text-red-300">Couldn't load your workflows.</p>
            <p className="mt-1 text-sm text-sand-400">Check that the API is running, then refresh.</p>
          </div>
        ) : chains.length === 0 ? (
          <div className="card grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">No workflows yet</h2>
              <p className="mt-2 max-w-sm leading-relaxed text-sand-400">
                Start with one input and a prompt or two. You can reshape the graph on the canvas afterwards.
              </p>
              <Link to="/chains/new" className="btn btn-primary btn-lg mt-6">
                <PlusIcon />
                Create your first workflow
              </Link>
            </div>
            <FlowGraphic className="w-full opacity-80" />
          </div>
        ) : visible.length === 0 ? (
          <div className="card p-8 text-center text-sand-400">No workflows match "{search}".</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((chain) => (
              <ChainCard
                key={chain.id}
                chain={chain}
                deleting={removeMutation.isPending}
                onDelete={(id) => removeMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
