import type { SVGProps } from "react";

export type IconName =
  | "arrow-left"
  | "arrow-right"
  | "calendar"
  | "close"
  | "drag"
  | "reset"
  | "search"
  | "spark";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
  };

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      {...props}
    >
      {name === "arrow-left" && (
        <path {...common} d="M19 12H5m6-6-6 6 6 6" />
      )}
      {name === "arrow-right" && (
        <path {...common} d="M5 12h14m-6-6 6 6-6 6" />
      )}
      {name === "calendar" && (
        <>
          <path {...common} d="M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V6A1.5 1.5 0 0 1 5 4.5Z" />
          <path {...common} d="M7.5 2.5v4m9-4v4m-13 3h17" />
        </>
      )}
      {name === "close" && <path {...common} d="m6 6 12 12M18 6 6 18" />}
      {name === "drag" && (
        <>
          <path {...common} d="M4 12h16m-4-4 4 4-4 4M8 8l-4 4 4 4" />
          <path {...common} d="M12 5v14" opacity=".45" />
        </>
      )}
      {name === "reset" && (
        <>
          <path {...common} d="M4.5 8.5V4m0 0H9" />
          <path {...common} d="M5.2 6.1A8 8 0 1 1 4 14" />
        </>
      )}
      {name === "search" && (
        <>
          <circle {...common} cx="10.5" cy="10.5" r="6.5" />
          <path {...common} d="m15.3 15.3 4.2 4.2" />
        </>
      )}
      {name === "spark" && (
        <>
          <path {...common} d="M12 2.7c.5 4.9 2.4 7 6.8 7.7-4.4.7-6.3 2.8-6.8 7.7-.5-4.9-2.4-7-6.8-7.7C9.6 9.7 11.5 7.6 12 2.7Z" />
          <circle fill="currentColor" cx="19.2" cy="5" r="1" />
        </>
      )}
    </svg>
  );
}
