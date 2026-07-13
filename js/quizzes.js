// MCQ quizzes.
//
// Markup contract (per quiz):
//   <div class="mcq" data-answer="b" data-explanation="Optional, shown when correct.">
//     <ul><li data-option="a">...</li> ...</ul>
//     <button class="mcq-check">Check answer</button>   (per-question mode)
//     <p class="mcq-feedback"></p>
//   </div>
//
// Multi-answer questions use a comma list (data-answer="a,c"); an option with
// data-option="f" acts as an exclusive "none of the above".
//
// Pages may instead provide one #quiz-check-all button and a #quiz-summary
// element to grade every question at once.
//
// Selections and checked results persist in localStorage per page.
document.addEventListener("DOMContentLoaded", () => {
  const quizzes = Array.from(document.querySelectorAll(".mcq"));
  if (!quizzes.length) return;

  const checkAllBtn = document.getElementById("quiz-check-all");
  const summaryEl = document.getElementById("quiz-summary");

  const PAGE_KEY = "mcq:" + window.location.pathname;

  function loadSaved(index) {
    try {
      const raw = localStorage.getItem(`${PAGE_KEY}:${index}`);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function save(index, state) {
    try {
      localStorage.setItem(`${PAGE_KEY}:${index}`, JSON.stringify(state));
    } catch (e) {
      // storage full/blocked: quiz still works, just doesn't persist
    }
  }

  function normalize(answer) {
    if (!answer) return "";
    return answer
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .sort()
      .join(",");
  }

  const controllers = quizzes.map((quiz, index) => {
    const answer = quiz.dataset.answer || "";
    const explanation = quiz.dataset.explanation || "";
    const options = Array.from(quiz.querySelectorAll("li[data-option]"));
    const feedback = quiz.querySelector(".mcq-feedback");
    const button = quiz.querySelector(".mcq-check");
    const isMulti = answer.includes(",");

    let selected = new Set();
    let checked = false;

    function selection() {
      return Array.from(selected).sort().join(",");
    }

    function renderSelection() {
      options.forEach((o) =>
        o.classList.toggle("selected", selected.has(o.dataset.option))
      );
    }

    function clearGrading() {
      options.forEach((o) => o.classList.remove("mcq-correct", "mcq-incorrect"));
      if (feedback) {
        feedback.textContent = "";
        feedback.className = "mcq-feedback";
      }
    }

    function persist() {
      save(index, { sel: selection(), checked });
    }

    // revealAnswer: check-all pages show the correct letter on a miss;
    // per-question mode just says "try again"
    function grade(revealAnswer) {
      const isCorrect = normalize(selection()) === normalize(answer);
      checked = true;

      options.forEach((o) => {
        o.classList.remove("mcq-correct", "mcq-incorrect");
        if (selected.has(o.dataset.option)) {
          o.classList.add(isCorrect ? "mcq-correct" : "mcq-incorrect");
        }
      });

      if (feedback) {
        if (isCorrect) {
          feedback.textContent = explanation
            ? `✅ Correct! ${explanation}`
            : "✅ Correct!";
          feedback.className = "mcq-feedback mcq-feedback--correct";
        } else {
          feedback.textContent = revealAnswer
            ? `❌ Incorrect (correct answer: ${answer.toUpperCase()})`
            : "❌ Not quite. Try again.";
          feedback.className = "mcq-feedback mcq-feedback--incorrect";
        }
      }

      persist();
      return isCorrect;
    }

    function select(optVal) {
      if (isMulti) {
        // "f" = none of the above, mutually exclusive with everything else
        if (optVal === "f") {
          const turningOn = !selected.has("f");
          selected.clear();
          if (turningOn) selected.add("f");
        } else {
          selected.delete("f");
          if (selected.has(optVal)) {
            selected.delete(optVal);
          } else {
            selected.add(optVal);
          }
        }
      } else {
        selected.clear();
        selected.add(optVal);
      }

      // A changed answer invalidates the previous verdict
      checked = false;
      renderSelection();
      clearGrading();
      persist();

      if (checkAllBtn) updateCheckAllState();
    }

    options.forEach((opt) => {
      opt.addEventListener("click", () => select(opt.dataset.option));
    });

    if (button) {
      button.addEventListener("click", () => {
        if (!selected.size) {
          if (feedback) {
            feedback.textContent = "Please select an answer first.";
            feedback.className = "mcq-feedback mcq-feedback--warn";
          }
          return;
        }
        grade(false);
      });
    }

    // Restore persisted state
    const saved = loadSaved(index);
    if (saved && saved.sel) {
      saved.sel.split(",").filter(Boolean).forEach((v) => selected.add(v));
      renderSelection();
      if (saved.checked) grade(!!checkAllBtn);
    }

    return { selection, grade };
  });

  function updateCheckAllState() {
    if (!checkAllBtn) return;
    checkAllBtn.disabled = !controllers.every((c) => c.selection());
  }

  if (checkAllBtn) {
    checkAllBtn.addEventListener("click", () => {
      let correct = 0;
      controllers.forEach((c) => {
        if (c.grade(true)) correct += 1;
      });
      if (summaryEl) {
        summaryEl.textContent = `You got ${correct} / ${controllers.length} correct.`;
      }
    });
    updateCheckAllState();
  }
});
