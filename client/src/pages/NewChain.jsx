import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { createChain } from "../api/chains";
import AppShell from "../components/AppShell";
import { ArrowLeftIcon, PlusIcon, SpinnerIcon, TrashIcon } from "../components/Icons";
import { NODE_TYPES } from "../lib/nodeTypes";

const NODE_SPACING = 280;

function Section({ step, title, hint, children }) {
  return (
    <section className="card p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ember-500/15 font-mono text-xs font-medium text-ember-300">
          {step}
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-sm text-sand-400">{hint}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function PreviewStep({ type, title, last }) {
  const meta = NODE_TYPES[type];
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {!last && <span className="absolute left-[5px] top-4 h-full w-px bg-ink-600" />}
      <span className="relative mt-1 h-[11px] w-[11px] shrink-0 rounded-full" style={{ background: meta.color }} />
      <div className="min-w-0">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest" style={{ color: meta.color }}>
          {meta.label}
        </p>
        <p className="truncate text-sm text-sand-200">{title}</p>
      </div>
    </li>
  );
}

export default function NewChain() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [inputVariable, setInputVariable] = useState("topic");
  const [questions, setQuestions] = useState([{ id: uuidv4(), text: "" }]);
  const [outputFormat, setOutputFormat] = useState("Summary:\n\n{{previousContext}}");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: saveChain, isPending } = useMutation({
    mutationFn: async () => {
      const nodes = [];
      const edges = [];

      const inputNodeId = `node-input-${uuidv4()}`;
      nodes.push({
        id: inputNodeId,
        type: "input",
        text: `{{${inputVariable}}}`,
        position: { x: 0, y: 100 },
      });

      let previousNodeId = inputNodeId;
      questions.forEach((question, index) => {
        const questionNodeId = `node-llm-${index}-${uuidv4()}`;
        nodes.push({
          id: questionNodeId,
          type: "llm",
          text: question.text,
          position: { x: NODE_SPACING * (index + 1), y: 100 },
        });
        edges.push({ source: previousNodeId, target: questionNodeId });
        previousNodeId = questionNodeId;
      });

      const outputNodeId = `node-output-${uuidv4()}`;
      nodes.push({
        id: outputNodeId,
        type: "output",
        text: outputFormat,
        position: { x: NODE_SPACING * (questions.length + 1), y: 100 },
      });
      edges.push({ source: previousNodeId, target: outputNodeId });

      return createChain({ title, description, nodes, edges });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chains"] });
      toast.success("Workflow created");
      navigate(`/chains/${data.id}`);
    },
    onError: () => {
      toast.error("Failed to create the workflow");
    },
  });

  const addQuestion = () => setQuestions([...questions, { id: uuidv4(), text: "" }]);

  const updateQuestion = (id, text) =>
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));

  const deleteQuestion = (id) => setQuestions(questions.filter((q) => q.id !== id));

  const handleSave = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!title.trim()) newErrors.title = "Give the workflow a title.";
    if (!inputVariable.trim()) newErrors.inputVariable = "Name the input variable.";
    if (questions.some((q) => !q.text.trim())) newErrors.questionText = "Every prompt needs some text.";
    if (!outputFormat.trim()) newErrors.outputFormat = "Describe the output format.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("A few fields need attention");
      return;
    }
    saveChain();
  };

  return (
    <AppShell>
      <Link to="/chains" className="inline-flex items-center gap-1.5 text-sm text-sand-400 hover:text-sand-50">
        <ArrowLeftIcon width={14} height={14} />
        Workflows
      </Link>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">New workflow</h1>
      <p className="mt-1.5 text-sand-400">
        Set up a straight line of steps here. You can branch and rewire it on the canvas after it's created.
      </p>

      <form onSubmit={handleSave} className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <section className="card space-y-5 p-6">
            <div>
              <label htmlFor="title" className="field-label">Title</label>
              <input
                id="title"
                type="text"
                placeholder="Blog post generator"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="field"
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="mt-1.5 text-sm text-red-300">{errors.title}</p>}
            </div>
            <div>
              <label htmlFor="description" className="field-label">
                Description <span className="font-normal text-sand-500">(optional)</span>
              </label>
              <textarea
                id="description"
                placeholder="What does this workflow produce?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="field"
              />
            </div>
          </section>

          <Section step="1" title="Input variable" hint="The value you'll supply each time the workflow runs.">
            <input
              type="text"
              aria-label="Input variable name"
              placeholder="topic"
              value={inputVariable}
              onChange={(e) => setInputVariable(e.target.value.replace(/\W/g, "_"))}
              className="field font-mono"
            />
            {errors.inputVariable && <p className="mt-1.5 text-sm text-red-300">{errors.inputVariable}</p>}
            <p className="mt-3 text-xs text-sand-500">
              Use it in any prompt as{" "}
              <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-ember-300">{`{{${inputVariable || "name"}}}`}</code>
            </p>
          </Section>

          <Section step="2" title="Prompts" hint="Each prompt runs in order and sees the output of the one before it.">
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor={`prompt-${question.id}`} className="field-label !mb-0">
                      Prompt {index + 1}
                    </label>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteQuestion(question.id)}
                        className="btn btn-ghost btn-sm text-sand-400"
                        aria-label={`Remove prompt ${index + 1}`}
                      >
                        <TrashIcon width={14} height={14} />
                        Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    id={`prompt-${question.id}`}
                    placeholder={
                      index === 0
                        ? `Write a brief introduction to {{${inputVariable || "topic"}}}`
                        : "Expand the previous answer into three key points"
                    }
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, e.target.value)}
                    rows={3}
                    className="field"
                  />
                </div>
              ))}
            </div>
            {errors.questionText && <p className="mt-2 text-sm text-red-300">{errors.questionText}</p>}
            <button type="button" onClick={addQuestion} className="btn btn-secondary mt-4">
              <PlusIcon width={14} height={14} />
              Add prompt
            </button>
          </Section>

          <Section step="3" title="Output format" hint="How the final result is laid out.">
            <textarea
              aria-label="Output format"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              rows={4}
              className="field font-mono text-sm"
            />
            {errors.outputFormat && <p className="mt-1.5 text-sm text-red-300">{errors.outputFormat}</p>}
            <p className="mt-3 text-xs text-sand-500">
              <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-ember-300">{"{{previousContext}}"}</code>{" "}
              is replaced with the output of the last prompt.
            </p>
          </Section>
        </div>

        <aside className="card p-6 lg:sticky lg:top-24">
          <p className="eyebrow">Preview</p>
          <p className="mt-2 truncate font-display text-lg font-semibold tracking-tight">
            {title || "Untitled workflow"}
          </p>
          <ol className="mt-5">
            <PreviewStep type="input" title={`{{${inputVariable || "…"}}}`} />
            {questions.map((q, i) => (
              <PreviewStep key={q.id} type="llm" title={q.text.trim() || `Prompt ${i + 1}`} />
            ))}
            <PreviewStep type="output" title="Final result" last />
          </ol>
          <button type="submit" disabled={isPending} className="btn btn-primary btn-lg mt-6 w-full">
            {isPending && <SpinnerIcon />}
            {isPending ? "Creating…" : "Create workflow"}
          </button>
          <Link to="/chains" className="btn btn-ghost mt-2 w-full">
            Cancel
          </Link>
        </aside>
      </form>
    </AppShell>
  );
}
