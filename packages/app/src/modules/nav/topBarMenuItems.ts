export type TopBarMenuItem = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
};

/** Add global top-bar links here as the portal grows. */
export const topBarMenuItems: TopBarMenuItem[] = [
  // Example:
  // { id: 'docs', label: 'Docs', href: '/search?query=kind%3Adocumentation' },
  // { id: 'support', label: 'Support', href: 'https://github.com', external: true },
];

export const TOP_BAR_HEIGHT = 56;
