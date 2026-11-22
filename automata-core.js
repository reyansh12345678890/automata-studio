(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    if (root) root.AutomataCore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
    function convertMealyToMoore(machine) {
        if (!machine || machine.type !== "mealy") throw new Error("Source must be a Mealy machine.");
        const initial = `${machine.start}\u27e8start\u27e9`;
        const states = [initial];
        const stateOutputs = { [initial]: "\u03b5" };
        const transitions = { [initial]: {} };
        const pairNames = new Map();
        const queue = [];

        function pairName(state, incomingOutput) {
            const key = JSON.stringify([state, incomingOutput]);
            if (!pairNames.has(key)) {
                const name = `${state}\u27e8${incomingOutput}\u27e9`;
                pairNames.set(key, name);
                states.push(name);
                stateOutputs[name] = incomingOutput;
                transitions[name] = {};
                queue.push({ original: state, name });
            }
            return pairNames.get(key);
        }

        machine.inputs.forEach(symbol => {
            const edge = machine.transitions[machine.start][symbol];
            transitions[initial][symbol] = { next: pairName(edge.next, edge.output) };
        });

        while (queue.length) {
            const item = queue.shift();
            machine.inputs.forEach(symbol => {
                const edge = machine.transitions[item.original][symbol];
                transitions[item.name][symbol] = { next: pairName(edge.next, edge.output) };
            });
        }

        return {
            type: "moore",
            states,
            inputs: [...machine.inputs],
            outputs: [...machine.outputs],
            start: initial,
            transitions,
            stateOutputs
        };
    }

    function convertMooreToMealy(machine) {
        if (!machine || machine.type !== "moore") throw new Error("Source must be a Moore machine.");
        const transitions = {};
        machine.states.forEach(state => {
            transitions[state] = {};
            machine.inputs.forEach(symbol => {
                const next = machine.transitions[state][symbol].next;
                transitions[state][symbol] = {
                    next,
                    output: machine.stateOutputs[next]
                };
            });
        });
        return {
            type: "mealy",
            states: [...machine.states],
            inputs: [...machine.inputs],
            outputs: [...machine.outputs],
            start: machine.start,
            transitions,
            stateOutputs: {}
        };
    }

    function simulateMachine(machine, input, includeMooreInitial = true) {
        if (!machine || typeof input !== "string") throw new Error("Machine and input string are required.");
        let state = machine.start;
        const output = [];
        const trace = [];

        if (machine.type === "moore" && includeMooreInitial) {
            const initialOutput = machine.stateOutputs[state];
            if (initialOutput !== "\u03b5") output.push(initialOutput);
        }

        for (let index = 0; index < input.length; index++) {
            const symbol = input[index];
            if (!machine.inputs.includes(symbol)) throw new Error(`Invalid input symbol: ${symbol}`);
            if (!machine.transitions[state] || !machine.transitions[state][symbol]) {
                throw new Error(`No transition defined for ${state} on ${symbol}.`);
            }
            const previous = state;
            const edge = machine.transitions[state][symbol];
            state = edge.next;
            const emitted = machine.type === "mealy"
                ? edge.output
                : machine.stateOutputs[state];
            if (emitted !== "\u03b5") output.push(emitted);
            trace.push({ step: index + 1, input: symbol, current: previous, next: state, output: emitted });
        }
        return { output: output.join(""), trace, finalState: state };
    }

    function createParityMachine(type) {
        const base = {
            inputs: ["0", "1"],
            outputs: ["0", "1"],
            start: "E",
            states: ["E", "O"],
            transitions: {
                E: {
                    "0": { next: "E", output: "0" },
                    "1": { next: "O", output: "1" }
                },
                O: {
                    "0": { next: "O", output: "1" },
                    "1": { next: "E", output: "0" }
                }
            },
            stateOutputs: {}
        };
        if (type === "moore") {
            return {
                ...base,
                type: "moore",
                stateOutputs: { E: "0", O: "1" }
            };
        }
        return { ...base, type: "mealy" };
    }

    function verifyConversion(source, target) {
        if (source.inputs.join(",") !== target.inputs.join(",")) {
            return { equivalent: false, reason: "The input alphabets do not match." };
        }

        if (source.type === "moore" && target.type === "mealy") {
            const initialOutput = source.stateOutputs[source.start];
            if (typeof initialOutput !== "string" || initialOutput === "") {
                return { equivalent: false, reason: "The source Moore machine has no valid initial-state output." };
            }
        }

        const queue = [[source.start, target.start]];
        const visited = new Set();
        const pairs = [];
        while (queue.length) {
            const [leftState, rightState] = queue.shift();
            const key = JSON.stringify([leftState, rightState]);
            if (visited.has(key)) continue;
            visited.add(key);
            pairs.push([leftState, rightState]);
            for (const symbol of source.inputs) {
                const leftEdge = source.transitions[leftState][symbol];
                const rightEdge = target.transitions[rightState][symbol];
                const leftOutput = source.type === "mealy"
                    ? leftEdge.output
                    : source.stateOutputs[leftEdge.next];
                const rightOutput = target.type === "mealy"
                    ? rightEdge.output
                    : target.stateOutputs[rightEdge.next];
                if (leftOutput !== rightOutput) {
                    return {
                        equivalent: false,
                        reason: `Output mismatch from (${leftState}, ${rightState}) on ${symbol}: ${leftOutput} !== ${rightOutput}.`
                    };
                }
                queue.push([leftEdge.next, rightEdge.next]);
            }
        }
        return {
            equivalent: true,
            pairsChecked: visited.size,
            pairs,
            initialOutput: source.type === "moore" ? source.stateOutputs[source.start] : null
        };
    }

    return {
        convertMealyToMoore,
        convertMooreToMealy,
        simulateMachine,
        createParityMachine,
        verifyConversion
    };
});
