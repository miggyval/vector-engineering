document.addEventListener("DOMContentLoaded", () => {
  const quizzes = document.querySelectorAll(".mcq");
  if (!quizzes.length) return;

  quizzes.forEach((quiz) => {
    const correct = quiz.dataset.answer;
    const options = quiz.querySelectorAll("li[data-option]");
    const feedback = quiz.querySelector(".mcq-feedback");
    const button = quiz.querySelector(".mcq-check");

    let selected = null;

    // Select an option by clicking it
    options.forEach((opt) => {
      opt.addEventListener("click", () => {
        options.forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");
        selected = opt.dataset.option;
        if (feedback) {
          feedback.textContent = "";
          feedback.className = "mcq-feedback";
        }
      });
    });

    // Check the answer when button is clicked
    if (button) {
      button.addEventListener("click", () => {
        if (!selected) {
          if (feedback) {
            feedback.textContent = "Please select an answer first.";
            feedback.className = "mcq-feedback mcq-feedback-warn";
          }
          return;
        }

        if (selected === correct) {
          if (feedback) {
            feedback.textContent = "✅ Correct!";
            feedback.className = "mcq-feedback mcq-feedback-correct";
          }
        } else {
          if (feedback) {
            feedback.textContent = "❌ Not quite. Try again.";
            feedback.className = "mcq-feedback mcq-feedback-wrong";
          }
        }
      });
    }
  });
});
