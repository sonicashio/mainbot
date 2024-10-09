export interface RouterMenuItem {
    route: string;
    icon?: string;
    localeName: string;
    badgeLocaleName?: string;
    subItems?: RouterMenuItem[];
}

export interface DividerMenuItem {
    localeName: string | null;
}

export type MenuItem = RouterMenuItem | DividerMenuItem;

export function isRouterMenuItem(menuItem: MenuItem): menuItem is RouterMenuItem {
    return (menuItem as RouterMenuItem).route !== undefined;
}
