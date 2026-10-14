(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Year
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Theme toggle
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var icon = document.getElementById("theme-icon");

  function paintIcon() {
    if (icon) icon.textContent = root.classList.contains("dark") ? "☀" : "☾";
  }
  paintIcon();

  if (toggle) {
    toggle.addEventListener("click", function () {
      var dark = root.classList.toggle("dark");
      try {
        localStorage.setItem("theme", dark ? "dark" : "light");
      } catch (e) {}
      paintIcon();
    });
  }

  // Intro cover
  var intro = document.getElementById("intro");
  if (root.classList.contains("intro") && intro) {
    intro.classList.add("is-live");
    var introDone = false;
    function endIntro() {
      if (introDone) return;
      introDone = true;
      intro.classList.add("is-leaving");
      setTimeout(function () {
        root.classList.remove("intro");
        intro.classList.remove("is-live", "is-leaving");
      }, 520);
      try {
        sessionStorage.setItem("intro-seen", "1");
      } catch (e) {}
    }
    if (reduced) {
      endIntro();
    } else {
      setTimeout(endIntro, 1100);
    }
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  // Scroll spy
  var links = Array.prototype.slice.call(document.querySelectorAll("nav.main-nav a[href^='#']"));
  var sections = links
    .map(function (l) {
      return document.querySelector(l.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (l) {
              l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }
})();
