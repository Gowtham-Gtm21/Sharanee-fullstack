// Cohesive line-icon set at a consistent 1.5 stroke weight, 24px grid.
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };

export const Icon = {
  Search: ({ size = 20, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  // Wishlist — refined bookmark-heart, distinct from the card heart
  Wishlist: ({ size = 20, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M12 20.5s-6.8-4.2-9-8.4C1.4 8.9 3 5.8 6.2 5.8c1.9 0 3.1 1.1 3.8 2.3.7-1.2 1.9-2.3 3.8-2.3 3.2 0 4.8 3.1 3.2 6.3-2.2 4.2-9 8.4-9 8.4z" />
    </svg>
  ),
  Heart: ({ size = 20, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M12 20.5s-6.8-4.2-9-8.4C1.4 8.9 3 5.8 6.2 5.8c1.9 0 3.1 1.1 3.8 2.3.7-1.2 1.9-2.3 3.8-2.3 3.2 0 4.8 3.1 3.2 6.3-2.2 4.2-9 8.4-9 8.4z" />
    </svg>
  ),
  HeartFill: ({ size = 20, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...p}>
      <path d="M12 20.5s-6.8-4.2-9-8.4C1.4 8.9 3 5.8 6.2 5.8c1.9 0 3.1 1.1 3.8 2.3.7-1.2 1.9-2.3 3.8-2.3 3.2 0 4.8 3.1 3.2 6.3-2.2 4.2-9 8.4-9 8.4z" />
    </svg>
  ),
  User: ({ size = 20, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <circle cx="12" cy="8" r="3.6" /><path d="M4.5 20c.6-3.7 3.7-6 7.5-6s6.9 2.3 7.5 6" />
    </svg>
  ),
  Bag: ({ size = 20, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M6.2 8h11.6l-.9 11a2 2 0 0 1-2 1.8H9.1a2 2 0 0 1-2-1.8L6.2 8z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  ),
  // Shopping cart — clean trolley with wheels
  Cart: ({ size = 20, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M2.5 4h2.2l1.8 10.1a1.6 1.6 0 0 0 1.6 1.3h7.9a1.6 1.6 0 0 0 1.6-1.3l1.2-6.5H6.3" />
      <circle cx="9" cy="19.5" r="1.4" />
      <circle cx="17" cy="19.5" r="1.4" />
    </svg>
  ),
  Arrow: ({ size = 16, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  ArrowLeft: ({ size = 16, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  ),
  Chevron: ({ size = 16, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  Star: ({ size = 16, fill = false, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" {...p}>
      <path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9L6.4 19.5l1.1-6L3 9.3l6-.8L12 3z" />
    </svg>
  ),
  Trash: ({ size = 18, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13" />
    </svg>
  ),
  Edit: ({ size = 18, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5.5 16z" />
      <path d="M14 6l4 4" />
    </svg>
  ),
  Plus: ({ size = 18, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Menu: ({ size = 24, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  Close: ({ size = 22, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  // Phone — clean handset receiver
  Phone: ({ size = 16, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M6.6 3h3l1.4 4.4-2 1.3a11.5 11.5 0 0 0 5.3 5.3l1.3-2 4.4 1.4v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3z" />
    </svg>
  ),
  Mail: ({ size = 16, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M4 7l8 6 8-6" />
    </svg>
  ),
  Pin: ({ size = 16, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" /><circle cx="12" cy="10" r="2.4" />
    </svg>
  ),
  Truck: ({ size = 18, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" />
    </svg>
  ),
  Shield: ({ size = 18, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M12 3l7 3v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Refresh: ({ size = 18, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2" /><path d="M18 4v5h-5M6 20v-5h5" />
    </svg>
  ),
  Filter: ({ size = 18, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <path d="M3 5h18M6 12h12M10 19h4" />
    </svg>
  ),

  /* ---------- Social ---------- */
  // Facebook
  Facebook: ({ size = 18, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...p}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
    </svg>
  ),
  // X (formerly Twitter)
  X: ({ size = 18, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...p}>
      <path d="M17.5 3h3.1l-6.8 7.7L21.8 21h-6.2l-4.9-6.4L5.1 21H2l7.2-8.3L2.3 3h6.4l4.4 5.8L17.5 3zm-1.1 16.2h1.7L7.7 4.7H5.9l10.5 14.5z" />
    </svg>
  ),
  // Instagram
  Instagram: ({ size = 18, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  // YouTube
  Youtube: ({ size = 18, ...p }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...p}>
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="M10.4 9.3l5 2.7-5 2.7z" fill="currentColor" stroke="none" />
    </svg>
  ),

};