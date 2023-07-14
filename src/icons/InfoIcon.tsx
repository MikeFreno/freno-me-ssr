import React from "react";

export default function InfoIcon(props: {
  height: string | number | undefined;
  width: string | number | undefined;
  fill: string | undefined;
  stroke?: string | undefined;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      height={props.height}
      width={props.width}
    >
      <path
        fill={props.fill}
        stroke={props.stroke}
        d="M256 16C123.451 16 16 123.451 16 256S123.451 496 256 496S496 388.549 496 256S388.549 16 256 16ZM256 448C150.131 448 64 361.869 64 256S150.131 64 256 64S448 150.131 448 256S361.869 448 256 448ZM256 304C269.25 304 280 293.25 280 280V152C280 138.75 269.25 128 256 128S232 138.75 232 152V280C232 293.25 242.75 304 256 304ZM256 337.123C238.637 337.123 224.562 351.199 224.562 368.561C224.562 385.924 238.637 400 256 400S287.438 385.924 287.438 368.561C287.438 351.199 273.363 337.123 256 337.123Z"
      />
    </svg>
  );
}

InfoIcon;
