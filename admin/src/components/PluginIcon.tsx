const PluginIcon = () => (
  <svg width="20" height="20" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="64" fill="#4DADF7" />

    <rect
      x="120"
      y="140"
      width="272"
      height="200"
      rx="16"
      fill="none"
      stroke="white"
      stroke-width="10"
    />
    <line
      x1="140"
      y1="180"
      x2="372"
      y2="180"
      stroke="white"
      stroke-width="8"
      stroke-linecap="round"
    />
    <line
      x1="140"
      y1="220"
      x2="300"
      y2="220"
      stroke="white"
      stroke-width="8"
      stroke-linecap="round"
    />
    <line
      x1="140"
      y1="260"
      x2="320"
      y2="260"
      stroke="white"
      stroke-width="8"
      stroke-linecap="round"
    />
    <circle cx="340" cy="220" r="10" fill="white" />
    <circle cx="360" cy="260" r="10" fill="white" />
    <text
      x="80"
      y="400"
      font-size="80"
      fill="white"
      font-family="Arial, sans-serif"
      font-weight="bold"
    >
      {}
    </text>
  </svg>
);

export { PluginIcon };
