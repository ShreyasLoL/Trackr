const ACTIVE_FILL = '#3B82F6';
const ACTIVE_STROKE = '#2563EB';
const INACTIVE_FILL = '#D1D5DB';
const INACTIVE_STROKE = '#9CA3AF';
const BODY_COLOR = '#E5E7EB';

const frontMuscles = [
  { id: 'chest', shapes: [{ cx: 100, cy: 90, rx: 22, ry: 12 }] },
  { id: 'front-deltoid', shapes: [{ cx: 65, cy: 78, rx: 8, ry: 10 }, { cx: 135, cy: 78, rx: 8, ry: 10 }] },
  { id: 'biceps', shapes: [{ cx: 58, cy: 100, rx: 6, ry: 14 }, { cx: 142, cy: 100, rx: 6, ry: 14 }] },
  { id: 'forearms', shapes: [{ cx: 55, cy: 128, rx: 5, ry: 12 }, { cx: 145, cy: 128, rx: 5, ry: 12 }] },
  { id: 'abs', shapes: [{ cx: 100, cy: 125, rx: 14, ry: 18 }] },
  { id: 'quads', shapes: [{ cx: 85, cy: 175, rx: 10, ry: 20 }, { cx: 115, cy: 175, rx: 10, ry: 20 }] },
  { id: 'tibialis', shapes: [{ cx: 85, cy: 220, rx: 5, ry: 15 }, { cx: 115, cy: 220, rx: 5, ry: 15 }] },
];

const backMuscles = [
  { id: 'traps', shapes: [{ cx: 300, cy: 78, rx: 18, ry: 10 }] },
  { id: 'rear-deltoid', shapes: [{ cx: 265, cy: 78, rx: 8, ry: 10 }, { cx: 335, cy: 78, rx: 8, ry: 10 }] },
  { id: 'triceps', shapes: [{ cx: 258, cy: 100, rx: 6, ry: 14 }, { cx: 342, cy: 100, rx: 6, ry: 14 }] },
  { id: 'lats', shapes: [{ cx: 282, cy: 105, rx: 12, ry: 18 }, { cx: 318, cy: 105, rx: 12, ry: 18 }] },
  { id: 'lower-back', shapes: [{ cx: 300, cy: 135, rx: 12, ry: 10 }] },
  { id: 'glutes', shapes: [{ cx: 288, cy: 158, rx: 12, ry: 10 }, { cx: 312, cy: 158, rx: 12, ry: 10 }] },
  { id: 'hamstrings', shapes: [{ cx: 288, cy: 185, rx: 8, ry: 18 }, { cx: 312, cy: 185, rx: 8, ry: 18 }] },
  { id: 'calves', shapes: [{ cx: 288, cy: 225, rx: 6, ry: 15 }, { cx: 312, cy: 225, rx: 6, ry: 15 }] },
];

function BodyOutline({ centerX }) {
  return (
    <g>
      {/* Head */}
      <circle cx={centerX} cy={40} r={20} fill={BODY_COLOR} stroke={INACTIVE_STROKE} strokeWidth={1} />
      {/* Neck */}
      <rect x={centerX - 7} y={58} width={14} height={12} fill={BODY_COLOR} stroke={INACTIVE_STROKE} strokeWidth={1} rx={2} />
      {/* Torso */}
      <rect x={centerX - 30} y={70} width={60} height={80} fill={BODY_COLOR} stroke={INACTIVE_STROKE} strokeWidth={1} rx={4} />
      {/* Left upper arm */}
      <rect x={centerX - 42} y={74} width={14} height={40} fill={BODY_COLOR} stroke={INACTIVE_STROKE} strokeWidth={1} rx={4} />
      {/* Right upper arm */}
      <rect x={centerX + 28} y={74} width={14} height={40} fill={BODY_COLOR} stroke={INACTIVE_STROKE} strokeWidth={1} rx={4} />
      {/* Left forearm */}
      <rect x={centerX - 40} y={114} width={12} height={32} fill={BODY_COLOR} stroke={INACTIVE_STROKE} strokeWidth={1} rx={4} />
      {/* Right forearm */}
      <rect x={centerX + 28} y={114} width={12} height={32} fill={BODY_COLOR} stroke={INACTIVE_STROKE} strokeWidth={1} rx={4} />
      {/* Left upper leg */}
      <rect x={centerX - 22} y={150} width={18} height={50} fill={BODY_COLOR} stroke={INACTIVE_STROKE} strokeWidth={1} rx={4} />
      {/* Right upper leg */}
      <rect x={centerX + 4} y={150} width={18} height={50} fill={BODY_COLOR} stroke={INACTIVE_STROKE} strokeWidth={1} rx={4} />
      {/* Left lower leg */}
      <rect x={centerX - 20} y={200} width={14} height={46} fill={BODY_COLOR} stroke={INACTIVE_STROKE} strokeWidth={1} rx={4} />
      {/* Right lower leg */}
      <rect x={centerX + 6} y={200} width={14} height={46} fill={BODY_COLOR} stroke={INACTIVE_STROKE} strokeWidth={1} rx={4} />
      {/* Label */}
      <text x={centerX} y={262} textAnchor="middle" className="text-xs" fill="#6B7280" fontSize={11}>
        {centerX < 200 ? 'Front' : 'Back'}
      </text>
    </g>
  );
}

function MuscleEllipses({ muscles, activeMuscles, colorMap }) {
  return muscles.map((muscle) => {
    const isActive = activeMuscles.includes(muscle.id);
    const customColor = colorMap && colorMap[muscle.id];
    const fill = customColor || (isActive ? ACTIVE_FILL : INACTIVE_FILL);
    const stroke = customColor ? customColor : isActive ? ACTIVE_STROKE : INACTIVE_STROKE;

    return muscle.shapes.map((s, i) => (
      <ellipse
        key={`${muscle.id}-${i}`}
        id={i === 0 ? muscle.id : undefined}
        cx={s.cx}
        cy={s.cy}
        rx={s.rx}
        ry={s.ry}
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
        opacity={0.85}
      />
    ));
  });
}

export default function BodyMapSVG({ activeMuscles = [], colorMap }) {
  return (
    <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md">
      {/* Front body */}
      <BodyOutline centerX={100} />
      <MuscleEllipses muscles={frontMuscles} activeMuscles={activeMuscles} colorMap={colorMap} />

      {/* Back body */}
      <BodyOutline centerX={300} />
      <MuscleEllipses muscles={backMuscles} activeMuscles={activeMuscles} colorMap={colorMap} />
    </svg>
  );
}
