# Chapter 2 - Signal Properties

## Periodicity

### Worked Example 2:
Find the fundamental period of the following signal:

$$
f(t)=\cos{(2\pi t)} + 3\sin{(6\pi t)} - 5\cos{\left(10\pi t - \tfrac{\pi}{4}\right)}
$$


??? success "Show answer"
    $$
    T = 1
    $$

    ??? example "Show solution"
        Let's determine the periods of each component, since we know that sines and cosines are periodic.

        $$
        \exists\,T_{1},\quad \cos{(2\pi t)} = \cos{\left(2\pi \left(t+T_{1}\right)\right)}
        $$

        Expanding the argument, we have:

        $$
        \cos{\left(2\pi (t+T_{1})\right)} = \cos{\left(2\pi t + 2\pi T_{1}\right)}
        $$

        We know that:

        $$
        \cos{(x + 2\pi n)} = \cos{(x)},\quad n\in\mathbb{Z}
        $$

        So we have:

        $$
        2\pi T_{1} = 2\pi k_{1} \Rightarrow T_{1} = k_{1}
        $$

        We can pick the smallest positive number $k_{1}=1$, which gives us:

        $$
        T_{1} = 1
        $$

        Repeating this process for the second term:

        $$
        3\sin{(6\pi t)} = 3\sin{\left(6\pi\left(t + T_{2}\right)\right)} = 3\sin{\left(6\pi t + 6\pi T_{2}\right)}
        $$

        $$
        \Rightarrow 6\pi T_{2} = 2\pi k \Rightarrow T_{2} = \frac{k_{2}}{3}
        $$

        Then picking $k_{2}=1$ gives us:

        $$
        T_{2} = \frac{1}{3}
        $$

        Finally, for the third term, we have:
        $$
        T_{3} = \frac{k_{3}}{5}
        $$

        $$
        k_{3}=1\Rightarrow T_{3} = \frac{1}{5}
        $$

        To work out the periodicity of the whole signal, we need to consider when the periods 'line-up'.

        Since the individual components are periodic with integer multiples of:

        $$
        T_{1} = 1,\quad T_{2} = \frac{1}{3},\quad T_{3}=\frac{1}{5}
        $$

        The point where they line up can be computer by finding the *lowest common multiple*, equivalent to finding the smallest $T$ that satisfies:

        $$
        T = k_{1}T_{1} = k_{2}T_{2} = k_{3}T_{3}
        $$

        for some $k_{1},k_{2},k_{3}\in\mathbb{Z}^{+}$.

        ??? note "Note"

            Lowest-common-multiple is typically used for integers only, but we can extend this to fractions using:

            $$
            \mathrm{LCM}\left(\tfrac{n_{1}}{d_{1}},\dots, \tfrac{n_{k}}{d_{k}}\right) = \frac{\mathrm{LCM}\left(n_{1},\dots,n_{k}\right)}{\mathrm{GCD}(d_{1},\dots, d_{k})}
            $$

            $$
            T = \mathrm{LCM}\left(1,\tfrac{1}{3},\tfrac{1}{5}\right) = \frac{\mathrm{LCM}\left(1,1,1\right)}{\mathrm{GCD}(1,3,5)} = \frac{1}{1} = 1
            $$


            So our fundamental period would be $T=1$, which makes sense, since you need $3\times$ the second component's period and $5\times$ the third component's period to get the first components period.

            Or for a more complicated example, if we had periods of:

            $$
            T_{1} = \frac{2}{3},\quad T_{2} = \frac{5}{6},\quad T_{3} = \frac{1}{20}
            $$

            We'd get:

            $$
            T = \mathrm{LCM}\left(\tfrac{2}{3},\tfrac{5}{6},\tfrac{1}{24}\right) = \frac{\mathrm{LCM}\left(2,5,1\right)}{\mathrm{GCD}(3,6,24)} = \frac{10}{3}
            $$

