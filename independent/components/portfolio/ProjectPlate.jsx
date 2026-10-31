const VARIANTS = {
  gov: "M40 70h220M40 130h220M40 190h220M100 70v60M180 70v60M140 130v60M60 190v120M240 190v120M40 250h220M40 310h220",
  res: "M50 60h200v280H50zM50 180h200M150 60v120M150 230v110M110 230v110M190 230v110",
  ind: "M40 130h220M40 200h220M40 270h220M90 60v280M140 60v280M190 60v280M240 60v280",
  elv: "M80 80h140v90H80zM80 240h60v70H80zM160 240h60v70h-60zM150 170v70M110 240v-20h40M190 240v-20h-40",
  light: "M60 200h180M60 140c40-30 140-30 180 0M60 260c40 30 140 30 180 0M90 200a60 60 0 0 1 120 0M150 80v40M150 280v40",
};

export default function ProjectPlate({ category = "gov", label = "", className = "" }) {
  const d = VARIANTS[category] || VARIANTS.gov;

  return (
    <svg
      viewBox="0 0 300 380"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <rect x="0.5" y="0.5" width="299" height="379" strokeOpacity="0.35" />
      <path d="M18 18h24M18 18v24M282 18h-24M282 18v24M18 362h24M18 362v-24M282 362h-24M282 362v-24" strokeOpacity="0.6" />
      <path d={d} strokeOpacity="0.75" />
      <path d="M0 30v0M300 30v0" />
      <line x1="40" y1="345" x2="260" y2="345" strokeOpacity="0.25" strokeDasharray="2 4" />
      <circle cx="150" cy="200" r="3" fill="currentColor" stroke="none" opacity="0.9" />
      <text
        x="20"
        y="358"
        fill="currentColor"
        stroke="none"
        fontSize="8"
        letterSpacing="2"
        opacity="0.55"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </text>
    </svg>
  );
}