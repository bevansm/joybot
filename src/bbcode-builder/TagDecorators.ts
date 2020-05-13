export const Newlines = (components: string[], tight?: boolean) =>
  components.join(`\n${tight ? '' : '\n'}`);

export const Color = (component: string, hex: string): string =>
  `[color=${hex}]${component}[/color]`;

export const Bold = (component: string) => `[b]${component}[/b]`;

export const Underline = (component: string) => `[u]${component}[/u]`;

export const List = (
  components: string[],
  ordered: boolean = true,
  numbered: boolean = true
) =>
  `[list${ordered && numbered ? '=1' : ''}]${components
    .map(c => `[*]${c}`)
    .join('')}[/list]`;

export const Strikethrough = (component: string) => `[s]${component}[/s]`;

export const Link = (component: string, href: string) =>
  `[url=${href}]${component}[/url]`;

export const Center = (component: string) => `[center]${component}[/center]`;

export const Size = (component: string, size: number = 100) =>
  `[size=${size}]${component}[/size]`;

export const Spoiler = (component: string) => `[spoiler]${component}[/spoiler]`;

export const Code = (obj: any, lang: string = 'json') =>
  `[code=${lang}]${JSON.stringify(obj, null, 2)}[/code]`;
