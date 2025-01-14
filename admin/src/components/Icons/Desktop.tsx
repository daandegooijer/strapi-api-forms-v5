const DesktopIcon = ({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 48}
      height={props.height ?? 48}
      viewBox="0 -960 960 960"
    >
      <path
        fill="currentColor"
        d="M336-120v-35l84-85H140q-24 0-42-18t-18-42v-480q0-24 18-42t42-18h680q24 0 42 18t18 42v480q0 24-18 42t-42 18H540l84 85v35H336ZM140-396h680v-384H140v384Zm0 0v-384 384Z"
      />
    </svg>
  );
};

export default DesktopIcon;
