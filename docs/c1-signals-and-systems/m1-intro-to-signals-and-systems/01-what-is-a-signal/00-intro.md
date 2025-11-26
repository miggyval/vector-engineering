# Chapter 1 - What is a signal?
## Introduction
A *signal* is a quantity that varies depending on another independent quantity, typically one that is time-like, or space-like.

Some examples:
- Air pressure, as a function of time, for a sound signal.

$$
P:\quad \mathbb{R}\to \mathbb{R},\quad t\mapsto P(t)
$$

- Voltage, as a function of time, for an electrical signal.

$$
v:\quad \mathbb{R}\to \mathbb{R},\quad t\mapsto v(t)
$$

- Digital amplitude as a function of samples. for a digital audio signal.

$$
y:\quad \mathbb{Z}\to\mathbb{Z},\quad k\mapsto y[k] 
$$

- Colour, as a function of pixel coordinate, for an image

$$
\vec{c}(u,v) = \left[r(u,v), g(u,v), b(u,v)\right]^{\top}
$$

$$
(r,g,b):\quad \mathbb{Z}^{3}\to \mathbb{Z},\quad (u,v)\mapsto (r,g,b)
$$

- The magnetic field vector, as a function of position and time, for a magnetic field:

$$
\vec{B}:\quad \mathbb{R}^{3}\times \mathbb{R}\to \mathbb{R}^{3},\quad (x,y,z,t)\mapsto \vec{B}(x,y,z,t)
$$

- The population of a city over time:

$$
n_{p}:\quad \mathbb{R}\to \mathbb{Z},\quad t\mapsto n_{p}(t)
$$

- The gross domestic product of a country, each year.

$$
r[n]:\quad\mathbb{Z}\to \mathbb{R},\quad n\mapsto r[n]
$$

- Daily blood pressure readings

$$
\vec{P}\quad \mathbb{Z}\to \mathbb{R}^{2}:\quad n\mapsto [P_{s}[n], P_{d}[n]]^{\top}
$$

In the next section, we'll explore some of the different types of signals, as well how to classify them and define them mathematically.
