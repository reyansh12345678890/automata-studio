
/* =========================================
   AUTOMATA STUDIO
   Mealy–Moore Machine Simulator
   ========================================= */

// Machine definition: tracks even/odd count of 1s.

const states = {
    E: { label: "Even", output: "0" },
    O: { label: "Odd", output: "1" }
};

const transitions = {
    E: {
        "0": { next: "E", output: "0" },
        "1": { next: "O", output: "1" }
    },
    O: {
        "0": { next: "O", output: "1" },
        "1": { next: "E", output: "0" }
    }
};

const startState = "E";

// DOM elements
const mealyTab = document.getElementById("mealy-tab");
const mooreTab = document.getElementById("moore-tab");
const inputField = document.getElementById("input-string");

const runBtn = document.getElementById("run-btn");
const stepBtn = document.getElementById("step-btn");
const resetBtn = document.getElementById("reset-btn");
const exampleBtn = document.getElementById("example-btn");

const diagram = document.getElementById("diagram");
const traceBody = document.getElementById("trace-body");

const outputString = document.getElementById("output-string");
const resultMessage = document.getElementById("result-message");
const resultBox = document.getElementById("result-box");

const stepCounter = document.getElementById("step-counter");

// Sidebar navigation
const simulatorNav = document.getElementById("simulator-nav");
const theoryNav = document.getElementById("theory-nav");
const simulatorSection = document.getElementById("simulator-section");
const theorySection = document.getElementById("theory-section");

const statType = document.getElementById("stat-type");
const statStates = document.getElementById("stat-states");
const statAlphabet = document.getElementById("stat-alphabet");
const statStatus = document.getElementById("stat-status");
const statStatusDetail = document.getElementById(
    "stat-status-detail"
);

// Simulation state
let machineType = "mealy";
let currentState = startState;
let activeInput = null;
let nextIndex = 0;
let trace = [];
let generatedOutput = [];

// Tracks the most recently executed transition.
let lastTransition = null;


/* =========================================
   MACHINE TYPE
   ========================================= */

function selectMachine(type) {
    machineType = type;

    mealyTab.classList.toggle("active", type === "mealy");
    mooreTab.classList.toggle("active", type === "moore");

    statType.textContent = type === "mealy" ? "Mealy" : "Moore";

    statType.nextElementSibling.textContent =
        type === "mealy"
            ? "Output on transitions"
            : "Output on states";

    // Update the diagram legend.
    const legendItems = document.querySelectorAll(
        ".diagram-legend span"
    );

    legendItems[2].innerHTML =
        type === "mealy"
            ? '<i class="legend-dot final-dot"></i> Output transition'
            : '<i class="legend-dot final-dot"></i> State output';

    resetSimulation();
    renderDiagram();
    renderTransitionTable();
    renderFormalDefinition();
}

mealyTab.addEventListener("click", () => selectMachine("mealy"));
mooreTab.addEventListener("click", () => selectMachine("moore"));


/* =========================================
   STATE DIAGRAM
   ========================================= */

function renderDiagram() {
    const isMealy = machineType === "mealy";

    const edgeActive = (from, symbol) =>
        lastTransition !== null &&
        lastTransition.from === from &&
        lastTransition.symbol === symbol;

    const edgeColor = (from, symbol) =>
        edgeActive(from, symbol) ? "#63d9e8" : "#858ba7";

    const edgeWidth = (from, symbol) =>
        edgeActive(from, symbol) ? 3.5 : 2;

    const edgeMarker = (from, symbol) =>
        edgeActive(from, symbol) ? "url(#active-arrow)" : "url(#arrow)";

    const eActive = currentState === "E";
    const oActive = currentState === "O";

    const stateFill = active =>
        active ? "#29234b" : "#171b2a";

    const stateStroke = active =>
        active ? "#9b8cff" : "#515873";

    const stateText = active =>
        active ? "#ffffff" : "#d4d8e9";

    const outputText = (state, active) =>
        isMealy
            ? ""
            : `<text x="${state === "E" ? 170 : 430}"
                       y="167"
                       text-anchor="middle"
                       fill="${active ? "#63d9e8" : "#53d6a2"}"
                       font-size="13"
                       font-weight="700">${states[state].output}</text>`;

    const edgeLabel = (x, y, text) => `
        <text x="${x}" y="${y}"
              text-anchor="middle"
              fill="#d6d9eb"
              font-size="13"
              font-weight="600"
              stroke="#10131e"
              stroke-width="5"
              paint-order="stroke">${text}</text>`;

    const labels = isMealy
        ? {
            loopE: "0/0",
            forward: "1/1",
            backward: "1/0",
            loopO: "0/1"
        }
        : {
            loopE: "0",
            forward: "1",
            backward: "1",
            loopO: "0"
        };

    diagram.innerHTML = `
    <svg viewBox="0 0 600 300"
         role="img"
         aria-label="${isMealy ? "Mealy" : "Moore"}
         machine with even and odd parity states">

        <defs>
            <marker id="arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#858ba7"/>
            </marker>

            <marker id="active-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#63d9e8"/>
            </marker>
        </defs>

        <!-- Initial state arrow -->
        <path d="M 45 150 L 119 150"
              fill="none"
              stroke="#53d6a2"
              stroke-width="2"
              marker-end="url(#arrow)"/>

        <!-- Self-loop at E -->
        <path d="M 145 119
                C 104 54, 236 54, 195 119"
                fill="none"
                stroke="${edgeColor("E", "0")}"
                stroke-width="${edgeWidth("E", "0")}"
                marker-end="${edgeMarker("E", "0")}"/>

        ${edgeLabel(170, 69, labels.loopE)}

        <!-- E to O -->
        <path d="M 207 130
                    Q 300 55, 393 130"
                fill="none"
                stroke="${edgeColor("E", "1")}"
                stroke-width="${edgeWidth("E", "1")}"
                marker-end="${edgeMarker("E", "1")}"/>

        ${edgeLabel(300, 94, labels.forward)}

        <!-- O to E -->
        <path d="M 393 170
                Q 300 245, 207 170"
            fill="none"
            stroke="${edgeColor("O", "1")}"
            stroke-width="${edgeWidth("O", "1")}"
            marker-end="${edgeMarker("O", "1")}"/>

        ${edgeLabel(300, 222, labels.backward)}

        <!-- Self-loop at O -->
        <path d="M 405 119
         C 364 54, 496 54, 455 119"
                fill="none"
                stroke="${edgeColor("O", "0")}"
                stroke-width="${edgeWidth("O", "0")}"
                marker-end="${edgeMarker("O", "0")}"/>

        ${edgeLabel(430, 69, labels.loopO)}

        <!-- State E -->
        <circle cx="170" cy="150" r="43"
                fill="${stateFill(eActive)}"
                stroke="${stateStroke(eActive)}"
                stroke-width="${eActive ? 3 : 2}"/>

        <text x="170" y="${isMealy ? 155 : 145}"
              text-anchor="middle"
              fill="${stateText(eActive)}"
              font-size="18"
              font-weight="700">E</text>

        ${outputText("E", eActive)}

        <!-- State O -->
        <circle cx="430" cy="150" r="43"
                fill="${stateFill(oActive)}"
                stroke="${stateStroke(oActive)}"
                stroke-width="${oActive ? 3 : 2}"/>

        <text x="430" y="${isMealy ? 155 : 145}"
              text-anchor="middle"
              fill="${stateText(oActive)}"
              font-size="18"
              font-weight="700">O</text>

        ${outputText("O", oActive)}
    </svg>`;
}


/* =========================================
   TRANSITION TABLE
   ========================================= */

function renderTransitionTable() {
    const head = document.getElementById("transition-table-head");
    const body = document.getElementById("transition-table-body");
    const label = document.getElementById("table-machine-label");
    const note = document.getElementById("transition-note");

    const isMealy = machineType === "mealy";

    label.textContent = isMealy ? "MEALY" : "MOORE";

    if (isMealy) {
        head.innerHTML = `
            <tr>
                <th>STATE</th>
                <th>INPUT 0 → NEXT / OUTPUT</th>
                <th>INPUT 1 → NEXT / OUTPUT</th>
            </tr>`;

        body.innerHTML = Object.keys(states).map(state => {
            const zero = transitions[state]["0"];
            const one = transitions[state]["1"];

            return `
                <tr>
                    <td><strong>${state}</strong></td>
                    <td>
                        ${zero.next}
                        <span class="transition-table-active">
                            / ${zero.output}
                        </span>
                    </td>
                    <td>
                        ${one.next}
                        <span class="transition-table-active">
                            / ${one.output}
                        </span>
                    </td>
                </tr>`;
        }).join("");

        note.textContent =
            "Mealy: each transition specifies the next state and the output. " +
            "The output function is λ: Q × Σ → Γ.";
    } else {
        head.innerHTML = `
            <tr>
                <th>STATE</th>
                <th>STATE OUTPUT</th>
                <th>INPUT 0 → NEXT STATE</th>
                <th>INPUT 1 → NEXT STATE</th>
            </tr>`;

        body.innerHTML = Object.keys(states).map(state => {
            const zero = transitions[state]["0"];
            const one = transitions[state]["1"];

            return `
                <tr>
                    <td><strong>${state}</strong></td>
                    <td>
                        <span class="transition-table-active">
                            ${states[state].output}
                        </span>
                    </td>
                    <td>${zero.next}</td>
                    <td>${one.next}</td>
                </tr>`;
        }).join("");

        note.textContent =
            "Moore: each state has its own output. " +
            "The output function is λ: Q → Γ. " +
            "The initial state's output is included when simulation begins.";
    }
}


/* =========================================
   FORMAL MACHINE DEFINITION
   ========================================= */

function renderFormalDefinition() {
    const title = document.getElementById("formal-output-title");
    const outputFunction = document.getElementById(
        "formal-output-function"
    );
    const explanation = document.getElementById(
        "formal-explanation"
    );

    if (machineType === "mealy") {
        title.textContent = "Output function (λ) — Mealy";

        outputFunction.innerHTML = `
            <strong>λ(E, 0) = 0 · λ(E, 1) = 1</strong>
            <strong>λ(O, 0) = 1 · λ(O, 1) = 0</strong>
        `;

        explanation.textContent =
            "The machine tracks whether the number of 1s read so far " +
            "is even or odd. Mealy outputs depend on the current state " +
            "and the input symbol.";
    } else {
        title.textContent = "Output function (λ) — Moore";

        outputFunction.innerHTML = `
            <strong>λ(E) = 0</strong>
            <strong>λ(O) = 1</strong>
        `;

        explanation.textContent =
            "The machine tracks whether the number of 1s read so far " +
            "is even or odd. Moore outputs depend only on the current " +
            "state. The initial state's output is included in the output string.";
    }
}


/* =========================================
   SIMULATION INITIALIZATION
   ========================================= */

function initializeSimulation(input) {
    stepBtn.disabled = false;

    currentState = startState;
    activeInput = input;
    nextIndex = 0;
    trace = [];
    generatedOutput = [];
    lastTransition = null;

    // Moore machines produce an output for the initial state too.
    if (machineType === "moore") {
        generatedOutput.push(states[startState].output);
    }

    renderTrace();
    renderResults();
    renderDiagram();
}

function validateInput(input) {
    if (input.length === 0) {
        return "Enter an input string first.";
    }

    if (!/^[01]+$/.test(input)) {
        return "Invalid input. Use only 0 and 1.";
    }

    return null;
}


/* =========================================
   PROCESS ONE INPUT SYMBOL
   ========================================= */

function processNextStep() {
    if (activeInput === null) {
        initializeSimulation(inputField.value.trim());
    }

    if (nextIndex >= activeInput.length) {
        statStatus.textContent = "Complete";
        statStatusDetail.textContent = "Input fully processed";
        resultMessage.textContent = "Simulation complete.";
        return;
    }

    const symbol = activeInput[nextIndex];
    const previousState = currentState;

    // Apply the transition function δ.
    const transition = transitions[currentState][symbol];

    const nextState = transition.next;

    // Mealy: output belongs to the transition.
    // Moore: output belongs to the destination state.
    const output = machineType === "mealy"
        ? transition.output
        : states[nextState].output;

    currentState = nextState;
    generatedOutput.push(output);

    lastTransition = {
        from: previousState,
        to: nextState,
        symbol: symbol
    };

    trace.push({
        step: nextIndex + 1,
        input: symbol,
        current: previousState,
        next: nextState,
        output: output
    });

    nextIndex++;

    renderTrace();
    renderResults();
    renderDiagram();

    if (nextIndex === activeInput.length) {
        statStatus.textContent = "Complete";
        statStatusDetail.textContent = "Input fully processed";

        // Disable Step after the final symbol.
        stepBtn.disabled = true;
    } else {
        statStatus.textContent = "Running";
        statStatusDetail.textContent =
            `${nextIndex} of ${activeInput.length} symbols`;
    }
}


/* =========================================
   RUN THE COMPLETE INPUT
   ========================================= */

function runSimulation() {
    const input = inputField.value.trim();
    const error = validateInput(input);

    if (error) {
        showError(error);
        return;
    }

    initializeSimulation(input);

    while (nextIndex < activeInput.length) {
        processNextStep();
    }

    resultMessage.textContent =
        machineType === "mealy"
            ? "Complete. Output generated on each transition."
            : "Complete. Output includes the initial state's output.";
}


/* =========================================
   STEP-BY-STEP SIMULATION
   ========================================= */

function stepSimulation() {
    const input = inputField.value.trim();
    const error = validateInput(input);

    if (error) {
        showError(error);
        return;
    }

    // Start a fresh execution if the input or machine changed.
    if (activeInput !== input) {
        initializeSimulation(input);
    }

    if (nextIndex >= activeInput.length) {
        resultMessage.textContent = "All input symbols processed.";
        stepBtn.disabled = true;
        return;
    }

    processNextStep();

    if (nextIndex === activeInput.length) {
        resultMessage.textContent = "All input symbols processed.";
    }
}


/* =========================================
   RENDER EXECUTION TRACE
   ========================================= */

function renderTrace() {
    stepCounter.textContent =
        `${trace.length} step${trace.length === 1 ? "" : "s"}`;

    if (trace.length === 0) {
        traceBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">
                    No execution yet. Run a simulation to see the trace.
                </td>
            </tr>`;
        return;
    }

    traceBody.innerHTML = trace.map(row => `
        <tr class="trace-current">
            <td>${row.step}</td>
            <td>${row.input}</td>
            <td>${row.current}</td>
            <td>${row.next}</td>
            <td>${row.output}</td>
        </tr>
    `).join("");
}


/* =========================================
   RENDER OUTPUT
   ========================================= */

function renderResults() {
    outputString.textContent =
        generatedOutput.length > 0
            ? generatedOutput.join("")
            : "—";

    resultBox.classList.remove("success", "error");

    if (activeInput === null) {
        resultMessage.textContent =
            "Enter an input string to begin.";
        return;
    }

    resultMessage.textContent = machineType === "mealy"
        ? "Output generated by transitions."
        : "Includes the initial state's output.";
}


/* =========================================
   ERROR MESSAGE
   ========================================= */

function showError(message) {
    resultBox.classList.remove("success");
    resultBox.classList.add("error");

    outputString.textContent = "—";
    resultMessage.textContent = message;

    statStatus.textContent = "Invalid";
    statStatusDetail.textContent = "Check your input";
}


/* =========================================
   RESET
   ========================================= */

function resetSimulation() {
    // Re-enable Step when resetting.
    stepBtn.disabled = false;

    currentState = startState;
    activeInput = null;
    nextIndex = 0;
    trace = [];
    generatedOutput = [];
    lastTransition = null;

    resultBox.classList.remove("success", "error");

    statStatus.textContent = "Ready";
    statStatusDetail.textContent = "Waiting for input";

    renderTrace();
    renderResults();
    renderDiagram();
}

runBtn.addEventListener("click", runSimulation);
stepBtn.addEventListener("click", stepSimulation);
resetBtn.addEventListener("click", resetSimulation);

exampleBtn.addEventListener("click", () => {
    inputField.value = "10110";
    resetSimulation();
});

// Allow a new step-by-step run when the input is edited.
inputField.addEventListener("input", () => {
    if (inputField.value.trim() !== activeInput) {
        stepBtn.disabled = false;
    }
});

// Press Enter to run.
inputField.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        runSimulation();
    }
});


/* =========================================
   SIDEBAR NAVIGATION
   ========================================= */

function navigateToSection(section, activeNav) {
    // Update the selected sidebar item.
    simulatorNav.classList.toggle("active", activeNav === simulatorNav);
    theoryNav.classList.toggle("active", activeNav === theoryNav);

    // Scroll to the requested section, even if its tab was already selected.
    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

simulatorNav.addEventListener("click", () => {
    navigateToSection(simulatorSection, simulatorNav);
});

theoryNav.addEventListener("click", () => {
    navigateToSection(theorySection, theoryNav);
});


/* =========================================
   INITIALIZE APPLICATION
   ========================================= */

selectMachine("mealy");


/* =========================================
   MACHINE CONVERSION WORKSPACE
   ========================================= */

const conversionNav = document.getElementById("conversion-nav");
const conversionSection = document.getElementById("conversion-section");
const conversionType = document.getElementById("conv-type");
const conversionStates = document.getElementById("conv-states");
const conversionInputs = document.getElementById("conv-inputs");
const conversionOutputs = document.getElementById("conv-outputs");
const conversionStart = document.getElementById("conv-start");
const conversionEditor = document.getElementById("conv-editor");
const conversionError = document.getElementById("conv-error");
const conversionResult = document.getElementById("conv-result");

let conversionSourceMachine = null;
let conversionTargetMachine = null;
let conversionSyncedFromProjectOne = false;
let conversionManualEdit = false;

function getProjectOneMachine() {
    return {
        type: machineType,
        states: ["E", "O"],
        inputs: ["0", "1"],
        outputs: ["0", "1"],
        start: startState,
        transitions: JSON.parse(JSON.stringify(transitions)),
        stateOutputs: machineType === "moore"
            ? { E: states.E.output, O: states.O.output }
            : {}
    };
}

function syncConversionFromProjectOne() {
    const machine = getProjectOneMachine();
    conversionType.value = machine.type;
    conversionStates.value = machine.states.join(", ");
    conversionInputs.value = machine.inputs.join(", ");
    conversionOutputs.value = machine.outputs.join(", ");
    updateConversionStartOptions(machine.start);
    buildConversionEditor();

    machine.states.forEach((state, stateIndex) => {
        machine.inputs.forEach((symbol, inputIndex) => {
            const key = `${stateIndex}_${inputIndex}`;
            const nextSelect = conversionEditor.querySelector(`[data-role="next"][data-key="${key}"]`);
            if (nextSelect) nextSelect.value = machine.transitions[state][symbol].next;
            if (machine.type === "mealy") {
                const outputSelect = conversionEditor.querySelector(`[data-role="edge-output"][data-key="${key}"]`);
                if (outputSelect) outputSelect.value = machine.transitions[state][symbol].output;
            }
        });
        if (machine.type === "moore") {
            const outputSelect = conversionEditor.querySelector(
                `[data-role="state-output"][data-state="${CSS.escape(state)}"]`
            );
            if (outputSelect) outputSelect.value = machine.stateOutputs[state];
        }
    });

    conversionStart.value = machine.start;
    conversionSyncedFromProjectOne = true;
    conversionManualEdit = false;
    conversionError.textContent =
        `Synced exactly from Project 1: ${machine.type.toUpperCase()} machine (states E, O).`;
    conversionError.className = "conversion-message success";
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

function parseSymbolList(value, label) {
    const values = value.split(",").map(item => item.trim()).filter(Boolean);
    if (!values.length) throw new Error(`${label} cannot be empty.`);
    if (new Set(values).size !== values.length) throw new Error(`${label} contains duplicate values.`);
    if (values.some(item => /[,\s]/.test(item))) {
        throw new Error(`${label} values must not contain spaces or commas.`);
    }
    return values;
}

function updateConversionStartOptions(preferred) {
    let statesList;
    try { statesList = parseSymbolList(conversionStates.value, "States"); }
    catch { statesList = ["A"]; }
    const current = preferred || conversionStart.value;
    conversionStart.innerHTML = statesList.map(state =>
        `<option value="${escapeHTML(state)}">${escapeHTML(state)}</option>`
    ).join("");
    conversionStart.value = statesList.includes(current) ? current : statesList[0];
}

function buildConversionEditor() {
    try {
        const statesList = parseSymbolList(conversionStates.value, "States");
        const inputList = parseSymbolList(conversionInputs.value, "Input alphabet");
        const outputList = parseSymbolList(conversionOutputs.value, "Output alphabet");
        updateConversionStartOptions();
        const type = conversionType.value;
        const header = type === "mealy"
            ? `<th>STATE</th>${inputList.map(symbol => `<th>INPUT ${escapeHTML(symbol)} · NEXT / OUTPUT</th>`).join("")}`
            : `<th>STATE</th><th>STATE OUTPUT</th>${inputList.map(symbol => `<th>INPUT ${escapeHTML(symbol)} · NEXT STATE</th>`).join("")}`;
        const rows = statesList.map((state, stateIndex) => {
            const cells = inputList.map((symbol, inputIndex) => {
                const key = `${stateIndex}_${inputIndex}`;
                const destination = `<select data-role="next" data-key="${key}">${statesList.map(target =>
                    `<option value="${escapeHTML(target)}">${escapeHTML(target)}</option>`).join("")}</select>`;
                if (type === "mealy") {
                    return `<td class="conversion-cell"><small>Next state</small>${destination}<small>Output</small><select data-role="edge-output" data-key="${key}">${outputList.map(output => `<option value="${escapeHTML(output)}">${escapeHTML(output)}</option>`).join("")}</select></td>`;
                }
                return `<td class="conversion-cell">${destination}</td>`;
            }).join("");
            const stateOutput = type === "moore"
                ? `<td class="conversion-cell"><select data-role="state-output" data-state="${escapeHTML(state)}">${outputList.map(output => `<option value="${escapeHTML(output)}">${escapeHTML(output)}</option>`).join("")}</select></td>`
                : "";
            return `<tr><td><strong>${escapeHTML(state)}</strong>${state === conversionStart.value ? " · START" : ""}</td>${stateOutput}${cells}</tr>`;
        }).join("");
        conversionEditor.innerHTML = `<h3>Transition and output definitions</h3><div class="table-wrapper"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>`;
        conversionError.textContent = "Complete every transition. The editor starts with A and B as an example structure.";
        conversionError.className = "conversion-message";
        conversionResult.hidden = true;
    } catch (error) {
        conversionEditor.innerHTML = "";
        showConversionError(error.message);
    }
}

function showConversionError(message) {
    conversionError.textContent = message;
    conversionError.className = "conversion-message error";
}

function collectConversionMachine() {
    const statesList = parseSymbolList(conversionStates.value, "States");
    const inputList = parseSymbolList(conversionInputs.value, "Input alphabet");
    const outputList = parseSymbolList(conversionOutputs.value, "Output alphabet");
    const type = conversionType.value;
    const start = conversionStart.value;
    if (!statesList.includes(start)) throw new Error("Choose a valid initial state.");

    const transitionsMap = {};
    const stateOutputs = {};
    statesList.forEach(state => {
        transitionsMap[state] = {};
        if (type === "moore") {
            const select = conversionEditor.querySelector(`[data-role="state-output"][data-state="${CSS.escape(state)}"]`);
            if (!select || !outputList.includes(select.value)) throw new Error(`Choose a valid output for state ${state}.`);
            stateOutputs[state] = select.value;
        }
        inputList.forEach((symbol, index) => {
            const key = `${statesList.indexOf(state)}_${index}`;
            const nextSelect = conversionEditor.querySelector(`[data-role="next"][data-key="${key}"]`);
            if (!nextSelect || !statesList.includes(nextSelect.value)) throw new Error(`Missing or invalid destination for ${state} on input ${symbol}.`);
            const entry = { next: nextSelect.value };
            if (type === "mealy") {
                const outputSelect = conversionEditor.querySelector(`[data-role="edge-output"][data-key="${key}"]`);
                if (!outputSelect || !outputList.includes(outputSelect.value)) throw new Error(`Missing or invalid output for ${state} on input ${symbol}.`);
                entry.output = outputSelect.value;
            }
            transitionsMap[state][symbol] = entry;
        });
    });
    return { type, states: statesList, inputs: inputList, outputs: outputList, start, transitions: transitionsMap, stateOutputs };
}

function convertMealyToMoore(machine) {
    return window.AutomataCore.convertMealyToMoore(machine);
}

function convertMooreToMealy(machine) {
    return window.AutomataCore.convertMooreToMealy(machine);
}

function renderConvertedTable(machine) {
    const head = document.getElementById("conv-result-head");
    const body = document.getElementById("conv-result-body");
    if (machine.type === "mealy") {
        head.innerHTML = `<tr><th>STATE</th>${machine.inputs.map(symbol => `<th>INPUT ${escapeHTML(symbol)} · NEXT / OUTPUT</th>`).join("")}</tr>`;
        body.innerHTML = machine.states.map(state => `<tr><td><strong>${escapeHTML(state)}</strong>${state === machine.start ? " · START" : ""}</td>${machine.inputs.map(symbol => {
            const edge = machine.transitions[state][symbol];
            return `<td>${escapeHTML(edge.next)} <span class="transition-table-active">/ ${escapeHTML(edge.output)}</span></td>`;
        }).join("")}</tr>`).join("");
    } else {
        head.innerHTML = `<tr><th>STATE</th><th>STATE OUTPUT</th>${machine.inputs.map(symbol => `<th>INPUT ${escapeHTML(symbol)} · NEXT STATE</th>`).join("")}</tr>`;
        body.innerHTML = machine.states.map(state => `<tr><td><strong>${escapeHTML(state)}</strong>${state === machine.start ? " · START" : ""}</td><td><span class="transition-table-active">${escapeHTML(machine.stateOutputs[state])}</span></td>${machine.inputs.map(symbol => `<td>${escapeHTML(machine.transitions[state][symbol].next)}</td>`).join("")}</tr>`).join("");
    }
}

function renderConvertedDiagram(machine) {
    const container = document.getElementById("conv-diagram");
    const count = machine.states.length;
    const width = Math.max(620, count * 155);
    const height = 250;
    const positions = {};
    machine.states.forEach((state, index) => { positions[state] = { x: 85 + index * ((width - 170) / Math.max(1, count - 1)), y: 130 }; });
    let edges = "";
    machine.states.forEach((state, stateIndex) => machine.inputs.forEach((symbol, inputIndex) => {
        const edge = machine.transitions[state][symbol];
        const from = positions[state], to = positions[edge.next];
        const label = machine.type === "mealy" ? `${symbol}/${edge.output}` : symbol;
        if (from.x === to.x) {
            const loopOffset = inputIndex % 2 === 0 ? -18 : 18;
            const loopLeft = from.x + loopOffset - 35;
            const loopRight = from.x + loopOffset + 35;
            const startX = from.x + loopOffset - 18;
            const endX = from.x + loopOffset + 18;
            const labelX = from.x + loopOffset;
            edges += `<path d="M ${startX} ${from.y - 27} C ${loopLeft} ${from.y - 105}, ${loopRight} ${from.y - 105}, ${endX} ${from.y - 27}" fill="none" stroke="#858ba7" stroke-width="1.5" marker-end="url(#conv-arrow)"/><text x="${labelX}" y="${from.y - 92}" text-anchor="middle" fill="#d6d9eb" stroke="#10131e" stroke-width="4" paint-order="stroke" font-size="11">${escapeHTML(label)}</text>`;
            return;
        }

        const stateIndexTo = machine.states.indexOf(edge.next);
        const forward = stateIndex < stateIndexTo;
        const curveY = forward ? 55 : 205;
        const midX = (from.x + to.x) / 2;
        const direction = to.x >= from.x ? 31 : -31;
        const startX = from.x + direction;
        const endX = to.x - direction;
        const labelY = (from.y + 2 * curveY + to.y) / 4 - 8;
        edges += `<path d="M ${startX} ${from.y} Q ${midX} ${curveY} ${endX} ${to.y}" fill="none" stroke="#858ba7" stroke-width="1.5" marker-end="url(#conv-arrow)"/><text x="${midX}" y="${labelY}" text-anchor="middle" fill="#d6d9eb" stroke="#10131e" stroke-width="4" paint-order="stroke" font-size="11">${escapeHTML(label)}</text>`;
    }));
    const nodes = machine.states.map(state => {
        const pos = positions[state];
        const output = machine.type === "moore" ? `<text x="${pos.x}" y="${pos.y + 20}" text-anchor="middle" fill="#63d9e8" font-size="11">${escapeHTML(machine.stateOutputs[state])}</text>` : "";
        return `<circle cx="${pos.x}" cy="${pos.y}" r="29" fill="#29234b" stroke="#9b8cff" stroke-width="2"/><text x="${pos.x}" y="${pos.y + 4}" text-anchor="middle" fill="white" font-size="11">${escapeHTML(state)}</text>${output}`;
    }).join("");
    const start = positions[machine.start];
    container.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Converted machine state diagram"><defs><marker id="conv-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#858ba7"/></marker></defs><path d="M ${start.x - 65} ${start.y} L ${start.x - 31} ${start.y}" stroke="#53d6a2" stroke-width="2" fill="none" marker-end="url(#conv-arrow)"/>${edges}${nodes}</svg>`;
}

function renderConversionResult(source, target) {
    document.getElementById("conv-result-title").textContent = target.type === "mealy" ? "Equivalent Mealy machine" : "Equivalent Moore machine";
    document.getElementById("conv-state-count").textContent = `${target.states.length} states`;
    const steps = target.type === "moore" ? [
        "Create a new initial state with an ε output marker so the converted machine does not add an unwanted output before the first input.",
        "For every reachable original state and each distinct output produced when entering it, create a Moore state (original state, incoming output).",
        "For each input, follow the original Mealy transition and move to the pair containing its destination state and transition output.",
        "Only reachable state/output pairs are included; states may split when they can be entered with different outputs."
    ] : [
        "Keep the original Moore states, initial state, and transition destinations unchanged.",
        "For every transition q --a--> p, assign the Mealy transition output equal to the Moore output of destination state p.",
        "The Moore initial-state output is an initial marker and is not emitted by a standard Mealy transition."
    ];
    document.getElementById("conv-explanation").innerHTML = steps.map(step => `<li>${step}</li>`).join("");
    renderConvertedTable(target);
    renderConvertedDiagram(target);
    document.getElementById("conv-verify-result").textContent = "";
    document.getElementById("conv-verify-result").className = "conversion-message";
    conversionResult.hidden = false;
}

function verifyTransducerEquivalence(left, right) {
    return window.AutomataCore.verifyConversion(left, right);
}

function performConversion() {
    try {
        const source = collectConversionMachine();
        const target = source.type === "mealy" ? convertMealyToMoore(source) : convertMooreToMealy(source);
        conversionSourceMachine = source;
        conversionTargetMachine = target;
        renderConversionResult(source, target);
        conversionError.textContent = `Successfully converted ${source.type.toUpperCase()} to ${target.type.toUpperCase()}.`;
        conversionError.className = "conversion-message success";
    } catch (error) {
        showConversionError(error.message);
    }
}

function compareConvertedMachineOnInput() {
    if (!conversionSourceMachine || !conversionTargetMachine) {
        const output = document.getElementById("conv-compare-result");
        output.textContent = "Convert the source machine first.";
        output.className = "conversion-message error";
        return;
    }

    const input = document.getElementById("conv-compare-input").value.trim();
    const output = document.getElementById("conv-compare-result");
    try {
        if (!/^[^\s,]+$/.test(input) && input.length === 0) throw new Error("Enter an input string.");
        for (const symbol of input) {
            if (!conversionSourceMachine.inputs.includes(symbol)) {
                throw new Error(`Input symbol ${symbol} is not in the source alphabet.`);
            }
        }

        const source = window.AutomataCore.simulateMachine(
            conversionSourceMachine,
            input,
            conversionSourceMachine.type === "moore"
        );
        const target = window.AutomataCore.simulateMachine(
            conversionTargetMachine,
            input,
            conversionTargetMachine.type === "moore"
        );

        let sourceForComparison = source.output;
        let targetForComparison = target.output;
        let conventionNote = "";

        if (conversionSourceMachine.type === "mealy" && conversionTargetMachine.type === "moore") {
            targetForComparison = target.output.replace(/^\u03b5/, "");
            conventionNote = "The target Moore ε initial marker was omitted because it is an internal conversion marker.";
        } else if (conversionSourceMachine.type === "moore" && conversionTargetMachine.type === "mealy") {
            const initialOutput = conversionSourceMachine.stateOutputs[conversionSourceMachine.start];
            const normalizedSourceOutput =
                source.output.length > 0 ? source.output.slice(initialOutput.length) : source.output;
            sourceForComparison =
                `raw ${source.output}; after initial output ${normalizedSourceOutput || "(empty)"}`;
            targetForComparison = `raw ${target.output}`;
            conventionNote =
                `Moore initial output ${initialOutput} is separate from the remaining transition outputs. ` +
                "The converted Mealy raw output remains one symbol per input.";
            const equivalent = normalizedSourceOutput === target.output;
            output.textContent =
                `Source Moore: ${sourceForComparison} | Converted Mealy: ${targetForComparison} | ` +
                (equivalent ? "Equivalent after applying the Moore initial-output convention." : "Different after applying the Moore initial-output convention.") +
                ` ${conventionNote}`;
            output.className = equivalent
                ? "conversion-message success"
                : "conversion-message error";
            return;
        }

        const equivalent = sourceForComparison === targetForComparison;
        output.textContent =
            `Source output: ${sourceForComparison || "(empty)"} | Converted output: ${targetForComparison || "(empty)"} | ` +
            (equivalent ? "Equivalent for this input." : "Different for this input.") +
            ` ${conventionNote}`;
        output.className = equivalent
            ? "conversion-message success"
            : "conversion-message error";
    } catch (error) {
        output.textContent = error.message;
        output.className = "conversion-message error";
    }
}

function loadParityConversionExample() {
    // Preserve the user's selected machine type; the same parity machine
    // has different output placement in Mealy and Moore representations.
    const selectedType = conversionType.value;
    conversionStates.value = "E, O";
    conversionInputs.value = "0, 1";
    conversionOutputs.value = "0, 1";
    updateConversionStartOptions("E");
    buildConversionEditor();

    const destinations = {
        "0_0": "E", "0_1": "O",
        "1_0": "O", "1_1": "E"
    };

    Object.entries(destinations).forEach(([key, next]) => {
        const nextSelect = conversionEditor.querySelector(`[data-role="next"][data-key="${key}"]`);
        if (nextSelect) nextSelect.value = next;
    });

    if (selectedType === "mealy") {
        const edgeOutputs = { "0_0": "0", "0_1": "1", "1_0": "1", "1_1": "0" };
        Object.entries(edgeOutputs).forEach(([key, output]) => {
            const outputSelect = conversionEditor.querySelector(`[data-role="edge-output"][data-key="${key}"]`);
            if (outputSelect) outputSelect.value = output;
        });
        conversionError.textContent = "Parity-tracking Mealy example loaded. Convert it to Moore.";
    } else {
        const stateOutputs = { E: "0", O: "1" };
        Object.entries(stateOutputs).forEach(([state, output]) => {
            const outputSelect = conversionEditor.querySelector(`[data-role="state-output"][data-state="${CSS.escape(state)}"]`);
            if (outputSelect) outputSelect.value = output;
        });
        conversionError.textContent = "Parity-tracking Moore example loaded. Convert it to Mealy.";
    }

    conversionStart.value = "E";
    conversionError.className = "conversion-message success";
    conversionSourceMachine = null;
    conversionTargetMachine = null;
    conversionResult.hidden = true;
}

conversionNav.addEventListener("click", () => navigateToSection(conversionSection, conversionNav));
const originalNavigateToSection = navigateToSection;
function navigateToSection(section, activeNav) {
    simulatorNav.classList.toggle("active", activeNav === simulatorNav);
    conversionNav.classList.toggle("active", activeNav === conversionNav);
    theoryNav.classList.toggle("active", activeNav === theoryNav);
    simulatorSection.hidden = section !== simulatorSection;
    conversionSection.hidden = section !== conversionSection;
    theorySection.hidden = section !== theorySection;
    if (section === conversionSection) {
        if (!conversionManualEdit) syncConversionFromProjectOne();
    }
    section.scrollIntoView({ behavior: "smooth", block: "start" });
}

conversionStates.addEventListener("input", () => {
    conversionManualEdit = true;
    updateConversionStartOptions();
});
conversionInputs.addEventListener("input", () => { conversionManualEdit = true; });
conversionOutputs.addEventListener("input", () => { conversionManualEdit = true; });
conversionType.addEventListener("change", () => { conversionManualEdit = true; });
conversionEditor.addEventListener("change", () => {
    conversionManualEdit = true;
});
document.getElementById("conv-build").addEventListener("click", () => {
    conversionManualEdit = true;
    buildConversionEditor();
});
document.getElementById("conv-use-project-one").addEventListener("click", syncConversionFromProjectOne);
document.getElementById("conv-convert").addEventListener("click", performConversion);
document.getElementById("conv-compare").addEventListener("click", compareConvertedMachineOnInput);
document.getElementById("conv-verify").addEventListener("click", () => {
    const result = verifyTransducerEquivalence(conversionSourceMachine, conversionTargetMachine);
    const output = document.getElementById("conv-verify-result");
    if (result.equivalent) {
        if (conversionSourceMachine && conversionSourceMachine.type === "moore" &&
            conversionTargetMachine && conversionTargetMachine.type === "mealy") {
            const pairNames = result.pairs
                ? result.pairs.map(pair => `(${pair[0]}, ${pair[1]})`).join(", ")
                : "";
            output.textContent =
                `Equivalent: Moore initial-state output ${result.initialOutput} is handled separately; ` +
                `the remaining destination-state outputs match all Mealy transition outputs. ` +
                `Reachable pairs checked: ${result.pairsChecked} (${pairNames}).`;
        } else {
            output.textContent = `Equivalent: all reachable state-pairs checked (${result.pairsChecked} pairs). Outputs match for every possible input string, ignoring the Moore initial-output marker.`;
        }
        output.className = "conversion-message success";
    } else {
        output.textContent = `Not equivalent. ${result.reason}`;
        output.className = "conversion-message error";
    }
});
conversionType.addEventListener("change", () => {
    conversionManualEdit = true;
    buildConversionEditor();
});

// Initialize Project 2 from the exact Project 1 machine rather than A/B defaults.
syncConversionFromProjectOne();
