# Chapter 2 - Signal Properties

## Symmetry

### Worked Example 1:

Find the even and odd components of

$$
f(t) = \cos{\left(2\pi t - \tfrac{\pi}{4}\right)}
$$

#### Method A:
??? example "Show solution"

    We can use a trig identity for this one actually.

    $$
    f(t) = \cos{\left(2\pi t - \tfrac{\pi}{4}\right)}
    $$

    $$
    \cos{(a-b)} = \cos{(a)}\cos{(b)} + \sin{(a)}\sin{(b)}
    $$

    So for this signal, we have:

    $$
    \begin{align*}
    f(t) &= \cos{\left(2\pi t - \frac{\pi}{4}\right)} \\
        &= \cos{\left(2\pi t\right)}\cos{\left(\tfrac{\pi}{4}\right)} + \sin{\left(2\pi t\right)}\sin{\left(\tfrac{\pi}{4}\right)} \\
        &=\frac{\sqrt{2}}{2}\cos{\left(2\pi t\right)} + \frac{\sqrt{2}}{2}\sin{\left(2\pi t\right)}
    \end{align*}
    $$

    So clearly our even and odd components are:
    
    $$
    \begin{cases}
    f_{e}(t) &= \frac{\sqrt{2}}{2}\cos{\left(2\pi t\right)} \\
    f_{o}(t) &= \frac{\sqrt{2}}{2}\sin{\left(2\pi t\right)} \\
    \end{cases}
    $$

#### Method B:
??? example "Show solution"

    The other method for this is to use the formlas directly

    $$
    f(t) = \cos{\left(2\pi t - \tfrac{\pi}{4}\right)}
    $$

    For the **even** component:

    $$
    \begin{align*}
    f_{e}(t) &= \tfrac{1}{2}\left(f(t) + f(-t)\right) \\
            &= \tfrac{1}{2}\left(\cos{\left(2\pi t - \tfrac{\pi}{4}\right)} + \cos{\left(-2\pi t - \tfrac{\pi}{4}\right)}\right) \\
            &= \tfrac{1}{2}\left(\cos{\left(2\pi t - \tfrac{\pi}{4}\right)} + \cos{\left(2\pi t +\tfrac{\pi}{4}\right)}\right) \\
    \end{align*}
    $$

    Now using the trig identity:

    $$
    \cos{(a)}\cos{(b)} = \tfrac{1}{2}\left(\cos{(a - b)} + \cos{(a + b)}\right)
    $$

    We get:

    $$
    f_{e}(t) = \cos{\left(2\pi t\right)}\cos{\left(\tfrac{\pi}{4}\right)} = \tfrac{\sqrt{2}}{2}\cos{\left(2\pi t\right)}
    $$

    For the **odd** component:

    $$
    \begin{align*}
    f_{o}(t) &= \tfrac{1}{2}\left(f(t) - f(-t)\right) \\
            &= \tfrac{1}{2}\left(\cos{\left(2\pi t - \tfrac{\pi}{4}\right)} - \cos{\left(-2\pi t - \tfrac{\pi}{4}\right)}\right) \\
            &= \tfrac{1}{2}\left(\cos{\left(2\pi t - \tfrac{\pi}{4}\right)} - \cos{\left(2\pi t +\tfrac{\pi}{4}\right)}\right) \\
    \end{align*}
    $$

    Now using the trig identity:

    $$
    \sin{(a)}\sin{(b)} = \tfrac{1}{2}\left(\cos{(a - b)} - \cos{(a + b)}\right)
    $$

    We get:

    $$
    f_{o}(t) = \sin{\left(2\pi t\right)}\sin{\left(\tfrac{\pi}{4}\right)} = \tfrac{\sqrt{2}}{2}\sin{\left(2\pi t\right)}
    $$