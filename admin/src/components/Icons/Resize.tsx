const ResizeIcon = ({ ...props }) => {
  return (
    <svg
      fill="currentColor"
      height={props.width ?? 200}
      width={props.height ?? 2000}
      viewBox="0 0 201.377 201.377"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M157.511,63.77l43.866,36.918l-43.865,36.92l0-24.421h-25.813v41.752h-25v-108.5h25v41.748h25.813L157.511,63.77z M43.866,113.19h25.813v41.748h25v-108.5h-25V88.19H43.866l0-24.421L0,100.689l43.866,36.918L43.866,113.19z"></path>{' '}
      </g>
    </svg>
  );
};

export default ResizeIcon;
