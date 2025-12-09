import type { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  strokeWidth?: number;
  size?: number;
}

function IconVShapedArrowLeftOutlineDuo18({
  strokeWidth = 1.5,
  size = 18,
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        d="M10.5 15.25L6.25 9L10.5 2.75"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      ></path>
    </svg>
  );
}

export default IconVShapedArrowLeftOutlineDuo18;
