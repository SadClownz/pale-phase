import { createSignal, type Accessor, type ComponentProps } from "solid-js";
import { ModeContext, useMode } from "./ModeProvider";

const Operator = {
  PLUS: "+",
  MINUS: "-",
  MULTIPLY: "*",
  DIVIDE: "/",
  EQUAL: "=",
  MOD: "%",
  LEFT_PAREN: "(",
  RIGHT_PAREN: ")",
} as const;

type Node =
  | {
      value: number;
      type: "number";
    }
  | {
      value: (typeof Operator)[keyof typeof Operator];
      type: "operator";
    };

export default function App() {
  const [mode, setMode] = createSignal<"basic" | "scientific">("basic");
  const [buffer, setBuffer] = createSignal<string>("");
  function append(value: string) {
    setBuffer(buffer() + value);
  }
  function clear() {
    setBuffer("");
  }

  return (
    <ModeContext.Provider value={{ mode, actions: { changeMode: setMode } }}>
      <div class="flex flex-col p-4 gap-4">
        <header class="flex justify-end ">
          <HistoryToggle />
        </header>
        <article class="rounded-4xl bg-surface text-on-surface max-w-2xl mx-auto">
          <Display buffer={buffer} setBuffer={setBuffer} />
          <Keypad append={append} clear={clear} />
        </article>
      </div>
    </ModeContext.Provider>
  );
}

function ModeSwitcher() {
  const { mode, actions } = useMode();
  return (
    <button
      onClick={() =>
        actions.changeMode(mode() === "basic" ? "scientific" : "basic")
      }
    >
      {mode()}
    </button>
  );
}
function HistoryToggle() {
  return <button class="size-10 rounded-full appearance-none">H</button>;
}
function Display(props: {
  buffer: Accessor<string>;
  setBuffer: (value: string) => void;
}) {
  return (
    <div class="text-on-surface bg-surface-variant rounded-2xl p-6">
      <span class="text-5xl bg-transparent border-none outline-none text-right text-on-surface h-12 block w-full">
        {props.buffer()}
      </span>
      <span class="text-on-surface-variant text-4xl text-right block w-full mt-4">
        134
      </span>
    </div>
  );
}
function Key(props: ComponentProps<"button">) {
  return (
    <button
      class="size-14 rounded-2xl border-none outline-offset-2 outline-primary appearance-none bg-primary text-on-primary data-[priority=secondary]:bg-secondary-container data-[priority=secondary]:text-on-secondary-container data-[priority=low]:bg-surface-container-high data-[priority=low]:text-on-surface"
      {...props}
    />
  );
}

function Keypad(props: { append: (value: string) => void; clear: () => void }) {
  return (
    <div class="w-full grid place-items-center ">
      <div class="grid grid-cols-[repeat(4,3.5rem)] place-items-center gap-2 p-4">
        <Key data-priority="secondary" onClick={() => props.clear()}>
          AC
        </Key>
        <Key data-priority="secondary" onClick={() => props.append("+/-")}>
          +/-
        </Key>
        <Key data-priority="secondary" onClick={() => props.append("/")}>
          /
        </Key>
        <Key data-priority="secondary" onClick={() => props.append("%")}>
          %
        </Key>
        <Key data-priority="low" onClick={() => props.append("7")}>
          7
        </Key>
        <Key data-priority="low" onClick={() => props.append("8")}>
          8
        </Key>
        <Key data-priority="low" onClick={() => props.append("9")}>
          9
        </Key>
        <Key data-priority="secondary" onClick={() => props.append("*")}>
          *
        </Key>
        <Key data-priority="low" onClick={() => props.append("4")}>
          4
        </Key>
        <Key data-priority="low" onClick={() => props.append("5")}>
          5
        </Key>
        <Key data-priority="low" onClick={() => props.append("6")}>
          6
        </Key>
        <Key data-priority="secondary" onClick={() => props.append("-")}>
          -
        </Key>
        <Key data-priority="low" onClick={() => props.append("4")}>
          1
        </Key>
        <Key data-priority="low" onClick={() => props.append("5")}>
          2
        </Key>
        <Key data-priority="low" onClick={() => props.append("6")}>
          3
        </Key>
        <Key data-priority="secondary" onClick={() => props.append("+")}>
          +
        </Key>
        <Key data-priority="low" onClick={() => props.append("B")}>
          B
        </Key>
        <Key data-priority="low" onClick={() => props.append("0")}>
          0
        </Key>
        <Key data-priority="low" onClick={() => props.append(",")}>
          ,
        </Key>
        <Key data-priority="secondary" onClick={() => props.append("=")}>
          =
        </Key>
      </div>
    </div>
  );
}
