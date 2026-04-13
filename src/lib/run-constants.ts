export type FilterCategory = "favoritos" | "plataforma" | "tags" | "status" | "nota";

export const FILTER_CATEGORIES: { value: FilterCategory; label: string }[] = [
  { value: "favoritos", label: "Favoritos" },
  { value: "plataforma", label: "Plataforma" },
  { value: "tags", label: "Tags" },
  { value: "status", label: "Status" },
  { value: "nota", label: "Nota" },
];

export const NOTA_VALUES = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];

export type RunFilterPair = {
  id: string;
  category: FilterCategory | "";
  values: string[];
};
