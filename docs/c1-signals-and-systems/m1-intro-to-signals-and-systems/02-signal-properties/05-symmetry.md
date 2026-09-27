---
ve_id: page-8c291f61aa075a98
ve_kind: lesson
ve_legacy_path: c1-signals-and-systems/m1-intro-to-signals-and-systems/02-signal-properties/05-symmetry/
---

# Chapter 2 - Signal Properties

## Symmetry
### Continuous-time Signals
#### Even Signals
A signal that exhibits symmetry about the vertical axis is called an **even signal**.

Mathematically, an *even signal* must satisfy the following condition:

$$
f(-t) = f(t),\quad \forall t\in \mathbb{R}
$$

??? example "Show example"
    A common example of an even signal is a cosine wave:

    $$
    f(t) = \cos{(t)}
    $$

    $$
    f(-t) = \cos{(-t)} = \cos{(t)} = f(t)
    $$

#### Odd Signals
A signal that exhibits *anti*-symmetry about the vertical axis is called an **odd signal**.

Mathematically, an *odd signal* must satisfy the following condition:

$$
f(-t) = -f(t),\quad \forall t\in \mathbb{R}
$$

??? example "Show example"
    A common example of an even signal is a sine wave:

    $$
    f(t) = \sin{(t)}
    $$

    $$
    f(-t) = \sin{(-t)} = -\sin{(t)} = -f(t)
    $$

### Discrete-time Signals

For discrete-time signals, we have a similar definition:
#### Even Signals

$$
f[-n] = f[n],\quad \forall\, n\,\in\, \mathbb{Z}
$$
#### Odd Signals

$$
f[-n] = -f[n],\quad \forall\, n\,\in\, \mathbb{Z}
$$

### Finite Sequences / Periodic Signals

A related concept for finite sequences or periodic signals is called palindromic sequences.
For a finite sequence with length $N$, or a periodic signal with period $N$, we have the following definitions.

#### Palindromic Sequences
A sequence is *palindromic* and has **even symmetry** if:

$$
f[n] = f[N - n],\ \forall \, n\,\in\,\left\{1,\dots,N-1\right\}
$$


#### Anti-palindromic Sequences
A sequence are *anti-palindromic* and has **odd symmetry** if:

$$
f[n] = -f[N - n],\ \forall \, n\,\in\,\left\{1,\dots,N-1\right\}
$$

### Conjugate Symmetry / Hermitian Functions

For complex signals, we also have a similar property.
A complex valued function is **hermitian** and signal is conjugate symmetric if we have:

$$
F(-\omega) = F^{*}(\omega)
$$

where the $*$ operator denotes the complex conjugate.

??? example "Show example"
    A common example of a complex conjugate signal is a complex exponential.

    $$
    F(\omega) = e^{j\omega} = \cos{(\omega)} + j\sin{(\omega)}
    $$

    $$
    F(-\omega) = e^{-j\omega} = \cos{(\omega)} - j\sin{(\omega)} = F^{*}(\omega)
    $$