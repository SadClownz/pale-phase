import {
  batch,
  createEffect,
  createSignal,
  For,
  type Accessor,
  type ComponentProps,
} from "solid-js";
import { ModeContext, useMode } from "./ModeProvider";
import {
  evaluate as evaluateCalc,
  mergeNumbers,
  shuntingYard,
  type CalcNode,
  Operator,
} from "../lib/shuntingYard";

export default function App() {
  const [mode, setMode] = createSignal<"basic" | "scientific">("basic");
  const [buffer, setBuffer] = createSignal<CalcNode[]>([]);
  const [result, setResult] = createSignal<number | string>(0);
  function appendNumber(value: number) {
    setBuffer(
      mergeNumbers([...buffer(), { value: value.toString(), type: "number" }])
    );
  }
  function clear() {
    batch(() => {
      setBuffer([]);
      setResult(0);
    });
  }
  function appendOperator(value: (typeof Operator)[keyof typeof Operator]) {
    if (value === Operator.DOT) {
      const prev = buffer()[buffer().length - 1];
      if (prev.type === "number") {
        setBuffer([
          ...buffer().slice(0, -1),
          { value: `${prev.value}.`, type: "number" },
        ]);
      }
    } else if (value === Operator.SWAP) {
      const prev = buffer()[buffer().length - 1];
      if (prev.type === "number") {
        setBuffer([
          ...buffer().slice(0, -1),
          { value: `${-Number(prev.value)}`, type: "number" },
        ]);
      }
    } else {
      setBuffer([...buffer(), { value, type: "operator" }]);
    }
  }

  function removeRight() {
    const prev = buffer()[buffer().length - 1];
    if (prev.type === "number" && prev.value.length > 1) {
      const length = prev.value.length > 1 ? prev.value.length - 1 : 1;
      setBuffer([
        ...buffer().slice(0, -1),
        { value: prev.value.slice(0, length), type: "number" },
      ]);
    } else {
      setBuffer(buffer().slice(0, -1));
    }
  }
  function evaluate() {
    try {
      const shunted = shuntingYard(buffer());
      const evaluated = evaluateCalc(shunted);
      if (evaluated) {
        const floored = evaluated.toFixed(10);
        batch(() => {
          setBuffer([{ value: floored, type: "number" }]);
          setResult(Number(floored));
        });
      }
    } catch (e) {
      setResult((e as Error).message);
    }
  }
  createEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      console.log(e.key);
      switch (e.key) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          appendNumber(Number(e.key));
          break;
        case "+":
        case "-":
        case "*":
        case "/":
        case "%":
        case ".":
          appendOperator(e.key as (typeof Operator)[keyof typeof Operator]);
          break;
        case "Enter":
          evaluate();
          break;
        case "Backspace":
          removeRight();
          break;
        case "Escape":
          clear();
          break;
        case "Swap":
          appendOperator(Operator.SWAP);
          break;
        case "Delete":
          clear();
          break;
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  });

  return (
    <ModeContext.Provider value={{ mode, actions: { changeMode: setMode } }}>
      <div class="flex flex-col p-4 gap-4">
        <header class="flex justify-end ">
          <HistoryToggle />
        </header>
        <article class="rounded-4xl bg-surface text-on-surface max-w-[26.875rem] w-full mx-auto">
          <Display buffer={buffer} setBuffer={setBuffer} result={result} />
          <Keypad
            appendNumber={appendNumber}
            appendOperator={appendOperator}
            removeRight={removeRight}
            clear={clear}
            evaluate={evaluate}
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
  buffer: Accessor<CalcNode[]>;
  setBuffer: (value: CalcNode[]) => void;
  result: Accessor<number | string>;
}) {
  return (
    <div class="text-on-surface bg-surface-variant rounded-2xl p-6">
      <span class="text-5xl bg-transparent border-none outline-none text-right text-on-surface h-12 block w-full overflow-x-auto">
        <For each={props.buffer()}>
          {(node) => {
            if (node.type === "number") {
              return node.value;
            }
            return <span class="mx-2 inline-block">{node.value}</span>;
          }}
        </For>
      </span>
      <span class="text-on-surface-variant text-4xl text-right block w-full mt-4">
        {props.result()}
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
  evaluate: () => void;
}) {
  return (
    <div class="w-full grid place-items-center ">
      <div class="grid grid-cols-[repeat(4,3.5rem)] place-items-center gap-2 p-4">
        <Key data-priority="secondary" onClick={() => props.clear()}>
          AC
        </Key>
        <Key
          data-priority="secondary"
          onClick={() => props.appendOperator(Operator.SWAP)}
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
        <Key data-priority="secondary" onClick={() => props.evaluate()}>
          =
        </Key>
      </div>
    </div>
  );
}
