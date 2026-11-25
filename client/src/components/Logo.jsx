import { Link } from "react-router-dom";

export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="ff-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb24d" />
          <stop offset="1" stopColor="#ff5a1f" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#ff-mark)" />
      <path
        d="M10 10.5h4.5a4 4 0 0 1 4 4v3a4 4 0 0 0 4 4H22M10 21.5h4.5"
        fill="none"
        stroke="#1a0f08"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="9.5" cy="10.5" r="2.6" fill="#1a0f08" />
      <circle cx="9.5" cy="21.5" r="2.6" fill="#1a0f08" />
      <circle cx="22.5" cy="21.5" r="2.6" fill="#1a0f08" />
    </svg>
  );
}

export default function Logo({ to = "/", size = 28 }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2.5" aria-label="FlowForge home">
      <LogoMark size={size} />
      <span className="font-display text-lg font-semibold tracking-tight text-sand-50">
        Flow<span className="text-ember-400">Forge</span>
      </span>
    </Link>
  );
}
