---
ve_id: page-ffc731ef1a54594d
ve_kind: lesson
ve_legacy_path: c1-signals-and-systems/m1-intro-to-signals-and-systems/02-signal-properties/07-symmetry-we02/
---

# Chapter 2 - Signal Properties

## Symmetry

### Worked Example 2:

Find the even and odd components of the unit pulse, and simplify.

$$
f(t) = u(t) - u(t - 1)
$$


??? success "Show answer"

    The even and odd components are given by:


    $$
    \begin{cases}
    f_{e}(t) &= \frac{u(t + 1) - u(t - 1)}{2} \\
    f_{o}(t) &= \frac{-u(t + 1) + 2u(t) - u(t - 1)}{2} \\
    \end{cases}
    $$

    where

    $$
    f(t) = f_{e}(t) + f_{o}(t)
    $$

    ??? example "Show solution"
        We'll solve this directly using the formula.

        For the even component, we have:

        $$
        \begin{align*}
        f_{e}(t) &= \tfrac{1}{2}\left[f(t) + f(-t)\right] \\
        &= \tfrac{1}{2}\left[u(t) - u(t - 1) + u(-t) - u(-t-1)\right] \\
        \end{align*}
        $$

        We know that $u(t) + u(-t) = 1$.

        $$
        \begin{align*}
        f_{e}(t) &= \tfrac{1}{2}\left[1 - u(-t-1) - u(t - 1)\right] \\
        \end{align*}
        $$

        We also know that:
        
        $$
        1 - u(-(t - a)) = u(t - a)
        $$

        So we have

        $$
        \begin{align*}
        f_{e}(t) &= \tfrac{1}{2}\left[1 - u(-t-1) - u(t - 1)\right] \\
        &= \tfrac{1}{2}\left[\left(1 - u(-(t + 1))\right) - u(t - 1)\right] \\
        &= \tfrac{1}{2}\left[u(t + 1) - u(t - 1)\right]
        \end{align*}
        $$

        Now for the odd component:
        
        $$
        \begin{align*}
        f_{o}(t) &= \tfrac{1}{2}\left[f(t) - f(-t)\right] \\
        &= \tfrac{1}{2}\left[\left(u(t) - u(t - 1)\right) - \left(u(-t) - u(-t-1)\right)\right] \\
        &= \tfrac{1}{2}\left[u(t) - u(t - 1) - u(-t) + u(-t - 1)\right] \\
        \end{align*}
        $$

        We know that $u(t) - u(-t) = 2u(t) - 1$

        $$
        \begin{align*}
        f_{o}(t) &= \tfrac{1}{2}\left[2u(t) - 1 - u(t - 1) + u(-t - 1)\right] \\
        \end{align*}
        $$

        Then using  $1 - u(-(t - 1)) = u(t - 1)$ from before:

        $$
        \begin{align*}
        f_{o}(t) &= \tfrac{1}{2}\left[2u(t) - 1 - u(t - 1) + u(-t - 1)\right] \\
        &= \tfrac{1}{2}\left[- \left(1 - u(-(t + 1))\right) + 2u(t) - u(t - 1) \right] \\
        &= \tfrac{1}{2}\left[- u(t + 1) + 2u(t) - u(t - 1)\right]
        \end{align*}
        $$