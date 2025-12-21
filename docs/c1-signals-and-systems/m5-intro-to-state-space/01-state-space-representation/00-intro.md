# What is state-space?

## A warm-up
Let's solve a simple first order differential equation.

$$
\dot{x}(t) = ax(t) + bu(t)
$$

We can solve this in two ways – firstly let's do the traditional approach using integrating factors.

#### Method A: Integrating Factors
??? example "Show solution"
    $$
    \begin{align*}
    \dot{x}(t) &= ax(t) + bu(t) \\
    \dot{x}(t) - ax(t) &= bu(t)
    \end{align*}
    $$

    At this point, we can see that the integrating factor is:

    $$
    I(t) = e^{\int -a\,\mathrm{d}t} = e^{-at}
    $$

    So multiplying both sides, and factoring we get:

    $$
    \begin{align*}
    e^{-at}\dot{x}(t) - ae^{-at}x(t) &= e^{-at}bu(t) \\
    \frac{d}{dt}\left(e^{-at}x(t)\right) &= e^{-at}bu(t)
    \end{align*}
    $$

    Now, we can integrate both sides, and use the fundamental theorem of calculus:

    $$
    \int_{a}^{b}\frac{df}{d\tau} \,\mathrm{d}\tau = f(b) - f(a)
    $$

    So if we integrate from $\tau=0$ to $\tau=t$, we get:

    $$
    \begin{align*}
    \int_{0}^{t}\frac{d}{d\tau}e^{-a\tau}x(\tau)\,\mathrm{d}\tau &= \int_{0}^{t}e^{-a\tau}bu(\tau)\,\mathrm{d}\tau \\
    e^{-at}x(t) - e^{0}x(0) &= \int_{0}^{t}e^{-a\tau}bu(\tau)\,\mathrm{d}\tau \\
    e^{-at}x(t) &= x(0) + \int_{0}^{t}e^{-a\tau}bu(\tau)\,\mathrm{d}\tau \\
    x(t) &= e^{at}x(0) + e^{at}\int_{0}^{t}e^{-a\tau}bu(\tau)\,\mathrm{d}\tau \\
    &= e^{at}x(0) + \int_{0}^{t}e^{-a(t-\tau)}bu(\tau)\,\mathrm{d}\tau
    \end{align*}
    $$

Since we've all discovered the magic of Laplace transforms, let's try to use them to solve this now.
#### Method B: Laplace Transform
??? example "Show solution"

    $$
    \begin{align*}
    \dot{x}(t) &= ax(t) + bu(t) \\
    sX(s) - x(0) &= aX(s) + bU(s) \\
    (s - a)X(s) &= x(0) + bU(s) \\
    X(s) &= \frac{x(0)}{s - a} + \frac{bU(s)}{s - a} \\
    \end{align*}
    $$

    Now, we can easily take the inverse Laplace transform to get the time-domain solution. We will need to use the convolution theorem for the input.

    $$
    x(t) = \mathcal{L}^{-1}\left\{\frac{x(0)}{s - a}\right\} + \mathcal{L}^{-1}\left\{\frac{bU(s)}{s - a}\right\}
    $$

    For both terms, we have a common factor:

    $$
    \mathcal{L}^{-1}\left\{\frac{1}{s - a}\right\} = e^{at}
    $$

    So, we get:

    $$
    \begin{align*}
    x(t) &= e^{at}x(0) + (bu*e^{at})(t) \\
    &= e^{at}x(0) + \int_{0}^{t}bu(\tau)e^{-a(t-\tau)}\,\mathrm{d}\tau
    \end{align*}
    $$

Let's try and solve a 2nd order ODE now, maybe we can use a mass-spring-damper system.

$$
m\ddot{x}(t) + c\dot{x}(t) + kx(t) = f(t)
$$

??? example "Show solution"

    Unfortunately, we can no longer use a simple integrating factor to solve this. We can try the method of undetermined coefficients.

    Let's start off by defining the homogeneous equation, and deriving the characteristic equation.

    $$
    m\ddot{x}_{h}(t) + c\dot{x}_{h}(t) + kx_{h}(t) = 0
    $$

    $$
    \Rightarrow ms^{2} + cs + k = 0
    $$

    We can divide out by the mass $m$.

    $$
    \Rightarrow s^{2} + \frac{c}{m}s + \frac{k}{m} = 0
    $$

    By matching it to the standard form:

    $$
    s^{2} + 2\alpha s + \omega_{0}^{2} = 0
    $$

    We get:

    $$
    \alpha = \frac{c}{2m},\quad \omega_{0} = \sqrt{\frac{k}{m}}
    $$

    Now, splitting it into four cases:

    ### Case 1: $\alpha > \omega_{0}$: Overdamped

    If we define:

    $$
    \beta = \sqrt{\alpha^{2} - \omega_{0}^{2}}
    $$

    $$
    x_{h}(t) = A_{1}e^{-(\alpha + \beta) t} + A_{2}e^{-(\alpha - \beta)t}
    $$

    ### Case 2: $\alpha < \omega_{0}$: Underdamped

    If we define:

    $$
    \omega_{d} = \sqrt{\omega_{0}^{2} - \alpha^{2}}
    $$

    $$
    x_{h}(t) = B_{1}e^{-\alpha t}\cos{(\omega_{d}t)} + B_{2}e^{-\alpha t}\sin{(\omega_{d}t)}
    $$

    ### Case 3: $\alpha = \omega_{0}$: Critically-damped

    $$
    x_{h}(t) = C_{1}e^{-\alpha t} + C_{2}te^{-\alpha t}
    $$

    ### Case 4: $\alpha = 0$: Undamped

    $$
    x_{h}(t) = D_{1}\cos{(\omega_{0}t)} + D_{2}\sin{(\omega_{0}t)}
    $$

    Now that we've solved for the general homogeneous equation, we can then solve for a particular solution $x_{p}(t)$ that satisfies:
    
    $$
    m\ddot{x}_{p}(t) + c\dot{x}_{p}(t) + kx_{p}(t) = f(t)
    $$

    It seems as if we're at a dead-end here if we don't know what $f(t)$ is, so let's try using Laplace transforms.


??? example "Show solution"

    $$
    m\ddot{x}(t) + c\dot{x}(t) + kx(t) = f(t)
    $$

    We can now take the Laplace transform to get:

    $$
    ms^{2}X(s) - msx(0) - m\dot{x}(0) + csX(s) - cx(0) + kX(s) = F(s)
    $$

    Then rearranging it to make $X(s)$ the subject, we get:

    $$
    \begin{align*}
    X(s)\left(ms^{2} + cs + k\right) &= m\dot{x}(0) + msx(0) + cx(0) + F(s) \\
    X(s) &= \frac{m\dot{x}(0) + msx(0) + cx(0) + F(s)}{ms^{2} + cs + k} \\
    &= \frac{\dot{x}(0) + sx(0) + \frac{c}{m}x(0) + \frac{1}{m}F(s)}{s^{2} + \frac{c}{m}s + \frac{k}{m}}
    \end{align*}
    $$

    Then if we let:

    $$
    \alpha = \frac{c}{2m},\quad \omega_{0} = \sqrt{\frac{k}{m}},\quad \omega_{d} = \sqrt{\omega_{0}^{2} - \alpha^{2}}
    $$

    $$
    \begin{align*}
    X(s) &= \frac{\dot{x}(0) + sx(0) + 2\alpha x(0) + \frac{1}{m}F(s)}{s^{2} + 2\alpha s + \omega_{0}^{2}} \\
    &= x(0)\frac{s + \alpha}{(s + \alpha)^{2} + \omega_{d}^{2}}
    + \frac{\alpha x(0) + \dot{x}(0)}{\omega_{d}}\frac{\omega_{d}}{(s + \alpha)^{2} + \omega_{d}^{2}} + \frac{F(s)}{m\omega_{d}}\frac{\omega_{d}}{(s + \alpha)^{2} + \omega_{d}^{2}} \\
    \end{align*}
    $$

    Now we can take the Inverse Laplace transform, since we know:

    $$
    \mathcal{L}^{-1}\left\{\frac{s + \alpha}{(s + \alpha)^{2} + \omega_{d}^{2}}\right\} = e^{-\alpha t}\cos{(\omega_{d} t)}
    $$

    $$
    \mathcal{L}^{-1}\left\{\frac{\omega_{d}}{(s + \alpha)^{2} + \omega_{d}^{2}}\right\} = e^{-\alpha t}\sin{(\omega_{d} t)}
    $$

    $$
    x(t) = x(0)e^{-\alpha t}\cos{(\omega_{d}t)} + \frac{\alpha x(0) + \dot{x}(0)}{\omega_{d}}e^{-\alpha t}\sin{(\omega_{d}t)} + \frac{1}{m\omega_{d}}\left(e^{-\alpha t}\sin{(\omega_{d}t)} * f(t)\right)
    $$

    As you can probably tell, this process is quite long, even with the help of the magical Laplace transform. Now imagine how much longer this would take for a 3th order system, or even an 6th order system.

    We'll need something more powerful to help us.


# A new challenger approaching

Introducing state space.

What if we could turn our 2nd order differential equation into two 1st order differential equations.

Let's define some new variables.

$$
x_{1}(t) = x(t),\quad x_{2}(t) = \dot{x}(t)
$$

Now, we want to create two first order differential equations from this.
The most obvious one is:

$$
\dot{x}_{1}(t) = \dot{x}(t) = x_{2}(t)
$$

Now, let's try to find $\dot{x}_{2}(t)$.

Using our original ODE, letting the input be $u(t) = f(t)$, and substituting in our variables, we get.

$$
m\dot{x}_{2}(t) + cx_{2}(t) + kx_{1}(t) = u(t)
$$

We can rearrange this to get:

$$
\dot{x}_{2}(t) = -\frac{k}{m}x_{1}(t) - \frac{c}{m}x_{2}(t) + \frac{1}{m}u(t)
$$

So, the two equations are:

$$
\begin{cases}
\dot{x}_{1}(t) = x_{2}(t) \\
\dot{x}_{2}(t) = -\frac{k}{m}x_{1}(t) - \frac{c}{m}x_{2}(t) + \frac{1}{m}u(t)
\end{cases}
$$

Notice that this can actually be turned into a matrix-vector equation.

$$
\begin{bmatrix}\dot{x}_{1}(t) \\ \dot{x}_{2}(t)\end{bmatrix} = \begin{bmatrix}0 & 1 \\ -\frac{k}{m} & -\frac{c}{m}\end{bmatrix}\begin{bmatrix}x_{1}(t) \\ x_{2}(t)\end{bmatrix} + \begin{bmatrix}0 \\ \frac{1}{m}\end{bmatrix}u(t)
$$

So if we define these matrices as:

$$
A = \begin{bmatrix}0 & 1 \\ -\frac{k}{m} & -\frac{c}{m}\end{bmatrix},\quad B = \begin{bmatrix}0 \\ \frac{1}{m}\end{bmatrix}
$$

We get a single matrix-vector equation:

$$
\dot{x}(t) = Ax(t) + Bu(t)
$$

Hang on, isn't this familiar?

Didn't we already solve something like this at the start?

Let's solve it again, anyway.

This time, we'll need to take care with the non-commutativity of the matrices.

We'll solve it first using integrating factors, then again, using Laplace.

$$
\dot{x}(t) = Ax(t) + Bu(t)
$$

$$
\dot{x}(t) - Ax(t) = Bu(t)
$$

The integrating factor isn't a simple scalar, so we'll need to take care with this.

We want a matrix-valued integrating factor $M(t)$ that satisfies:

$$
\dot{M}(t) = -AM(t)
$$

Perhaps we can redefine a *matrix* exponential to be the same Taylor/McLaurin/power series, but with matrix multiplication.

$$
M(t) = \exp{(-At)} \triangleq \sum_{k=0}^{\infty}\frac{(-At)^{k}}{k!}
$$

Now, if we differentiate it we get:

$$
\begin{align*}
\dot{M}(t) &= \frac{d}{dt}\left(\sum_{k=0}^{\infty}\frac{(-At)^{k}}{k!}\right) \\
&= \frac{d}{dt}\left(\sum_{k=0}^{\infty}\frac{(-A)^{k}t^{k}}{k!}\right) \\
&= \sum_{k=0}^{\infty}\frac{(-A)^{k}\frac{d}{dt}\left(t^{k}\right)}{k!} \\
&= \sum_{k=0}^{\infty}\frac{(-A)^{k}kt^{k-1}}{k!} \\
\end{align*}
$$

The $k=0$ term vanishes since it's a constant, so we have:

$$
\dot{M}(t) = \sum_{k=1}^{\infty}\frac{(-A)^{k}kt^{k-1}}{k!} \\
$$

Then since $\frac{k}{k!} = \frac{1}{(k-1)!}$:

$$
\dot{M}(t) = \sum_{k=1}^{\infty}\frac{(-A)^{k}t^{k-1}}{(k - 1)!} \\
$$

Now we can re-index the sum using $k\to k + 1$

$$
\dot{M}(t) = \sum_{k=0}^{\infty}\frac{(-A)^{k+1}t^{k}}{k!} \\
$$

Finally, we can factor out $(-A)$.

$$
\begin{align*}
\dot{M}(t) &= -A\sum_{k=0}^{\infty}\frac{(-A)^{k}t^{k}}{k!} \\
&= -A\sum_{k=0}^{\infty}\frac{(-At)^{k}}{k!}
\end{align*}
$$

Now we have out original series for $M(t)$.

$$
\Rightarrow \dot{M}(t) = -AM(t)
$$

So our integrating factor is:

$$
M(t) = \exp{\left(-At\right)} = \sum_{k=0}^{\infty}\frac{(-A)^{k}t^{k}}{k!} \\
= -A\sum_{k=0}^{\infty}\frac{(-At)^{k}}{k!}
$$

We can also write this using the power notation:

$$
M(t) = e^{-At}
$$

Obviously we can't take a scalar to a matrix power, instead it's just defined as the matrix power series.

So pre-multiplying our equation from earlier.

$$
e^{-At}\dot{x}(t) - e^{-At}Ax(t) = e^{-At}Bu(t)
$$

Then using the product rule:

$$
\frac{d}{dt}\left(e^{-At}x(t)\right) = e^{-At}\dot{x}(t) - e^{-At}Ax(t)
$$

We can simplify the LHS to be:

$$
\frac{d}{dt}\left(e^{-At}x(t)\right) = e^{-At}Bu(t)
$$

Then integrating from $\tau=0$ to $\tau=t$, we get:


$$
\begin{align*}
\int_{0}^{t}\frac{d}{d\tau}e^{-A\tau}x(\tau)\,\mathrm{d}\tau &= \int_{0}^{t}e^{-A\tau}Bu(\tau)\,\mathrm{d}\tau \\
e^{-At}x(t) - e^{A\cdot 0}x(0) &= \int_{0}^{t}e^{-A\tau}Bu(\tau)\,\mathrm{d}\tau \\
e^{-At}x(t) &= x(0) + \int_{0}^{t}e^{-A\tau}Bu(\tau)\,\mathrm{d}\tau \\
x(t) &= e^{At}x(0) + e^{At}\int_{0}^{t}e^{-A\tau}Bu(\tau)\,\mathrm{d}\tau \\
&= e^{At}x(0) + \int_{0}^{t}e^{-A(t-\tau)}Bu(\tau)\,\mathrm{d}\tau
\end{align*}
$$

Note that exponentiating the zero matrix gives you the identity matrix.

$$
e^{A\cdot 0} = I
$$

Additionally, for matrix exponentials, we have the following properties:

$$
\begin{align*}
e^{At_{1}}e^{At_{2}} &= e^{A(t_{1} + t_{2})} \\
\left(e^{At}\right)^{-1} = e^{-At}
Ae^{At} = e^{At}A
\end{align*}
$$

So the final result we get is:

$$
x(t) = e^{At}x(0) + \int_{0}^{t}e^{-A(t-\tau)}Bu(\tau)\,\mathrm{d}\tau
$$