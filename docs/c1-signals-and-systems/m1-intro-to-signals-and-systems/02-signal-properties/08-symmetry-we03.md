# Chapter 2 - Signal Properties

## Symmetry

### Worked Example 3:

Find the even and odd components a half-wave rectified sine wave, and simplify.

$$
f(t) =
\begin{cases}
\sin{\left(\tfrac{2\pi t}{T}\right)},\quad & 0\leq t \leq \frac{T}{2} \\
0,\quad & \frac{T}{2} < t < T
\end{cases}
\qquad f(t + T) = f(t)
$$


??? success "Show answer"

    The even and odd components are given by:

    $$
    \begin{cases}
    f_{e}(t) &= \frac{1}{2} \left|\sin{\left(\frac{2\pi t}{T}\right)}\right| \\
    f_{o}(t) &= \frac{1}{2} \sin{\left(\frac{2\pi t}{T}\right)} \\
    \end{cases}
    $$

    where

    $$
    f(t) = f_{e}(t) + f_{o}(t)
    $$

    ??? example "Show solution"
        We'll solve this directly using the formula.

        $$
        \begin{align*}
        f_{e}(t) &= \tfrac{1}{2}\left[f(t) + f(-t)\right] \\
        f_{o}(t) &= \tfrac{1}{2}\left[f(t) + f(-t)\right] \\
        \end{align*}
        $$


        Let's break this into the two cases:

        ---

        #### Case 1: $0 < t < \tfrac{T}{2}$

        $$
        \Rightarrow f(t) = \sin{\left(\tfrac{2\pi t}{T}\right)},\quad f(-t) = 0
        $$
        
        For the **even** component

        $$
        \begin{align*}
        f_{e}(t) &= \tfrac{1}{2}\left[f(t) + f(-t)\right] \\
        &= \tfrac{1}{2}\left[\sin{\left(\tfrac{2\pi t}{T}\right)} + 0 \right] \\
        &= \tfrac{1}{2}\sin{\left(\tfrac{2\pi t}{T}\right)}
        \end{align*}
        $$


        For the **odd** component

        $$
        \begin{align*}
        f_{o}(t) &= \tfrac{1}{2}\left[f(t) - f(-t)\right] \\
        &= \tfrac{1}{2}\left[\sin{\left(\tfrac{2\pi t}{T}\right)} - 0 \right] \\
        &= \tfrac{1}{2}\sin{\left(\tfrac{2\pi t}{T}\right)}
        \end{align*}
        $$
        
        ---

        #### Case 2: $\tfrac{T}{2} < t < T$
        
        $$
        \Rightarrow f(t) = 0, \quad f(-t) = \sin{\left(-\tfrac{2\pi t}{T}\right)} = -\sin{\left(\tfrac{2\pi t}{T}\right)}
        $$

        For the **even** component

        $$
        \begin{align*}
        f_{e}(t) &= \frac{1}{2}\left[f(t) + f(-t)\right] \\
        &= \frac{1}{2}\left[0-\sin{\left(\tfrac{2\pi t}{T}\right)}\right] \\
        &= -\frac{1}{2}\sin{\left(\tfrac{2\pi t}{T}\right)}
        \end{align*}
        $$

        For the **odd** component

        $$
        \begin{align*}
        f_{o}(t) &= \frac{1}{2}\left[f(t) - f(-t)\right] \\
        &= \frac{1}{2}\left[0 + \sin{\left(\tfrac{2\pi t}{T}\right)}\right] \\
        &= \frac{1}{2}\sin{\left(\tfrac{2\pi t}{T}\right)}
        \end{align*}
        $$

        ---

        #### Combining Cases

        Now, we can combine the two cases together:

        For the **even** component

        $$
        f_{e}(t) =
        \begin{cases}
        \frac{1}{2}\sin{\left(\tfrac{2\pi t}{T}\right)},\quad & 0 < t < \tfrac{T}{2} \\
        -\frac{1}{2}\sin{\left(\tfrac{2\pi t}{T}\right)},\quad & \tfrac{T}{2} < t < T \\
        \end{cases}
        \qquad f_{e}(t + T) = f_{e}(t)
        $$

        This can be written as:

        $$
        f_{e}(t) = \frac{1}{2}\left| \sin{\left(\frac{2\pi t}{T}\right)}\right|
        $$

        For the **odd** component

        $$
        f_{o}(t) =
        \begin{cases}
        \frac{1}{2}\sin{\left(\tfrac{2\pi t}{T}\right)},\quad & 0 < t < \tfrac{T}{2} \\
        \frac{1}{2}\sin{\left(\tfrac{2\pi t}{T}\right)},\quad & \tfrac{T}{2} < t < T \\
        \end{cases}
        \qquad f_{e}(t + T) = f_{e}(t)
        $$

        Clearly this is

        $$
        f_{o}(t) = \frac{1}{2}\sin{\left(\frac{2\pi t}{T}\right)}
        $$

        So to summarise, we have:

        $$
        \begin{cases}
        f_{e}(t) &= \frac{1}{2} \left|\sin{\left(\frac{2\pi t}{T}\right)}\right| \\
        f_{o}(t) &= \frac{1}{2} \sin{\left(\frac{2\pi t}{T}\right)} \\
        \end{cases}
        $$