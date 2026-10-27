const paths = {
  arrow: "M5 12h14m-6-6 6 6-6 6", external: "M7 17 17 7M7 7h10v10", back: "M19 12H5m6-6-6 6 6 6",
  book: "M12 5v15M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1Z",
  code: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 20", search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  layers: "m12 3 10 5-10 5L2 8Zm-9 10 9 5 9-5m-18 5 9 5 9-5", check: "m5 12 4 4L19 6",
  clock: "M12 7v5l3 2M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0Z", menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6", sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z",
  moon: "M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z", focus: "M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5M8 12h8",
  copy: "M8 8h12v13H8ZM16 8V3H3v13h5", download: "M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4",
  chevron: "m8 10 4 4 4-4", up: "m6 14 6-6 6 6", alert: "M12 8v5m0 4v.1M12 3 2 21h20Z",
  bookmark: "M5 3h14v18l-7-4-7 4Z", user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2",
  grid: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z", play: "m8 4 13 8-13 8Z",
} as const;
export type IconName = keyof typeof paths;
export default function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name]} /></svg>;
}
