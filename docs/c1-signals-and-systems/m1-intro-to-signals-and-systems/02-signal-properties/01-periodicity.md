# Chapter 2 - Signal Properties

## Periodicity
### Continuous-time Signals
A *periodic* signal is a signal that repeats its behaviour over a certain period of time. A signal must exactly repeat itself over a fixed (non-zero) length in time, and must satisfy the definition:

$$
\exists\, T\in\mathbb{R}\setminus \{0\},\quad f(t) = f(t + T)
$$

where the *fundamental period* $T$ is the smallest positive value such that this is true.

A signal that does not satisfy this, for any $T$ is called *aperiodic* or *non-periodic*.

### Discrete-time Signals

For discrete-time signals, we have a similar definition:

$$
\exists\, N\in\mathbb{Z}\setminus \{0\},\quad f[n] = f[n + N]
$$