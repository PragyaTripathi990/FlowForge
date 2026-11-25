// Display metadata for the node types the execution engine understands.
export const NODE_TYPES = {
  input: { label: "Input", color: "#5fd4c8", hint: "Passes a run-time variable into the flow" },
  llm: { label: "LLM", color: "#ff8f3f", hint: "Sends the prompt to Gemini with upstream context" },
  transform: { label: "Transform", color: "#b9a1ff", hint: "Formats upstream output without calling the model" },
  output: { label: "Output", color: "#93dc7c", hint: "Formats the final result" },
};

export const nodeMeta = (type) => NODE_TYPES[type] || NODE_TYPES.llm;

// Variables a run has to supply: every {{name}} in the nodes except the
// built-in {{previousContext}}.
export function extractVariables(nodes = []) {
  const found = new Set();
  nodes.forEach((node) => {
    const text = node?.text || "";
    for (const match of text.matchAll(/\{\{(\w+)\}\}/g)) {
      if (match[1] !== "previousContext") found.add(match[1]);
    }
  });
  return [...found];
}
