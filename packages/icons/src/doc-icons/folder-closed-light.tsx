import type { SVGProps } from "react";

export function FolderClosedLightIcon(
  { className, ...props }: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M6.04184 23H22.2488C23.9828 23 25 21.9771 25 19.9509V9.84918C25 7.82295 23.9732 6.8 21.9582 6.8H12.6583C11.9996 6.8 11.6024 6.64262 11.118 6.21967L10.5271 5.72787C9.88773 5.17705 9.39367 5 8.43462 5H5.67371C3.97843 5 3 5.98361 3 7.96065V19.9509C3 21.9868 4.01717 23 6.04184 23Z"
        fill="url(#paint0_linear_794_1227)"
      />
      <path
        d="M5.67383 5.09961H8.43457C8.9083 5.09961 9.25896 5.14409 9.56738 5.25195C9.87506 5.3596 10.1481 5.53334 10.4619 5.80371L10.4629 5.80469L11.0537 6.29688C11.3008 6.5124 11.5311 6.66421 11.7871 6.76172C12.0439 6.85948 12.3208 6.90038 12.6582 6.90039H21.958C22.9497 6.90039 23.6807 7.15193 24.1641 7.63574C24.6473 8.11957 24.9004 8.85239 24.9004 9.84961V19.9512C24.9003 20.9485 24.6494 21.6825 24.2012 22.167C23.754 22.6503 23.0961 22.9004 22.249 22.9004H6.04199C5.04509 22.9004 4.31404 22.6504 3.83203 22.168C3.35027 21.6856 3.09966 20.9534 3.09961 19.9512V7.96094C3.09961 6.98763 3.34076 6.27498 3.77441 5.80664C4.20691 5.3396 4.84559 5.09961 5.67383 5.09961Z"
        stroke="white"
        stroke-opacity="0.1"
        stroke-width="0.2"
      />
      <rect x="3" y="9" width="22" height="14" rx="2.6" fill="#C0C0C0" />
      <rect
        x="3.1"
        y="9.1"
        width="21.8"
        height="13.8"
        rx="2.5"
        stroke="white"
        stroke-opacity="0.1"
        stroke-width="0.2"
      />
      <defs>
        <linearGradient
          id="paint0_linear_794_1227"
          x1="14"
          y1="5"
          x2="14"
          y2="23"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#BBBBBB" />
          <stop offset="1" stop-color="#444444" />
        </linearGradient>
      </defs>
    </svg>
  );
}
