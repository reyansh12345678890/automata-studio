
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

// Press Enter to run.
inputField.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        runSimulation();
    }
});


/* =========================================
   THEORY NAVIGATION
   ========================================= */

document.getElementById("theory-nav").addEventListener(
    "click",
    () => {
        document.getElementById("theory-section").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
);


/* =========================================
   INITIALIZE APPLICATION
   ========================================= */

selectMachine("mealy");