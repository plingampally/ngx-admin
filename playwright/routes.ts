// Every leaf route reachable in the app.
// NOTE: /pages/maps/gmaps is intentionally excluded — it needs a Google Maps
// API key and cannot render without one.
export const PAGE_ROUTES: string[] = [
  '/pages/dashboard',
  '/pages/iot-dashboard',
  '/pages/layout/stepper',
  '/pages/layout/list',
  '/pages/layout/infinite-list',
  '/pages/layout/accordion',
  '/pages/layout/tabs',
  '/pages/forms/inputs',
  '/pages/forms/layouts',
  '/pages/forms/buttons',
  '/pages/forms/datepicker',
  '/pages/ui-features/grid',
  '/pages/ui-features/icons',
  '/pages/ui-features/typography',
  '/pages/ui-features/search-fields',
  '/pages/modal-overlays/dialog',
  '/pages/modal-overlays/window',
  '/pages/modal-overlays/popover',
  '/pages/modal-overlays/tooltip',
  '/pages/modal-overlays/toastr',
  '/pages/extra-components/calendar',
  '/pages/extra-components/progress-bar',
  '/pages/extra-components/spinner',
  '/pages/extra-components/alert',
  '/pages/extra-components/calendar-kit',
  '/pages/extra-components/chat',
  '/pages/maps/leaflet',
  '/pages/maps/bubble',
  '/pages/maps/searchmap',
  '/pages/charts/echarts',
  '/pages/charts/d3',
  '/pages/charts/chartjs',
  '/pages/editors/tinymce',
  '/pages/editors/ckeditor',
  '/pages/tables/smart-table',
  '/pages/tables/tree-grid',
  '/pages/miscellaneous/404',
  '/auth/login',
  '/auth/register',
  '/auth/request-password',
  '/auth/reset-password',
];

// Subset covered by visual-regression screenshots.
export const VISUAL_ROUTES: string[] = [
  '/pages/dashboard',
  '/pages/iot-dashboard',
  '/pages/tables/smart-table',
  '/pages/charts/echarts',
  '/pages/charts/chartjs',
  '/pages/charts/d3',
  '/pages/maps/leaflet',
  '/pages/editors/tinymce',
  '/pages/forms/inputs',
  '/pages/ui-features/typography',
  '/pages/extra-components/calendar',
  '/auth/login',
];

export const THEMES = ['default', 'dark', 'cosmic', 'corporate'];

// Header nb-select option labels keyed by theme value.
export const THEME_LABELS: Record<string, string> = {
  default: 'Light',
  dark: 'Dark',
  cosmic: 'Cosmic',
  corporate: 'Corporate',
};
