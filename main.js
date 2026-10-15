/* ==========================================================================
   MAIN — small shared helpers used on every page
   ========================================================================== */
(function () {
  "use strict";

  /* Current year in the footer */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Copy-to-clipboard buttons: <button data-copy="text to copy"> */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var original = btn.textContent;
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function (ok) {
        btn.textContent = ok ? "Copied!" : "Press Ctrl+C";
        setTimeout(function () { btn.textContent = original; }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        // Fallback for older browsers / non-HTTPS
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        done(ok);
      }
    });
  });

  /* Resume download button: enabled once SITE_CONFIG.resumeUrl is set (js/config.js) */
  var resumeUrl = (window.SITE_CONFIG || {}).resumeUrl;
  if (resumeUrl) {
    document.querySelectorAll("[data-resume-link]").forEach(function (el) {
      var a = document.createElement("a");
      a.className = el.className;
      a.href = resumeUrl;
      a.setAttribute("download", "Saqibullah-Khan-Resume.pdf");
      a.innerHTML = '<span class="btn__label"><span data-text="Download resume">Download resume</span></span>' +
        '<span class="btn__icon" aria-hidden="true">↓</span>';
      el.replaceWith(a);
    });
  }

  /* Print button on the resume page: prints the resume sheet (see @media print) */
  document.querySelectorAll("[data-print]").forEach(function (btn) {
    btn.addEventListener("click", function () { window.print(); });
  });

  /* Back to top: scroll smoothly (or instantly with reduced motion) */
  document.querySelectorAll("[data-back-to-top]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  });
})();
