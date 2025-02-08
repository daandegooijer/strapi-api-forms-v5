const Email = ({ ...props }) => {
  return (
    <svg
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-testid="SendIcon"
      width={props.width ?? 24}
      height={props.height ?? 24}
    >
      <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"></path>
    </svg>
  );
};

export default Email;
