import type { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

function IconNut2({ size = 20, strokeWidth = 0, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      {...props}
    >
      <path
        d="m16.083,5.056l-4.688-2.858c-.861-.523-1.93-.524-2.791,0l-4.688,2.857c-.874.533-1.417,1.531-1.417,2.604v4.679c0,1.074.543,2.072,1.417,2.604l4.688,2.858c.43.262.913.393,1.395.393s.965-.131,1.395-.393l4.688-2.857c.874-.533,1.417-1.531,1.417-2.604v-4.679c0-1.074-.543-2.072-1.417-2.604Zm-6.083,7.944c-1.657,0-3-1.343-3-3s1.343-3,3-3,3,1.343,3,3-1.343,3-3,3Z"
        strokeWidth={strokeWidth}
        fill="currentColor"
      ></path>
    </svg>
  );
}

export default IconNut2;
