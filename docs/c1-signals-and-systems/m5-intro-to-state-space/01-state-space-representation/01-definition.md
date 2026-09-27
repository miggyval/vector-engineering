---
ve_id: page-b1ddc90b6d7355cf
ve_kind: lesson
ve_legacy_path: c1-signals-and-systems/m5-intro-to-state-space/01-state-space-representation/01-definition/
---

# Definition: State-Space

Now, we can finally define the state-space representation.

An LTI system with $p$-inputs, $q$ outputs, and $n$ state variables is written in the time-domain as:

$$
\begin{align*}
\dot{x}(t) &= Ax(t) + Bu(t) \\
y(t) &= Cx(t) + Du(t)
\end{align*}
$$

In addition to the state equation we derived in the last chapter, which describes the dynamics of the system, and how the state evolves with respect to itself and the input, we also have the output equation which describes how the state and input relates to the output.