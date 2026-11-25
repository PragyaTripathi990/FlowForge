// Decorative DAG used on the landing and auth pages.
const NODES = [
  { x: 16, y: 170, w: 138, type: "Input", title: "{{topic}}", color: "#5fd4c8" },
  { x: 204, y: 62, w: 148, type: "LLM", title: "Research", color: "#ff8f3f" },
  { x: 204, y: 278, w: 148, type: "LLM", title: "Counterpoints", color: "#ff8f3f" },
  { x: 402, y: 170, w: 138, type: "Output", title: "Brief", color: "#93dc7c" },
];

const EDGES = [
  "M154 198 C180 198 178 90 204 90",
  "M154 198 C180 198 178 306 204 306",
  "M352 90 C378 90 376 198 402 198",
  "M352 306 C378 306 376 198 402 198",
];

export default function FlowGraphic({ className = "" }) {
  return (
    <svg viewBox="0 36 556 324" className={className} role="img" aria-label="A workflow graph: an input feeding two LLM nodes that merge into one output">
      {EDGES.map((d) => (
        <g key={d} fill="none">
          <path d={d} stroke="#3b322c" strokeWidth="2" />
          <path d={d} stroke="#ff6a1f" strokeWidth="2" strokeLinecap="round" className="flow-edge" />
        </g>
      ))}
      {NODES.map((n) => (
        <g key={n.title} transform={`translate(${n.x} ${n.y})`}>
          <rect width={n.w} height="56" rx="12" fill="#141110" stroke="#3b322c" />
          <rect x="0.5" y="12" width="3" height="32" rx="1.5" fill={n.color} />
          <text x="16" y="23" fill={n.color} fontSize="9.5" fontFamily="JetBrains Mono, monospace" letterSpacing="1.2">
            {n.type.toUpperCase()}
          </text>
          <text x="16" y="41" fill="#f6f0e9" fontSize="14" fontWeight="600" fontFamily="Instrument Sans, sans-serif">
            {n.title}
          </text>
          <circle cx="0" cy="28" r="4" fill="#0c0a09" stroke="#ff8f3f" strokeWidth="1.5" />
          <circle cx={n.w} cy="28" r="4" fill="#0c0a09" stroke="#ff8f3f" strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  );
}
