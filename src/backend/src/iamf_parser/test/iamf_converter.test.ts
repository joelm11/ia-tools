// src/math.test.ts
import { expect, describe, it } from "vitest"; // If globals are not enabled

function add(a: number, b: number): number {
  return a + b;
}

describe("add", () => {
  it("should return the sum of two numbers", () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 5)).toBe(4);
    expect(add(0, 0)).toBe(0);
  });
});
