export interface IMenu {
  name: string;
  icon: string;
  uri?: string | null;
  visible?: boolean;
  children?: {
    label: string;
    icon: string;
    to: string;
    visible?: boolean;
  }[];
}
