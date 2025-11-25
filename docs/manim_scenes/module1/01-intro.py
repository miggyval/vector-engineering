from manim import *

class FourierTransformDefinition(Scene):
    def construct(self):
        # Title
        title = Text("Fourier Transform", font_size=60)
        title.to_edge(UP)

        # Main formula: X(jω) = ∫ x(t) e^{-jωt} dt
        formula = MathTex(
            "X(j\\omega)",
            "=",
            "\\int_{-\\infty}^{\\infty}",
            "x(t)",
            "e^{-j\\omega t}",
            "\\,dt",
            font_size=48,
        )
        formula.next_to(title, DOWN, buff=0.75)

        # Small explanatory labels (optional)
        x_label = Tex("time-domain signal", font_size=32).next_to(formula[3], DOWN)
        kernel_label = Tex("complex exponential kernel", font_size=32).next_to(formula[4], DOWN)
        X_label = Tex("frequency-domain representation", font_size=32).next_to(formula[0], UP)

        # Animate
        self.play(Write(title))
        self.wait(0.3)

        # Write the integral bit by bit
        self.play(Write(formula[0]))  # X(jω)
        self.play(Write(formula[1]))  # =
        self.play(Write(formula[2]))  # ∫
        self.play(Write(formula[3]))  # x(t)
        self.play(Write(formula[4]))  # e^{-jωt}
        self.play(Write(formula[5]))  # dt
        self.wait(0.5)

        # Bring in the labels
        self.play(
            FadeIn(X_label, shift=UP * 0.2),
            FadeIn(x_label, shift=DOWN * 0.2),
            FadeIn(kernel_label, shift=DOWN * 0.2),
        )
        self.wait(2)
