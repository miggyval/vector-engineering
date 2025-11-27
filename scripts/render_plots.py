from pathlib import Path
import numpy as np
import matplotlib
import matplotlib.pyplot as plt

# Use a non-interactive backend
matplotlib.use("Agg")

# LaTeX rendering
matplotlib.rcParams.update({
    "text.usetex": True,
    "font.family": "serif",
    "font.size": 14,
    "text.latex.preamble": r"\usepackage{amsmath}",  # optional, but nice
})

# Output directory
out_dir = Path("docs/media/images/c1-signals-and-systems")
out_dir.mkdir(parents=True, exist_ok=True)

# Common time axis
t = np.linspace(-2, 2, 400)

# Simple unit step u(t)
u = (t >= 0).astype(float)

for i in range(1, 6):
    if i == 1:
        # f1(t) = sin(2π t)
        y = np.sin(2 * np.pi * t)
        title = r"$f_{1}(t) = \sin(2\pi t)$"
    elif i == 2:
        # f2(t) = |cos(2π t)|
        y = np.abs(np.cos(2 * np.pi * t))
        title = r"$f_{2}(t) = \lvert\cos(2\pi t)\rvert$"
    elif i == 3:
        # f3(t) = sin(2π |t|)
        y = np.sin(2 * np.pi * np.abs(t))
        title = r"$f_{3}(t) = \sin\bigl(2\pi\lvert t\rvert\bigr)$"
    elif i == 4:
        # f4(t) = cos(2π |t|)
        y = np.cos(2 * np.pi * np.abs(t))
        title = r"$f_{4}(t) = \cos\bigl(2\pi\lvert t\rvert\bigr)$"
    elif i == 5:
        # f5(t) = cos(2π t) u(t)
        y = np.cos(2 * np.pi * t) * u
        title = r"$f_{5}(t) = \cos(2\pi t)\,u(t)$"

    fig, ax = plt.subplots(figsize=(6, 3.5), dpi=200)
    ax.plot(t, y)

    ax.set_xlabel(r"$t$")
    ax.set_ylabel(rf"$f_{{{i}}}(t)$")
    ax.set_title(title)
    ax.grid(True)

    fig.tight_layout()
    fig.savefig(out_dir / f"f{i}.svg", bbox_inches="tight")
    plt.close(fig)
