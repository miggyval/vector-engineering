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
    &= e^{at}x(0) + \int_{0}^{t}e^{a(t-\tau)}bu(\tau)\,\mathrm{d}\tau
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
    x(t) &= e^{at}x(0) + (e^{at}*bu)(t) \\
    &= e^{at}x(0) + \int_{0}^{t}e^{a(t-\tau)}bu(\tau)\,\mathrm{d}\tau
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

    As you can probably tell, this process is quite long, even with the help of the magical Laplace transform. Now imagine how much longer this would take for a 3rd order system, or even an 6th order system.

    We'll need something more powerful to help us.


# A new challenger approaching

Introducing state space.

What if we could turn our 2nd order differential equation into two 1st order differential equations.

??? example "Show solution"

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

??? example "Show solution"

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
    M(t) = \exp{\left(-At\right)} = \sum_{k=0}^{\infty}\frac{(-A)^{k}t^{k}}{k!}
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
    &= e^{At}x(0) + \int_{0}^{t}e^{A(t-\tau)}Bu(\tau)\,\mathrm{d}\tau
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
    x(t) = e^{At}x(0) + \int_{0}^{t}e^{A(t-\tau)}Bu(\tau)\,\mathrm{d}\tau
    $$

Now, let's do the Laplace transform approach.

??? example "Show solution"

    $$
    \dot{x}(t) = Ax(t) + Bu(t)
    $$

    Taking the Laplace transform gives:

    $$
    sX(s) - x(0) = AX(s) + BU(s)
    $$

    where

    $$
    X(s) =
    \begin{bmatrix}
    X_{1}(s) \\
    X_{2}(s)
    \end{bmatrix},\quad
    x(0) =
    \begin{bmatrix}
    x_{1}(0) \\
    x_{2}(0)
    \end{bmatrix}
    $$

    Now, we can rearrange the equation:

    $$
    \begin{align*}
    sX(s) - x(0) &= AX(s) + BU(s) \\
    sX(s) - AX(s) = x(0) + BU(s) \\
    (sI - A)X(s) = x(0) + BU(s) \\
    \end{align*}
    $$

    Then by premultiplying by $(sI - A)^{-1}$, assuming it exists, we get:

    $$
    X(s) = (sI - A)^{-1}x(0) + (sI - A)^{-1}BU(s)
    $$

    Then taking the Inverse Laplace transform:

    $$
    \begin{align*}
    x(t) &= \mathcal{L}^{-1}\left\{(sI - A)^{-1}x(0)\right\} + \mathcal{L}^{-1}\left\{(sI - A)^{-1}BU(s)\right\} \\
    = \mathcal{L}^{-1}\left\{(sI - A)^{-1}\right\}x(0) + \left(\mathcal{L}^{-1}\left\{(sI - A)^{-1}\right\} * Bu(t)\right) \\
    \end{align*}
    $$

    We have the same factor again, which for simplicity, we'll denote as:

    $$
    \Phi(s) = (sI - A)^{-1},\quad \phi(t) = \mathcal{L}^{-1}\left\{(sI - A)^{-1}\right\}
    $$

    Now, calculating it will be quite difficult, but we can predict what it's going to be, based on the previous method of integrating factors.

    Let's go through the derivation.

    $$
    \begin{align*}
    \Phi(s) &= \left(sI - A\right)^{-1} \\
    \Phi(s) &= \frac{1}{s}\left(I - \frac{A}{s}\right)^{-1}
    \end{align*}
    $$

    We can actually use a geometric series here:

    $$
    \sum_{n=0}^{\infty}T^{n} = \lim_{n\to \infty} S_{n} =  (I - T)^{-1}
    $$

    A simple proof for this is stated below:

    $$
    S_{n} = (I + T + T^{2} + \cdots T^{n})
    $$

    $$
    \begin{align*}
    (I - T)S_{n} = (I - T)(I + T + T^{2} + \cdots T^{n}) \\
    &= I\left(I + T + T^{2} + \cdots + T^{n}\right) - T\left(I + T + T^{2} + \cdots +  T^{n}\right) \\
    &= \left(I + T + T^{2} + \cdots + T^{n}\right) - \left(T + T^{2} + T{3} + \cdots + T^{n + 1}\right) \\
    &= I + T + T^{2} + \cdots + T_{n} - T - T^{2} - \cdots - T^{n+1} \\
    &= I - T^{n+1}
    \end{align*}
    $$

    So, if we take the limit of this as $n\to\infty$, we get:

    $$
    \lim_{n\to\infty}(I - T)S_{n} = I - \lim_{n\to\infty}T^{n+1}
    $$

    So, we actually need the condition that:

    $$
    \lim_{n\to\infty}T^{n} = 0
    $$

    This is true if and only if for all eigenvalues of $T$, denoted as $\lambda_{i}(T)$:

    $$
    |\lambda_{i}(T)| < 1,\quad \forall \lambda_{i}(T)
    $$

    where:
    $$
    \mathrm{det}\left(\lambda_{i}(T)I - T\right) = 0
    $$

    For our case, we have:

    $$
    T = \frac{A}{s}
    $$

    We can show that the eigenvalues of $A$ are the eigenvalues of $T = \frac{A}{s}$, but scaled by $\frac{1}{s}$.

    The eigenvalues of $A$, denoted as $\lambda(A)$ satisfy:

    $$
    \mathrm{det}\left(\lambda(A) I - A\right) = 0
    $$

    If we divide this by $s^{n}$:
    $$
    \frac{1}{s^{n}}\mathrm{det}\left(\lambda(A) I - A\right) = 0
    $$

    Then we can factor it into the determinant as:
    $$
    \mathrm{det}\left(\frac{\lambda(A)}{s} I - \frac{A}{s}\right)
    $$

    Then we can see that $\frac{\lambda(A)}{s}$ is an eigenvalue of $\frac{A}{s}$.

    So, in order for the series to converge, we need:

    $$
    |\frac{\lambda(A)}{s}| < 1
    $$

    To solve this, we pick the smallest $s$ required, which will be when:

    $$
    |s| > \max_{i}|\lambda_{i}|
    $$

    Let's assume that this is true, and we'll continue to compute the inverse Laplace.

    $$
    \begin{align*}
    \Phi(s) &= \frac{1}{s}\left(I - \frac{A}{s}\right)^{-1} \\
    &= \frac{1}{s}\left(\sum_{n=0}^{\infty}\left(\frac{A}{s}\right)^{n}\right)
    &= \frac{1}{s}\left(\sum_{n=0}^{\infty}\frac{A^{n}}{s^{n}}\right)
    \end{align*}
    $$

    Now, if we remember that the Laplace transform of a power is:

    $$
    \mathcal{L}\left\{t^{n}\right\} = \frac{n!}{s^{n+1}},\quad t\geq 0
    $$

    Then we can rearrange our expression as:

    $$
    \begin{align*}
    \Phi(s) &= \frac{1}{s}\left(\sum_{n=0}^{\infty}\frac{A^{n}}{s^{n}}\right) \\
    &= \sum_{n=0}^{\infty}\frac{A^{n}}{n!}\frac{n!}{s^{n+1}}
    \end{align*}
    $$

    Now, taking the inverse Laplace transform:

    $$
    \begin{align*}
    \phi(t) &= \mathcal{L}^{-1}\left\{\Phi(s)\right\} \\
    &= \mathcal{L}^{-1}\left\{\sum_{n=0}^{\infty}\frac{A^{n}}{n!}\frac{n!}{s^{n+1}}\right\} \\
    &= \sum_{n=0}^{\infty}\frac{A^{n}}{n!}\mathcal{L}^{-1}\left\{\frac{n!}{s^{n+1}}\right\} \\
    &= \sum_{n=0}^{\infty}\frac{A^{n}}{n!}t^{n} \\
    &= \sum_{n=0}^{\infty}\frac{(At)^{n}}{n!} \\
    \end{align*}
    $$

    This is the same matrix exponential from before.

    $$
    \phi(t) = \exp{\left(At\right)} = e^{At} = \sum_{n=0}^{\infty}\frac{(At)^{n}}{n!}
    $$

    This gives us a very key relationship:

    $$
    \mathcal{L}\left\{e^{At}\right\} = \left(sI - A\right)^{-1}
    $$

    If you remember from before, this is essentially the matrix version of:

    $$
    \mathcal{L}\left\{e^{at}\right\} = \frac{1}{s - a}
    $$

    Now, we can finally solve the equation:

    $$
    \begin{align*}
    x(t) &= \mathcal{L}^{-1}\left\{(sI - A)^{-1}\right\}x(0) + \left(\mathcal{L}^{-1}\left\{(sI - A)^{-1}\right\} * Bu(t)\right) \\
    &= \phi(t)x(0) + \left(\phi * Bu\right)(t) \\
    &= e^{At}x(0) + \int_{0}^{t}e^{A(t-\tau)}Bu(\tau)\,\mathrm{d}\tau
    \end{align*}
    $$

    As expected, this gives the same result as from convolution, but we've now connected it to the Laplace domain.