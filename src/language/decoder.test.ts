import { describe, expect, it } from "vitest";
import { ALPHABET, parsePrompt, runDecoder, type Letter } from "./decoder";

describe("fixed-weight letter decoder", () => {
  it("validates and tokenizes letter prompts", () => {
    expect(parsePrompt(" c, A b ")).toEqual(["C", "A", "B"]);
    expect(parsePrompt("ABCX")).toBeNull();
    expect(parsePrompt("AAAAAAAAA")).toBeNull();
    expect(parsePrompt(" , ")).toBeNull();
  });

  it("generates sorted output and EOS for every prompt up to four letters", () => {
    let prompts: Letter[][] = [[]];
    for (let length = 1; length <= 4; length++) {
      prompts = prompts.flatMap(prefix => ALPHABET.map(letter => [...prefix, letter]));
      for (const prompt of prompts) {
        expect(runDecoder(prompt).map(pass => pass.emitted)).toEqual([...[...prompt].sort(), "EOS"]);
      }
    }
  });

  it("cancels emitted values using the same attention weights and preserves duplicates at the maximum length", () => {
    const passes = runDecoder(parsePrompt("FFAABFDA")!);
    expect(passes.map(pass => pass.emitted)).toEqual(["A", "A", "A", "B", "D", "F", "F", "F", "EOS"]);
    const pass = passes[1];
    expect(pass.attention.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
    expect(pass.values.at(-1)).toEqual([-1, 0, 0, 0, 0, 0]);
    expect(pass.pooled[0]).toBeCloseTo(2 / pass.context.length);
    expect(passes.at(-1)?.availability).toEqual([0, 0, 0, 0, 0, 0]);
  });
});
