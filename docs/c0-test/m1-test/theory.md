---
ve_id: page-0de694e11f1a5012
ve_kind: fixture
ve_legacy_path: c0-test/m1-test/theory/
search:
  exclude: true
---

# Module 1: The Fourier Transform


$$
F(\omega) = \int_{-\infty}^{\infty} f(t)e^{-j\omega t} \, d\tau
$$

## Example: RC low-pass filter

Here is the circuit we'll analyse:

<figure class="circuit-figure">
  <img src="../../../media/circuits/rc_lowpass.svg" alt="RC low-pass circuit">
  <figcaption>Figure 1: Series RC low-pass filter used in this module.</figcaption>
</figure>


<figure class="circuit-figure">
  <img src="../../../media/circuits/rl_highpass.svg" alt="RL high-pass circuit">
  <figcaption>Figure 2: Series RL high-pass filter used in this module.</figcaption>
</figure>

We will derive the transfer function

$$
H(s) = \frac{V_o(s)}{V_s(s)} = \frac{R}{R + \frac{1}{sC}}.
$$
