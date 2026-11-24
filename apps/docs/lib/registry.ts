/* Docs navigation. Pages not built yet are listed with `soon: true` so the
   roadmap is visible; they render greyed out in the sidebar. */

export interface NavItem {
  slug: string;
  title: string;
  description: string;
  soon?: boolean;
}
export interface NavGroup {
  title: string;
  base: string;
  items: NavItem[];
}

export const nav: NavGroup[] = [
  {
    title: 'Getting started',
    base: '/docs',
    items: [
      { slug: 'introduction', title: 'Introduction', description: 'What ui-kit is and how it is built.' },
      { slug: 'installation', title: 'Installation', description: 'Add ui-kit to a Next.js or React app.' },
      { slug: 'ai-prompts', title: 'AI prompts', description: 'Recreate any component with a pasted prompt.' },
    ],
  },
  {
    title: 'Foundations',
    base: '/docs/foundations',
    items: [
      { slug: 'colors', title: 'Colour & tokens', description: 'Two-layer tokens, dark mode and accents.' },
      { slug: 'typography', title: 'Typography', description: 'Type scale and font choices.' },
      { slug: 'motion', title: 'Motion', description: 'The soft-rise signature and spring presets.' },
      { slug: 'icons', title: 'Icons', description: 'Built-in stroke icon set.' },
    ],
  },
  {
    title: 'Actions',
    base: '/docs/components',
    items: [
      { slug: 'button', title: 'Button', description: 'Actions with press feedback and a loading state.' },
      { slug: 'toggle-group', title: 'Toggle & segmented', description: 'Pressable toggles and a gliding segmented control.' },
    ],
  },
  {
    title: 'Forms',
    base: '/docs/components',
    items: [
      { slug: 'field', title: 'Field & label', description: 'Labels, hints, errors and form layout.' },
      { slug: 'input', title: 'Input', description: 'Single-line text field, with icons and addons.' },
      { slug: 'textarea', title: 'Textarea', description: 'Multi-line text that grows with its content.' },
      { slug: 'native-select', title: 'Native select', description: 'The browser select, styled.' },
      { slug: 'select', title: 'Select', description: 'A compact choice with a keyboard-friendly list.' },
      { slug: 'combobox', title: 'Combobox', description: 'Search and pick without leaving the field.' },
      { slug: 'multi-select', title: 'Multi-select', description: 'Pick several values, shown as chips.' },
      { slug: 'number-input', title: 'Number input', description: 'Bounded numbers with step buttons.' },
      { slug: 'tag-input', title: 'Tag input', description: 'Type and press Enter to add tags.' },
      { slug: 'file-dropzone', title: 'File dropzone', description: 'Drop or browse files, with a file list.' },
      { slug: 'checkbox', title: 'Checkbox', description: 'A binary choice with a precise state.' },
      { slug: 'radio-group', title: 'Radio group', description: 'Choose one option from a visible set.' },
      { slug: 'switch', title: 'Switch', description: 'A setting that takes effect immediately.' },
      { slug: 'slider', title: 'Slider', description: 'Pick a value or a range on a track.' },
      { slug: 'input-otp', title: 'Input OTP', description: 'One-time codes, one box per digit.' },
      { slug: 'rating', title: 'Rating', description: 'Capture a quick opinion with stars.' },
      { slug: 'calendar', title: 'Calendar', description: 'Browse and pick dates in a month view.' },
      { slug: 'date-picker', title: 'Date picker', description: 'Pick a date or a range from a field.' },
      { slug: 'time-picker', title: 'Time picker', description: 'Pick a time with the keyboard or a list.' },
    ],
  },
  {
    title: 'Overlays',
    base: '/docs/components',
    items: [
      { slug: 'dialog', title: 'Dialog', description: 'A modal surface for decisions that need attention.' },
      { slug: 'alert-dialog', title: 'Alert dialog', description: 'A confirmation that blocks until answered.' },
      { slug: 'sheet', title: 'Sheet', description: 'A side or bottom panel for focused work.' },
      { slug: 'popover', title: 'Popover', description: 'A small anchored surface for context.' },
      { slug: 'tooltip', title: 'Tooltip', description: 'Short supporting text on hover and focus.' },
      { slug: 'dropdown-menu', title: 'Dropdown menu', description: 'A focused list of actions on a trigger.' },
      { slug: 'context-menu', title: 'Context menu', description: 'Right-click actions next to the object.' },
      { slug: 'hover-card', title: 'Hover card', description: 'Preview a person or link on hover.' },
      { slug: 'command', title: 'Command palette', description: 'Search and run anything with ⌘K.' },
    ],
  },
  {
    title: 'Feedback',
    base: '/docs/components',
    items: [
      { slug: 'toast', title: 'Toast', description: 'Stacked notifications with promise states.' },
      { slug: 'alert', title: 'Alert', description: 'A persistent message in the page.' },
      { slug: 'progress', title: 'Progress', description: 'How much of a known task is done.' },
      { slug: 'spinner', title: 'Spinner', description: 'Work in progress, duration unknown.' },
      { slug: 'skeleton', title: 'Skeleton', description: 'Reserve space while content loads.' },
    ],
  },
  {
    title: 'Display',
    base: '/docs/components',
    items: [
      { slug: 'card', title: 'Card', description: 'A contained group of content and actions.' },
      { slug: 'badge', title: 'Badge', description: 'A small label for status or metadata.' },
      { slug: 'avatar', title: 'Avatar', description: 'People and accounts, alone or in groups.' },
      { slug: 'kbd', title: 'Kbd', description: 'Keyboard keys and shortcuts.' },
      { slug: 'separator', title: 'Separator', description: 'A quiet line between groups.' },
      { slug: 'tabs', title: 'Tabs', description: 'Switch between views in place.' },
      { slug: 'accordion', title: 'Accordion', description: 'Reveal sections in place.' },
      { slug: 'empty-state', title: 'Empty state', description: 'A useful next step when there is nothing yet.' },
      { slug: 'timeline', title: 'Timeline', description: 'What happened, newest first.' },
      { slug: 'carousel', title: 'Carousel', description: 'Browse slides by swipe, arrows or dots.' },
      { slug: 'scroll-area', title: 'Scroll area', description: 'Thin overlay scrollbars and edge fades.' },
      { slug: 'resizable', title: 'Resizable panels', description: 'Drag the divider to trade space.' },
      { slug: 'item', title: 'Item & list', description: 'Rows with media, text and actions.' },
    ],
  },
  {
    title: 'Navigation',
    base: '/docs/components',
    items: [
      { slug: 'navbar', title: 'Navbar', description: 'Responsive top navigation.' },
      { slug: 'sidebar', title: 'Sidebar', description: 'Collapsible app sidebar.' },
      { slug: 'navigation-menu', title: 'Navigation menu', description: 'Site menus with rich panels.' },
      { slug: 'menubar', title: 'Menubar', description: 'Desktop-style menus in a bar.' },
      { slug: 'breadcrumb', title: 'Breadcrumb', description: 'Where a page sits in the hierarchy.' },
      { slug: 'pagination', title: 'Pagination', description: 'Move through long collections.' },
      { slug: 'stepper', title: 'Stepper', description: 'Progress through a multi-step flow.' },
    ],
  },
  {
    title: 'Data',
    base: '/docs/components',
    items: [
      { slug: 'table', title: 'Table', description: 'Clean, compact and sticky-header tables.' },
      { slug: 'data-table', title: 'Data table', description: 'Sort, filter, select and paginate rows.' },
      { slug: 'stat', title: 'Stat & metric', description: 'A number with context and trend.' },
      { slug: 'animated-counter', title: 'Animated counter', description: 'Numbers that roll to their new value.' },
      { slug: 'description-list', title: 'Description list', description: 'Key and value details.' },
      { slug: 'copy-button', title: 'Copy button', description: 'Copy a value with instant confirmation.' },
    ],
  },
  {
    title: 'Charts',
    base: '/docs/components',
    items: [
      { slug: 'area-chart', title: 'Area chart', description: 'Trends with soft gradient areas.' },
      { slug: 'line-chart', title: 'Line chart', description: 'Several series over time.' },
      { slug: 'bar-chart', title: 'Bar chart', description: 'Compare values, grouped or stacked.' },
      { slug: 'donut-chart', title: 'Donut & pie', description: 'Parts of a whole.' },
      { slug: 'radial-chart', title: 'Radial & gauge', description: 'Progress toward a goal.' },
      { slug: 'sparkline', title: 'Sparkline', description: 'A tiny trend beside a value.' },
    ],
  },
  {
    title: 'Signature',
    base: '/docs/components',
    items: [
      { slug: 'action-button', title: 'Action button', description: 'Save → Saved, with a label that morphs.' },
      { slug: 'hold-to-confirm', title: 'Hold to confirm', description: 'Confirm destructive actions by holding.' },
      { slug: 'confirm-morph', title: 'Confirm morph', description: 'A button that becomes its own confirmation.' },
      { slug: 'inline-edit', title: 'Inline edit', description: 'Rename in place without moving.' },
      { slug: 'expanding-search', title: 'Expanding search', description: 'An icon that grows into a search field.' },
      { slug: 'theme-switch', title: 'Theme switch', description: 'Smooth light and dark transitions.' },
    ],
  },
];

export const allPages = nav.flatMap((g) => g.items.map((i) => ({ ...i, href: `${g.base}/${i.slug}`, group: g.title })));

export function findPage(href: string) {
  return allPages.find((p) => p.href === href);
}

export function neighbours(href: string) {
  const live = allPages.filter((p) => !p.soon);
  const i = live.findIndex((p) => p.href === href);
  return { prev: i > 0 ? live[i - 1] : undefined, next: i >= 0 ? live[i + 1] : undefined };
}
