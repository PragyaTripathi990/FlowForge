import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getChainById, updateChain } from "../api/chains";
import AppShell from "../components/AppShell";
import ChainCanvas from "../components/ChainCanvas";
import RunPanel from "../components/RunPanel";
import { ArrowLeftIcon, SpinnerIcon } from "../components/Icons";

const SHELL_WIDTH = "max-w-7xl";

export default function ChainDetail({ chainId }) {
  const queryClient = useQueryClient();
  const [localChainData, setLocalChainData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: chain, isLoading } = useQuery({
    queryKey: ["chain", chainId],
    queryFn: () => getChainById(chainId),
    enabled: !!chainId,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: (updatedChain) => updateChain(chainId, updatedChain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chain", chainId] });
      queryClient.invalidateQueries({ queryKey: ["chains"] });
      setHasChanges(false);
      toast.success("Workflow saved");
    },
    onError: () => {
      toast.error("Failed to save the workflow");
    },
  });

  const handleCanvasChange = ({ nodes, edges }) => {
    setLocalChainData({ nodes, edges });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!localChainData) return;
    updateMutation.mutate({
      title: chain.title,
      description: chain.description,
      nodes: localChainData.nodes,
      edges: localChainData.edges,
    });
  };

  if (isLoading) {
    return (
      <AppShell width={SHELL_WIDTH}>
        <div className="h-10 w-72 animate-pulse rounded-lg bg-ink-800" />
        <div className="card mt-8 h-[560px] animate-pulse" />
      </AppShell>
    );
  }

  if (!chain) {
    return (
      <AppShell width={SHELL_WIDTH}>
        <div className="card p-10 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Workflow not found</h1>
          <p className="mt-2 text-sand-400">It may have been deleted, or the link is wrong.</p>
          <Link to="/chains" className="btn btn-secondary mt-6">
            Back to workflows
          </Link>
        </div>
      </AppShell>
    );
  }

  const displayData = localChainData || { nodes: chain.nodes, edges: chain.edges };

  return (
    <AppShell width={SHELL_WIDTH}>
      <Link to="/chains" className="inline-flex items-center gap-1.5 text-sm text-sand-400 hover:text-sand-50">
        <ArrowLeftIcon width={14} height={14} />
        Workflows
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{chain.title}</h1>
          {chain.description && <p className="mt-1.5 max-w-2xl text-sand-400">{chain.description}</p>}
          <p className="mt-2 font-mono text-xs text-sand-500">
            {displayData.nodes.length} nodes · {displayData.edges.length} connections
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && <span className="text-sm text-ember-300">Unsaved changes</span>}
          <button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
            className={`btn ${hasChanges ? "btn-primary" : "btn-secondary"}`}
          >
            {updateMutation.isPending && <SpinnerIcon />}
            {updateMutation.isPending ? "Saving…" : hasChanges ? "Save changes" : "Saved"}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <ChainCanvas key={chain.id} nodes={chain.nodes} edges={chain.edges} onChange={handleCanvasChange} />
      </div>

      <div className="mt-8">
        <RunPanel chainId={chain.id} nodes={displayData.nodes} hasUnsavedChanges={hasChanges} />
      </div>
    </AppShell>
  );
}
