
# AutomataStudio — Mealy–Moore Machine Simulator

## 1. Project Overview

AutomataStudio is an interactive web-based simulator developed
for the Theory of Computation (TOC) course.

It allows users to explore Mealy and Moore finite-state
machines, visualize their state transitions, and simulate
input strings over a binary alphabet.

## 2. Objectives

- Understand the working of Mealy and Moore machines.
- Visualize states and transitions through state diagrams.
- Simulate binary input strings step by step.
- Display generated outputs and transition traces.
- Compare the output functions of Mealy and Moore machines.
- Understand the mathematical representation of finite-state
  transducers.

## 3. Technologies Used

- HTML5 — Page structure
- CSS3 — Styling and responsive interface
- JavaScript — Machine logic and simulation
- SVG — State diagram visualization

## 4. Machine Definition

The simulator uses two states:

- E: Even number of 1s encountered so far.
- O: Odd number of 1s encountered so far.

The input alphabet is:

Σ = {0, 1}

The initial state is E.

Reading 0 preserves the current state, while reading 1
switches between E and O.

### Transition Table

| Current State | Input 0 | Input 1 |
|---|---|---|
| E | E | O |
| O | O | E |

### Mealy Machine

A Mealy machine generates output based on the current state
and the input symbol.

Output function:

λ: Q × Σ → Γ

| State | Input 0 | Input 1 |
|---|---|---|
| E | 0 | 1 |
| O | 1 | 0 |

### Moore Machine

A Moore machine generates output based only on the current
state.

Output function:

λ: Q → Γ

| State | Output |
|---|---|
| E | 0 |
| O | 1 |

The Moore output includes the initial state's output.

## 5. Features

- Switch between Mealy and Moore machines.
- Interactive state diagram.
- Visual highlighting of the current state and active transition.
- Input validation for binary strings.
- Complete simulation and step-by-step execution.
- Generated output display.
- Transition trace table.
- Machine transition table.
- Formal mathematical definition.
- Theory reference comparing both machine types.
- Dark-themed user interface.

## 6. Example

Input string: 10110

State sequence:

E → O → O → E → O → O

Mealy output: 11011

Moore output: 011011

The Moore output contains six symbols because the output
of the initial state is included before processing the
five input symbols.

## 7. How to Run

1. Download or clone the project.
2. Open the project folder in Visual Studio Code.
3. Open index.html using a browser or the Live Server
   extension.
4. Select Mealy Machine or Moore Machine.
5. Enter a binary input string containing 0s and 1s.
6. Click Run Machine to execute the complete simulation.
7. Click Step to inspect individual transitions.

No backend server or database is required.

## 8. Author

Developed and maintained by **Reyansh Gupta** ([@reyansh12345678890](https://github.com/reyansh12345678890)).

## 9. Conclusion

AutomataStudio demonstrates the operation of Mealy and Moore
machines through an interactive visual interface.

It connects the theoretical concepts of finite-state
transducers with practical simulation, helping users
understand state transitions, output generation, and the
differences between the two machine models.