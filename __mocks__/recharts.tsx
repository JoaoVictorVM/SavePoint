// Mock do Recharts — substitui todos os componentes por divs vazias.
// Suficiente pra renderizar a árvore sem ResizeObserver/SVG do JSDOM.
import React from "react";

type AnyProps = { children?: React.ReactNode };

const createStub = (name: string) => {
  const Stub: React.FC<AnyProps> = ({ children }) => (
    <div data-testid={`recharts-${name}`}>{children}</div>
  );
  Stub.displayName = name;
  return Stub;
};

export const ResponsiveContainer = createStub("ResponsiveContainer");
export const PieChart = createStub("PieChart");
export const Pie = createStub("Pie");
export const Cell = createStub("Cell");
export const Tooltip = createStub("Tooltip");
export const Legend = createStub("Legend");
export const AreaChart = createStub("AreaChart");
export const Area = createStub("Area");
export const CartesianGrid = createStub("CartesianGrid");
export const XAxis = createStub("XAxis");
export const YAxis = createStub("YAxis");
export const BarChart = createStub("BarChart");
export const Bar = createStub("Bar");
