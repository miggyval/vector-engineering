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

## Deterministic vs Non-deterministic (random)

## Next Chapter: Signal Properties
In the next chapter, we'll explore some of the properties of signals.