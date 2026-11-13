export type IconName =
  | "book"
  | "scroll"
  | "scholar"
  | "lotus"
  | "hands"
  | "star"
  | "spark"
  | "search"
  | "menu"
  | "close"
  | "alert"
  | "refresh";

/**
 * Decorative inline icons. Every icon has fixed width/height attributes AND a
 * sizing class, and cannot shrink in a flex row, so it never renders at an
 * unbounded or squashed size.
 */
export function Icon({
  name,
  className = "h-6 w-6",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className: `shrink-0 ${className}`,
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };

  switch (name) {
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
          <path d="M8 7h8M8 11h6" />
        </svg>
      );
    case "scroll":
      return (
        <svg {...common}>
          <path d="M8 4h10a2 2 0 0 1 2 2v1H10a2 2 0 0 0-2 2v9a2 2 0 0 1-4 0V6a2 2 0 0 1 2-2h2" />
          <path d="M12 12h6M12 15h4" />
        </svg>
      );
    case "scholar":
      return (
        <svg {...common}>
          <path d="m3 9 9-5 9 5-9 5-9-5Z" />
          <path d="M7 11.5V16c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5v-4.5" />
        </svg>
      );
    case "lotus":
      return (
        <svg {...common}>
          <path d="M12 20c-3-2-5-5-5-8 0-2 1-4 5-8 4 4 5 6 5 8 0 3-2 6-5 8Z" />
          <path d="M3 13c2 0 4 1 6 3M21 13c-2 0-4 1-6 3" />
        </svg>
      );
    case "hands":
      return (
        <svg {...common}>
          <path d="M12 21c-4-3-7-6-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 4-3 7-7 10Z" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4.2-4.2" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 4 2.5 20h19L12 4Z" />
          <path d="M12 10v4M12 17.2v.1" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 12a8 8 0 1 1-2.6-5.9" />
          <path d="M20 4v5h-5" />
        </svg>
      );
  }
}
