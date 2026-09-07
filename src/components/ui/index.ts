/**
 * The PathEd design system.
 *
 * Single import surface for every shared UI primitive — import from
 * `@/components/ui` rather than reaching into individual files, so component
 * internals can be reorganised without touching call sites.
 *
 * Design tokens live in `src/app/globals.css`:
 *   - semantic colours are bridged into Tailwind (`bg-surface`, `text-muted`,
 *     `border-line`), so use those utilities instead of raw hex values;
 *   - typography uses the `type-*` scale (`type-h2`, `type-body`, `type-caption`)
 *     rather than ad-hoc font-size/weight/tracking combinations;
 *   - radius, shadow, motion and z-index read from `var(--radius-*)`,
 *     `var(--shadow-*)`, `var(--duration-*)`, `var(--z-*)`.
 */

// Core controls, surfaces and page furniture.
export {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  PageHeader,
  PageSpinner,
  Select,
  Skeleton,
  Textarea,
} from "./primitives";

// Overlays.
export { Dialog, ConfirmDialog } from "./Dialog";
export { Drawer } from "./Drawer";
export { Menu, type MenuGroup, type MenuItem } from "./Menu";
export { Tooltip } from "./Tooltip";
export { ToastProvider, useToast, type ToastTone } from "./Toast";

// Navigation / selection.
export { Segmented, TabPanel, Tabs, type TabItem } from "./Tabs";

// Forms.
export {
  Checkbox,
  FieldGroup,
  FormField,
  PasswordInput,
  RadioGroup,
  SearchInput,
  Switch,
} from "./forms";

// Data display.
export {
  Avatar,
  DataTable,
  DescriptionList,
  LoadMore,
  Pagination,
  Progress,
  StatCard,
  type Column,
  type SortState,
} from "./data";

// Page layout.
export {
  Breadcrumb,
  Divider,
  Prose,
  Section,
  Toolbar,
} from "./layout";

// Loading / empty / error states.
export {
  CardGridSkeleton,
  HeaderSkeleton,
  InlineLoader,
  ListSkeleton,
  PageSkeleton,
  RefreshOverlay,
  StatGridSkeleton,
} from "./feedback";
