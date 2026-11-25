import { useCallback, useRef, useState, memo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { NODE_TYPES, nodeMeta } from "../lib/nodeTypes";
import { PlusIcon } from "./Icons";

const EDGE_OPTIONS = {
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, color: "#ff6a1f" },
};

const EditableNode = memo(function EditableNode({ id, data, selected, isConnectable }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label || "");
  const meta = nodeMeta(data.type);

  const commit = () => {
    setEditing(false);
    data.onLabelChange(id, label);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      setLabel(data.label || "");
      setEditing(false);
    }
  };

  return (
    <div
      className={`w-60 rounded-xl border bg-ink-900 text-left shadow-lg shadow-black/40 transition-colors ${
        selected ? "border-ember-400" : "border-ink-600"
      }`}
      style={{ borderLeft: `3px solid ${meta.color}` }}
    >
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />

      <div className="flex items-center justify-between px-3 pt-2.5">
        <select
          value={NODE_TYPES[data.type] ? data.type : "llm"}
          onChange={(e) => data.onTypeChange(id, e.target.value)}
          className="nodrag cursor-pointer rounded bg-transparent font-mono text-[0.65rem] uppercase tracking-widest outline-none"
          style={{ color: meta.color }}
          aria-label="Node type"
          title={meta.hint}
        >
          {Object.entries(NODE_TYPES).map(([value, t]) => (
            <option key={value} value={value} className="bg-ink-900 text-sand-50">
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="px-3 pb-3 pt-1.5">
        {editing ? (
          <textarea
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            autoFocus
            rows={4}
            className="nodrag nowheel w-full resize-none rounded-md border border-ember-500 bg-ink-950 p-2 text-sm leading-snug text-sand-50 outline-none"
          />
        ) : (
          <p
            onDoubleClick={() => setEditing(true)}
            className="line-clamp-4 min-h-5 whitespace-pre-wrap break-words text-sm leading-snug text-sand-50"
            title="Double-click to edit"
          >
            {label || <span className="text-sand-500">Empty node</span>}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </div>
  );
});

const nodeTypes = { editableNode: EditableNode };

const toFlowNode = (node, index) => ({
  id: node.id || `node-${index}`,
  type: "editableNode",
  data: {
    label: node.text || node.prompt || `Node ${index + 1}`,
    type: node.type || "llm",
  },
  position: node.position || { x: index * 280, y: 100 },
});

const toFlowEdge = (edge, index) => ({
  id: edge.id || `edge-${index}`,
  source: edge.source || edge.from,
  target: edge.target || edge.to,
  ...EDGE_OPTIONS,
});

export default function ChainCanvas({ nodes, edges, onChange }) {
  const [flowNodes, setFlowNodes] = useState(() => nodes.map(toFlowNode));
  const [flowEdges, setFlowEdges] = useState(() => edges.map(toFlowEdge));

  // Always-current copy of the graph, so handlers that fire in the same tick
  // (e.g. deleting a node also removes its edges) build on each other.
  const latest = useRef({ nodes: flowNodes, edges: flowEdges });

  const commit = useCallback(
    (nextNodes, nextEdges, notify) => {
      latest.current = { nodes: nextNodes, edges: nextEdges };
      setFlowNodes(nextNodes);
      setFlowEdges(nextEdges);
      if (notify && onChange) {
        onChange({
          nodes: nextNodes.map((n) => ({
            id: n.id,
            text: n.data.label,
            type: n.data.type || "llm",
            position: n.position,
          })),
          edges: nextEdges.map((e) => ({ source: e.source, target: e.target })),
        });
      }
    },
    [onChange]
  );

  const handleNodesChange = useCallback(
    (changes) => {
      const next = applyNodeChanges(changes, latest.current.nodes);
      const meaningful = changes.some(
        (c) => c.type === "remove" || (c.type === "position" && c.dragging === false)
      );
      commit(next, latest.current.edges, meaningful);
    },
    [commit]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      const next = applyEdgeChanges(changes, latest.current.edges);
      commit(latest.current.nodes, next, changes.some((c) => c.type === "remove"));
    },
    [commit]
  );

  const onConnect = useCallback(
    (params) => {
      commit(latest.current.nodes, addEdge({ ...params, ...EDGE_OPTIONS }, latest.current.edges), true);
    },
    [commit]
  );

  const updateNodeData = useCallback(
    (nodeId, patch) => {
      const next = latest.current.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n
      );
      commit(next, latest.current.edges, true);
    },
    [commit]
  );

  const handleLabelChange = useCallback((id, label) => updateNodeData(id, { label }), [updateNodeData]);
  const handleTypeChange = useCallback((id, type) => updateNodeData(id, { type }), [updateNodeData]);

  const addNode = useCallback(() => {
    const current = latest.current.nodes;
    const rightmost = current.reduce((max, n) => Math.max(max, n.position.x), -280);
    const newNode = {
      id: `node-${Date.now()}`,
      type: "editableNode",
      data: { label: "New prompt", type: "llm" },
      position: { x: rightmost + 280, y: 260 },
    };
    commit([...current, newNode], latest.current.edges, true);
  }, [commit]);

  const preparedNodes = flowNodes.map((n) => ({
    ...n,
    data: { ...n.data, onLabelChange: handleLabelChange, onTypeChange: handleTypeChange },
  }));

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-ink-700 bg-ink-950">
      <div className="absolute left-3 top-3 z-10 flex items-center gap-3">
        <button onClick={addNode} className="btn btn-secondary btn-sm">
          <PlusIcon width={14} height={14} />
          Add node
        </button>
      </div>

      <ul className="absolute right-3 top-3 z-10 hidden items-center gap-3 rounded-lg border border-ink-700 bg-ink-900/90 px-3 py-1.5 text-xs text-sand-400 md:flex">
        {Object.values(NODE_TYPES).map((t) => (
          <li key={t.label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
            {t.label}
          </li>
        ))}
      </ul>

      <ReactFlow
        nodes={preparedNodes}
        edges={flowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={EDGE_OPTIONS}
        fitView
        fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
      >
        <Background variant={BackgroundVariant.Dots} color="#3b322c" gap={22} size={1.5} />
        <Controls showInteractive={false} />
      </ReactFlow>

      <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-ink-700 bg-ink-900/90 px-3 py-1.5 text-xs text-sand-400">
        Double-click a node to edit · drag between dots to connect · Backspace deletes the selection
      </p>
    </div>
  );
}
