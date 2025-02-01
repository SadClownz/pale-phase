import { createSignal, For, type ComponentProps } from "solid-js";
import { ModeContext, useMode } from "./ModeProvider";
import { createStore, produce } from "solid-js/store";

const Operator = {
  PLUS: "+",
  MINUS: "-",
  MULTIPLY: "*",
  DIVIDE: "/",
  EQUAL: "=",
  MOD: "%",
  LEFT_PAREN: "(",
  RIGHT_PAREN: ")",
  DOT: ".",
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
  const [buffer, setBuffer] = createStore<Node[]>([]);
  function appendNumber(value: number) {
    setBuffer(produce((buffer) => buffer.push({ value, type: "number" })));
  }
  function clear() {
    setBuffer([]);
  }
  function appendOperator(value: (typeof Operator)[keyof typeof Operator]) {
    setBuffer(produce((buffer) => buffer.push({ value, type: "operator" })));
  }
  function removeRight() {
    setBuffer(produce((buffer) => buffer.pop()));
  }
  function evaluate() {}
  return (
    <ModeContext.Provider value={{ mode, actions: { changeMode: setMode } }}>
      <div class="flex flex-col p-4 gap-4">
        <header class="flex justify-end ">
          <HistoryToggle />
        </header>
        <article class="rounded-4xl bg-surface text-on-surface max-w-[26.875rem] w-full mx-auto">
          <Display buffer={buffer} setBuffer={setBuffer} />
          <Keypad
            appendNumber={appendNumber}
            appendOperator={appendOperator}
            removeRight={removeRight}
            clear={clear}
          />
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
  buffer: Node[];
  setBuffer: (value: Node[]) => void;
}) {
  return (
    <div class="text-on-surface bg-surface-variant rounded-2xl p-6">
      <span class="text-5xl bg-transparent border-none outline-none text-right text-on-surface h-12 block w-full overflow-x-auto">
        <For each={props.buffer}>
          {(node) => {
            if (node.type === "number") {
              return node.value;
            }
            return <span class="mx-2 inline-block">{node.value}</span>;
          }}
        </For>
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

function Keypad(props: {
  appendNumber: (value: number) => void;
  appendOperator: (value: (typeof Operator)[keyof typeof Operator]) => void;
  removeRight: () => void;
  clear: () => void;
}) {
  return (
    <div class="w-full grid place-items-center ">
      <div class="grid grid-cols-[repeat(4,3.5rem)] place-items-center gap-2 p-4">
        <Key data-priority="secondary" onClick={() => props.clear()}>
          AC
        </Key>
        <Key
          data-priority="secondary"
          onClick={() => props.appendOperator(Operator.PLUS)}
        >
          +/-
        </Key>
        <Key
          data-priority="secondary"
          onClick={() => props.appendOperator(Operator.DIVIDE)}
        >
          /
        </Key>
        <Key
          data-priority="secondary"
          onClick={() => props.appendOperator(Operator.MOD)}
        >
          %
        </Key>
        <Key data-priority="low" onClick={() => props.appendNumber(7)}>
          7
        </Key>
        <Key data-priority="low" onClick={() => props.appendNumber(8)}>
          8
        </Key>
        <Key data-priority="low" onClick={() => props.appendNumber(9)}>
          9
        </Key>
        <Key
          data-priority="secondary"
          onClick={() => props.appendOperator(Operator.MULTIPLY)}
        >
          *
        </Key>
        <Key data-priority="low" onClick={() => props.appendNumber(4)}>
          4
        </Key>
        <Key data-priority="low" onClick={() => props.appendNumber(5)}>
          5
        </Key>
        <Key data-priority="low" onClick={() => props.appendNumber(6)}>
          6
        </Key>
        <Key
          data-priority="secondary"
          onClick={() => props.appendOperator(Operator.MINUS)}
        >
          -
        </Key>
        <Key data-priority="low" onClick={() => props.appendNumber(1)}>
          1
        </Key>
        <Key data-priority="low" onClick={() => props.appendNumber(2)}>
          2
        </Key>
        <Key data-priority="low" onClick={() => props.appendNumber(3)}>
          3
        </Key>
        <Key
          data-priority="secondary"
          onClick={() => props.appendOperator(Operator.PLUS)}
        >
          +
        </Key>
        <Key data-priority="secondary" onClick={() => props.removeRight()}>
          B
        </Key>
        <Key data-priority="low" onClick={() => props.appendNumber(0)}>
          0
        </Key>
        <Key
          data-priority="secondary"
          onClick={() => props.appendOperator(".")}
        >
          .
        </Key>
        <Key
          data-priority="secondary"
          onClick={() => props.appendOperator(Operator.EQUAL)}
        >
          =
        </Key>
      </div>
    </div>
  );
}
