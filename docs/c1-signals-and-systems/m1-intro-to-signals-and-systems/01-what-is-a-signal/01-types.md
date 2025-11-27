# Chapter 1 - What is a signal?

## Time-like Signals
Most of the signals we encounter when studying signals and systems are time-like, so we'll formalise this mathematically.
### Continuous-time - Real-valued Signals
Most signals we encounter are real-valued, so we can define them as:

$$
x:\quad \mathbb{R}\to \mathbb{R},\quad t\mapsto x(t)
$$

### Continuous-time - Complex-valued Signals
However, some signals will actually be complex:

$$
z:\quad \mathbb{R}\to \mathbb{C},\quad t\mapsto z(t)
$$

### Discrete-time - Real-valued Signals
We can also have discrete-time signals

$$
x:\quad \mathbb{Z}\to \mathbb{R},\quad n\mapsto x[n]
$$

### Discrete-time - Complex-valued Signals
We can also have discrete-time complex-valued signals

$$
z:\quad \mathbb{Z}\to \mathbb{C},\quad n\mapsto z[n]
$$

### Discrete-time - Quantized Signals
If the output is restricted to only discrete values, i.e., through quantization/digitization, we can map each discrete value to an integer:

$$
x_{q}:\quad \mathbb{Z}\to \mathbb{Z},\quad n\mapsto x_{q}[n]
$$

## Deterministic vs Stochastic (Random)

A deterministic signal is a signal can be predict exactly by a mathematical formula. There is no uncertainty or randomness for a deterministic signal.

This is the simplest model, and while it's ideal, it can still be quite good at representing reality.

As a simple example, we can model the signal of a simple harmonic oscillator as:
$$
x(t) = A\sin{(2\pi f_{0} t + \phi)}
$$

On the other hand, a non-deterministic signal, also known as a stochastic signal has an element of randomness.
While the exact value of a stochastic signal cannot be predicted beforehand, we can model the statistical properties of the signal.

This is more suited in modelling the behaviour of real-world systems, but is an added layer of complexity that isn't strictly necessary for all applications.

An example of this would be a simple voltage measurement of current for a noisy source, due to thermal noise.
$$
i(t) = i_{s} + i_{\text{noise}}(t)
$$
$$
i_{\text{noise}}(t)\sim\mathcal{N}(0,\sigma^{2})
$$
Here we have the deterministic part $i_{s}$, which in this case is constant.

And we have the non-deterministic part $i_{\text{noise}}(t)$, which is modelled as additive white gaussian noise (AWGN).

While we don't know the actual value of this signal, we know that the average value will be $i_{s}$.


## Next Chapter: Signal Properties
In the next chapter, we'll explore some of the properties of signals.