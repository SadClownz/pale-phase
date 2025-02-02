export const Operator = {
  PLUS: "+",
  MINUS: "-",
  MULTIPLY: "*",
  DIVIDE: "/",
  EQUAL: "=",
  MOD: "%",
  LEFT_PAREN: "(",
  RIGHT_PAREN: ")",
  DOT: ".",
  EXPONENT: "^",
  SWAP: "SWAP",
} as const;

const OperatorMeta = {
  [Operator.PLUS]: {
    precedence: 1,
    associativity: "left",
  },
  [Operator.MINUS]: {
    precedence: 1,
    associativity: "left",
  },
  [Operator.MULTIPLY]: {
    precedence: 2,
    associativity: "left",
  },
  [Operator.DIVIDE]: {
    precedence: 2,
    associativity: "left",
  },
  [Operator.MOD]: {
    precedence: 2,
    associativity: "left",
  },
  [Operator.EXPONENT]: {
    precedence: 3,
    associativity: "right",
  },
} as const;

export type CalcNode = {
  value: string;
  type: "number" | "operator";
};

export function shuntingYard(tokens: CalcNode[]): string {
  const stack = [];
  const output = [];
  for (const token of tokens) {
    if (token.type === "number") {
      output.push(token.value.toString());
    } else if (token.type === "operator" && token.value in OperatorMeta) {
      while (
        stack.length > 0 &&
        stack[stack.length - 1].type === "operator" &&
        stack[stack.length - 1].value in OperatorMeta &&
        ((OperatorMeta[token.value as keyof typeof OperatorMeta]
          .associativity === "left" &&
          OperatorMeta[token.value as keyof typeof OperatorMeta].precedence <=
            OperatorMeta[
              stack[stack.length - 1].value as keyof typeof OperatorMeta
            ].precedence) ||
          (OperatorMeta[token.value as keyof typeof OperatorMeta]
            .associativity === "right" &&
            OperatorMeta[token.value as keyof typeof OperatorMeta].precedence <
              OperatorMeta[
                stack[stack.length - 1].value as keyof typeof OperatorMeta
              ].precedence))
      ) {
        output.push(stack.pop()?.value.toString());
      }
      stack.push(token);
    } else if (token.value === Operator.LEFT_PAREN) {
      stack.push(token);
    } else if (token.value === Operator.RIGHT_PAREN) {
      while (
        stack.length > 0 &&
        stack[stack.length - 1].value !== Operator.LEFT_PAREN
      ) {
        output.push(stack.pop()?.value.toString());
      }
      stack.pop();
    }
  }
  return output
    .concat(stack.reverse().map((token) => token.value.toString()))
    .join(" ");
}

export function isNumber(token: string) {
  return !isNaN(Number(token));
}
export function isOperator(token: string) {
  return token in OperatorMeta;
}
function applyOperator(left: number, operator: string, right: number) {
  let result: number = 0;
  switch (operator) {
    case Operator.PLUS:
      result = left + right;
      break;
    case Operator.MINUS:
      result = left - right;
      break;
    case Operator.MULTIPLY:
      result = left * right;
      break;
    case Operator.DIVIDE:
      result = left / right;
      break;
    case Operator.MOD:
      result = left % right;
      break;
    case Operator.EXPONENT:
      result = Math.pow(left, right);
      break;
  }
  return result;
}
export function evaluate(tokens: string) {
  const stack: number[] = [];
  for (const token of tokens.split(" ")) {
    if (isNumber(token)) {
      stack.push(Number(token));
    } else if (isOperator(token)) {
      const right = stack.pop();
      const left = stack.pop();
      if (left === undefined || right === undefined) {
        throw new Error("Invalid expression");
      }
      const result = applyOperator(left, token, right);
      stack.push(result);
    }
  }
  return stack.pop();
}

export function mergeNumbers(tokens: CalcNode[]) {
  const output: CalcNode[] = [];
  for (const token of tokens) {
    if (token.type === "number") {
      if (output.length > 0 && output[output.length - 1].type === "number") {
        output[output.length - 1] = {
          ...output[output.length - 1],
          value: `${output[output.length - 1].value}${token.value}`,
        };
      } else {
        output.push(token);
      }
    } else if (token.type === "operator") {
      output.push(token);
    }
  }
  return output;
}
