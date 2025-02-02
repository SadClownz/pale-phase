import { evaluate, mergeNumbers, shuntingYard } from "./shuntingYard";
import { describe, it, expect } from "bun:test";
describe("shuntingYard", () => {
  it("should return the correct output", () => {
    expect(
      shuntingYard([
        { value: "1", type: "number" },
        { value: "+", type: "operator" },
        { value: "2", type: "number" },
      ])
    ).toEqual("1 2 +");
  });
  it("should return the correct output", () => {
    const out = shuntingYard([
      { value: "3", type: "number" },
      { value: "+", type: "operator" },
      { value: "4", type: "number" },
      { value: "*", type: "operator" },
      { value: "2", type: "number" },
      { value: "/", type: "operator" },
      { value: "(", type: "operator" },
      { value: "1", type: "number" },
      { value: "-", type: "operator" },
      { value: "5", type: "number" },
      { value: ")", type: "operator" },
      { value: "^", type: "operator" },
      { value: "2", type: "number" },
      { value: "^", type: "operator" },
      { value: "3", type: "number" },
    ]);
    console.log(out);
    expect(out).toEqual("3 4 2 * 1 5 - 2 3 ^ ^ / +");
  });
});

describe("evaluate", () => {
  it("should return the correct output", () => {
    expect(evaluate("1 2 +")).toEqual(3);
  });
  it("should return the correct output", () => {
    expect(evaluate("3 4 2 * 1 5 - 2 3 ^ ^ / +")).toEqual(3.0001220703125);
  });
});

describe("mergeNumbers", () => {
  it("should return the correct output", () => {
    expect(
      mergeNumbers([
        { value: "1", type: "number" },
        { value: "2", type: "number" },
      ])
    ).toEqual([{ value: "12", type: "number" }]);
  });
  it("should return the correct output", () => {
    expect(
      mergeNumbers([
        { value: "1", type: "number" },
        { value: "2", type: "number" },
        { value: "+", type: "operator" },
        { value: "3", type: "number" },
      ])
    ).toEqual([
      { value: "12", type: "number" },
      { value: "+", type: "operator" },
      { value: "3", type: "number" },
    ]);
  });
});
