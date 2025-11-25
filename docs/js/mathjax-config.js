window.MathJax = {
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"]
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"]
    ]
  },
  options: {
    // Process math in elements with either:
    //  - class="arithmatex"    (added by pymdownx.arithmatex for Markdown)
    //  - class="mathjax_process" (we'll use this in raw HTML, e.g. quiz options)
    processHtmlClass: "arithmatex|mathjax_process",
    // Ignore everything else
    ignoreHtmlClass: ".*"
  }
};
