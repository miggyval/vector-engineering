# Chapter 2 - Signal Properties

## Periodicity

### Worked Example 1:

Find the fundamental period of a sine wave with angular frequency $\omega_{0}$ and amplitude $A$.

$$
f(t) = A\sin{\left(\omega_{0} t\right)}
$$

??? success "Show answer"
    $$
    T = \frac{2\pi}{\omega_{0}}
    $$

    ??? example "Show solution"
        Using the property

        $$
        f(t) = f(t + T)
        $$

        We get

        $$
        A\sin{\left(\omega_{0}t\right)} = A\sin{\left(\omega_{0}\left(t + T\right)\right)}
        $$

        Now expanding out

        $$
        A\sin{\left(\omega_{0}\left(t + T\right)\right)} = A\sin{\left(\omega_{0}t + \omega_{0} T\right)}
        $$

        Using the trigonometric identity:

        $$
        \sin{(x)} = \sin{\left(x + 2\pi k\right)}
        $$

        We can compare corresponding terms and get:

        $$
        \omega_{0}T = 2\pi k
        $$

        Then solving for $T$, we have:

        $$
        T = \frac{2\pi k}{\omega_{0}}
        $$

        The smallest positive $T$ would be when $k=1$, so the fundamental period for the signal is:

        $$
        \Rightarrow T = \frac{2\pi}{\omega_{0}}
        $$
