const Reply = ({ ...props }) => {
  return (
    <svg
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-testid="SendIcon"
      width={props.width ?? 24}
      height={props.height ?? 24}
    >
      <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11" fill="currentColor"></path>
    </svg>
  );
};

export default Reply;
