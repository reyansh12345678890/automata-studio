const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../automata-core.js");

test("parity Mealy produces 01100 for 01010", () => {
    const machine = core.createParityMachine("mealy");
    const result = core.simulateMachine(machine, "01010");
    assert.equal(result.output, "01100");
});

test("1010 parity Mealy output is 1100", () => {
    const machine = core.createParityMachine("mealy");
    const result = core.simulateMachine(machine, "1010");
    assert.equal(result.output, "1100");
});

test("Mealy-to-Moore conversion preserves parity output", () => {
    const mealy = core.createParityMachine("mealy");
    const moore = core.convertMealyToMoore(mealy);
    const original = core.simulateMachine(mealy, "01010");
    const converted = core.simulateMachine(moore, "01010", false);
    const verification = core.verifyConversion(mealy, moore);

    assert.equal(converted.output, "01100");
    assert.equal(original.output, converted.output);
    assert.equal(verification.equivalent, true);
});

test("Moore-to-Mealy conversion follows Project 1 initial-output convention", () => {
    const moore = core.createParityMachine("moore");
    const mealy = core.convertMooreToMealy(moore);
    const original = core.simulateMachine(moore, "01010", true);
    const converted = core.simulateMachine(mealy, "01010");
    const verification = core.verifyConversion(moore, mealy);
    const conventionEquivalent = moore.stateOutputs[moore.start] + converted.output;

    assert.equal(original.output, "001100");
    assert.equal(converted.output, "01100");
    assert.equal(conventionEquivalent, original.output);
    assert.equal(verification.equivalent, true);
});

test("1010 parity Moore output includes the initial-state output", () => {
    const moore = core.createParityMachine("moore");
    const result = core.simulateMachine(moore, "1010", true);
    assert.equal(result.output, "01100");
});

test("Moore-to-Mealy parity conversion preserves all four directed transitions", () => {
    const moore = core.createParityMachine("moore");
    const mealy = core.convertMooreToMealy(moore);

    assert.deepEqual(mealy.transitions.E["0"], { next: "E", output: "0" });
    assert.deepEqual(mealy.transitions.E["1"], { next: "O", output: "1" });
    assert.deepEqual(mealy.transitions.O["0"], { next: "O", output: "1" });
    assert.deepEqual(mealy.transitions.O["1"], { next: "E", output: "0" });
    assert.equal(core.simulateMachine(mealy, "01010").output, "01100");
});

test("01010 Moore and converted Mealy compare with initial-output convention", () => {
    const moore = core.createParityMachine("moore");
    const mealy = core.convertMooreToMealy(moore);
    const source = core.simulateMachine(moore, "01010", true);
    const converted = core.simulateMachine(mealy, "01010");

    assert.equal(source.output, "001100");
    assert.equal(converted.output, "01100");
    assert.equal(source.output.slice(moore.stateOutputs[moore.start].length), converted.output);
    const verification = core.verifyConversion(moore, mealy);
    assert.equal(verification.equivalent, true);
    assert.equal(verification.initialOutput, "0");
    assert.equal(verification.pairsChecked, 2);
    assert.deepEqual(verification.pairs, [["E", "E"], ["O", "O"]]);
});

test("1011 Moore and converted Mealy equivalence", () => {
    const moore = core.createParityMachine("moore");
    const mealy = core.convertMooreToMealy(moore);
    const source = core.simulateMachine(moore, "1011", true);
    const converted = core.simulateMachine(mealy, "1011");

    assert.equal(source.output, "01101");
    assert.equal(converted.output, "1101");
    assert.equal(source.output.slice(1), converted.output);
    assert.equal(core.verifyConversion(moore, mealy).equivalent, true);
});

test("all-zero Moore input and converted Mealy equivalence", () => {
    const moore = core.createParityMachine("moore");
    const mealy = core.convertMooreToMealy(moore);
    const source = core.simulateMachine(moore, "000", true);
    const converted = core.simulateMachine(mealy, "000");

    assert.equal(source.output, "0000");
    assert.equal(converted.output, "000");
    assert.equal(source.output.slice(1), converted.output);
    assert.equal(core.verifyConversion(moore, mealy).equivalent, true);
});
