import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { runChain } from "../api/execute";
import { extractVariables, nodeMeta } from "../lib/nodeTypes";
import { AlertIcon, CheckIcon, PlayIcon, SpinnerIcon } from "./Icons";

const seconds = (ms) => `${((ms || 0) / 1000).toFixed(2)}s`;

// Light formatting for model output: **headings**, bullet lists, paragraphs.
function FormattedText({ text }) {
  if (!text) return null;
  return String(text)
    .split("\n\n")
    .map((block, index) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.includes("\n")) {
        return (
          <h4 key={index} className="mb-2 mt-5 font-display text-lg font-semibold tracking-tight text-sand-50 first:mt-0">
            {trimmed.replace(/\*\*/g, "")}
          </h4>
        );
      }

      if (/^[*-]\s/.test(trimmed)) {
        return (
          <ul key={index} className="my-3 list-disc space-y-1.5 pl-5 marker:text-ember-400">
            {trimmed
              .split("\n")
              .filter((item) => item.trim())
              .map((item, i) => (
                <li key={i}>{item.replace(/^\s*[*-]\s+/, "").replace(/\*\*/g, "")}</li>
              ))}
          </ul>
        );
      }

      return (
        <p key={index} className="mb-3 whitespace-pre-wrap last:mb-0">
          {block.replace(/\*\*/g, "")}
        </p>
      );
    });
}

function StepLog({ log, index }) {
  const meta = nodeMeta(log.type);
  return (
    <details className="group border-b border-ink-700 last:border-b-0" open={!!log.error}>
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3.5 hover:bg-ink-800/60">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink-700 font-mono text-xs text-sand-200">
          {index + 1}
        </span>
        <span className="font-mono text-[0.65rem] uppercase tracking-widest" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-sand-200">
          {(log.nodeName || "").replace(/\{\{|\}\}/g, "")}
        </span>
        {log.error ? (
          <span className="text-xs font-medium text-red-300">Failed</span>
        ) : (
          <span className="font-mono text-xs text-sand-500">{seconds(log.executionTime)}</span>
        )}
        <span className="text-sand-500 transition-transform group-open:rotate-90">›</span>
      </summary>
      <div className="px-5 pb-5 pl-14 text-sm leading-relaxed text-sand-200">
        {log.error ? (
          <p className="break-words rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-200">{log.error}</p>
        ) : (
          <FormattedText text={log.output} />
        )}
      </div>
    </details>
  );
}

export default function RunPanel({ chainId, nodes, hasUnsavedChanges }) {
  const variables = extractVariables(nodes);
  const [values, setValues] = useState({});

  const mutation = useMutation({
    mutationFn: () => {
      const inputValues = Object.fromEntries(variables.map((name) => [name, values[name] || ""]));
      return runChain(chainId, inputValues);
    },
  });

  const results = mutation.data;
  const failed = mutation.isError || results?.success === false;
  const errorMessage =
    results?.error || mutation.error?.response?.data?.message || mutation.error?.message;

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <form onSubmit={handleSubmit} className="card p-6 lg:sticky lg:top-24">
        <p className="eyebrow">Run</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">Execute workflow</h2>

        <div className="mt-5 space-y-4">
          {variables.length === 0 ? (
            <p className="text-sm text-sand-400">This workflow takes no input variables.</p>
          ) : (
            variables.map((name) => (
              <div key={name}>
                <label htmlFor={`var-${name}`} className="field-label font-mono">
                  {`{{${name}}}`}
                </label>
                <input
                  id={`var-${name}`}
                  type="text"
                  value={values[name] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [name]: e.target.value }))}
                  placeholder={`Value for ${name}`}
                  className="field"
                />
              </div>
            ))
          )}
        </div>

        <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-lg mt-6 w-full">
          {mutation.isPending ? <SpinnerIcon /> : <PlayIcon width={14} height={14} />}
          {mutation.isPending ? "Running…" : "Run workflow"}
        </button>

        {hasUnsavedChanges && (
          <p className="mt-3 text-xs text-ember-300">
            You have unsaved changes. Runs use the last saved version.
          </p>
        )}
      </form>

      <div className="min-w-0 space-y-5">
        {!results && !mutation.isError && (
          <div className="card grid min-h-56 place-items-center p-8 text-center">
            {mutation.isPending ? (
              <div className="flex items-center gap-3 text-sand-400">
                <SpinnerIcon className="text-ember-400" />
                Working through the nodes…
              </div>
            ) : (
              <div>
                <p className="font-display text-lg font-semibold tracking-tight">No run yet</p>
                <p className="mt-1 text-sm text-sand-400">
                  Results and a step-by-step log will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {(results || mutation.isError) && (
          <div
            className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border px-4 py-3 text-sm ${
              failed
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            }`}
            role="status"
          >
            <span className="flex items-center gap-2 font-semibold">
              {failed ? <AlertIcon /> : <CheckIcon />}
              {failed ? "Run failed" : "Run succeeded"}
            </span>
            {results?.totalTime != null && <span className="font-mono text-xs">{seconds(results.totalTime)}</span>}
            {results?.nodesExecuted != null && (
              <span className="text-xs">{results.nodesExecuted} nodes executed</span>
            )}
            {failed && errorMessage && <span className="basis-full break-words text-red-200/90">{errorMessage}</span>}
          </div>
        )}

        {results?.finalOutput && (
          <section className="card p-6">
            <p className="eyebrow">Final output</p>
            <div className="mt-4 leading-relaxed text-sand-50">
              <FormattedText text={results.finalOutput} />
            </div>
          </section>
        )}

        {results?.logs?.length > 0 && (
          <section className="card overflow-hidden">
            <div className="border-b border-ink-700 px-5 py-4">
              <p className="eyebrow">Execution log</p>
            </div>
            {results.logs.map((log, index) => (
              <StepLog key={`${log.nodeId}-${index}`} log={log} index={index} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
