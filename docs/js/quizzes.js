document.addEventListener("DOMContentLoaded", () => {
  const quizzes = document.querySelectorAll(".mcq");
  if (!quizzes.length) return;

  quizzes.forEach((quiz) => {
    const correct = quiz.dataset.answer;
    const options = quiz.querySelectorAll("li[data-option]");
    const feedback = quiz.querySelector(".mcq-feedback");
    const button = quiz.querySelector(".mcq-check");
    const isMulti = typeof correct === "string" && correct.includes(",");
    let selected = null;

    function normalize(answer) {
      if (!answer) return "";
      return answer
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .sort()
        .join(",");
    }


    options.forEach((opt) => {
      opt.addEventListener("click", () => {
        const optVal = opt.dataset.option;
        if (isMulti) {
          // Toggle selection for multi-answer questions
          if (optVal == "f") {
            const isNowSelected = !opt.classList.contains("selected");
            options.forEach((o) => o.classList.remove("selected"));
            if (isNowSelected) {
              opt.classList.add("selected");
            }
          } else {
            const noneOpt = quiz.querySelector('li[data-option="f"]');
            if (noneOpt) {
              noneOpt.classList.remove("selected");
            }
            opt.classList.toggle("selected");

            const selectedOptions = Array.from(options)
              .filter((o) => o.classList.contains("selected"))
              .map((o) => o.dataset.option)
              .sort();

            selected = selectedOptions.join(",");
          }
        } else {
          // Single-answer: behave like radio buttons
          options.forEach((o) => o.classList.remove("selected"));
          opt.classList.add("selected");
          selected = opt.dataset.option;
        }
      });
    });

    // Check the answer when button is clicked
    if (button) {
      button.addEventListener("click", () => {
        if (!selected) {
          if (feedback) {
            feedback.textContent = "Please select an answer first.";
            feedback.className = "mcq-feedback mcq-feedback--warn";
          }
          return;
        }

        const isCorrect = normalize(selected) === normalize(correct);

        if (isCorrect) {
          if (feedback) {
            feedback.textContent = "✅ Correct!";
            feedback.className = "mcq-feedback mcq-feedback--correct";
          }
        } else {
          if (feedback) {
            feedback.textContent = "❌ Not quite. Try again.";
            feedback.className = "mcq-feedback mcq-feedback--incorrect";
          }
        }
      });
    }

  });
});

document.addEventListener("DOMContentLoaded", () => {
  const mcqs = Array.from(document.querySelectorAll(".mcq"));
  const checkAllBtn = document.getElementById("quiz-check-all");
  const summaryEl = document.getElementById("quiz-summary");

  if (!checkAllBtn || mcqs.length === 0) {
    return;
  }

  // helper: check if all questions have a selected option
  function allAnswered() {
    return mcqs.every(q => q.dataset.selected);
  }

  // update button enabled/disabled state
  function updateButtonState() {
    checkAllBtn.disabled = !allAnswered();
  }

  // attach click handlers to options
  mcqs.forEach(mcq => {
    const options = Array.from(mcq.querySelectorAll("li[data-option]"));

    options.forEach(opt => {
      opt.addEventListener("click", () => {
        // clear previous selection
        options.forEach(o => o.classList.remove("mcq-selected"));
        // mark new selection
        opt.classList.add("mcq-selected");
        mcq.dataset.selected = opt.dataset.option;

        updateButtonState();
      });
    });
  });

  // grading logic when "Check all answers" is clicked
  checkAllBtn.addEventListener("click", () => {
    if (!allAnswered()) {
      // safety guard – should be disabled anyway
      summaryEl.textContent = "Please answer all questions first.";
      return;
    }

    let correct = 0;

    mcqs.forEach(mcq => {
      const answer = mcq.dataset.answer;
      const chosen = mcq.dataset.selected;
      const feedback = mcq.querySelector(".mcq-feedback");
      const options = Array.from(mcq.querySelectorAll("li[data-option]"));

      // clear old state
      options.forEach(o => {
        o.classList.remove("mcq-correct", "mcq-incorrect");
      });

      const chosenEl = options.find(o => o.dataset.option === chosen);

      if (chosen === answer) {
        correct += 1;
        if (chosenEl) chosenEl.classList.add("mcq-correct");
        if (feedback) {
          feedback.textContent = "Correct ✅";
          feedback.classList.remove("mcq-feedback--incorrect");
          feedback.classList.add("mcq-feedback--correct");
        }
      } else {
        if (chosenEl) chosenEl.classList.add("mcq-incorrect");
        if (feedback) {
          feedback.textContent = `Incorrect ❌ (correct answer: ${answer.toUpperCase()})`;
          feedback.classList.remove("mcq-feedback--correct");
          feedback.classList.add("mcq-feedback--incorrect");
        }
      }

    });

    summaryEl.textContent = `You got ${correct} / ${mcqs.length} correct.`;
  });

  // initial state
  updateButtonState();
});
