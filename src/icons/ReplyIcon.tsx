export default function CommentIcon(props: { color: string; height: number; width: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill={props.color}
      height={props.height}
      width={props.width}
    >
      <path d="M8.309 189.846L184.31 37.846C199.716 24.549 223.998 35.346 223.998 56.018V136.065C384.624 137.909 512 170.096 512 322.331C512 383.768 472.406 444.643 428.656 476.456C414.999 486.393 395.562 473.924 400.593 457.831C445.937 312.815 379.093 274.315 223.998 272.081V360.003C223.998 380.706 199.685 391.456 184.31 378.159L8.309 226.159C-2.754 216.596 -2.785 199.409 8.309 189.846Z" />
    </svg>
  );
}
