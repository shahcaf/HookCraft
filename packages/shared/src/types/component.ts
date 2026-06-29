// ─────────────────────────────────────────────
// Discord Component Types (Buttons, Select Menus)
// ─────────────────────────────────────────────

export type ButtonStyle = 1 | 2 | 3 | 4 | 5; // Primary, Secondary, Success, Danger, Link

export interface PartialEmoji {
  id?: string;
  name?: string;
  animated?: boolean;
}

export interface ButtonComponent {
  id: string; // client-side only
  type: 2;
  style: ButtonStyle;
  label?: string;
  emoji?: PartialEmoji;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
}

export interface SelectOption {
  id: string; // client-side only
  label: string;
  value: string;
  description?: string;
  emoji?: PartialEmoji;
  default?: boolean;
}

export interface StringSelectComponent {
  id: string; // client-side only
  type: 3;
  custom_id: string;
  options: SelectOption[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

export type MessageComponent = ButtonComponent | StringSelectComponent;

export interface ActionRow {
  id: string; // client-side only
  type: 1;
  components: MessageComponent[];
}
