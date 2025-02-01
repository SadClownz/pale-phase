import { createContext, useContext, type Accessor } from "solid-js";

export const ModeContext = createContext<{
  mode: Accessor<"basic" | "scientific">;
  actions: { changeMode: (mode: "basic" | "scientific") => void };
}>();

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
