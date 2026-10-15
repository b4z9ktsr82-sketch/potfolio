/* ==========================================================================
   NAVIGATION
   - Highlights the current page
   - Sliding indicator under the desktop nav links
   - Mobile menu (open / close / Escape / close on link click)
   - Header style on scroll
   - Smooth page-leave transition between internal pages
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var header = document.querySelector(".site-header");
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var links = nav ? Array.prototype.slice.call(nav.querySelectorAll(".nav__link")) : [];
  var indicator = nav ? nav.querySelector(".nav__indicator") : null;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobileQuery = window.matchMedia("(max-width: 1180px)");

  /* ---------- 1. Current page highlight ---------- */
  function currentFile() {
    var file = window.location.pathname.split("/").pop();
    return file === "" ? "index.html" : file;
  }

  // Pages that belong to a parent section in the menu
  var parentPage = { "project-details.html": "projects.html" };

  function markCurrent() {
    var file = currentFile();
    var target = parentPage[file] || file;
    links.forEach(function (link) {
      var hrefFile = (link.getAttribute("href") || "").split("#")[0].split("?")[0];
      if (hrefFile === target) {
        link.setAttribute("aria-current", "page");
      } else if (link.getAttribute("aria-current") === "page" && hrefFile !== target) {
        link.removeAttribute("aria-current");
      }
    });
  }

  /* ---------- 2. Sliding indicator (desktop only) ---------- */
  function moveIndicator(el) {
    if (!indicator || mobileQuery.matches) return;
    if (!el) {
      indicator.classList.remove("is-visible");
      return;
    }
    var navRect = nav.getBoundingClientRect();
    var rect = el.getBoundingClientRect();
    indicator.style.width = rect.width + "px";
    indicator.style.setProperty("--ind-x", rect.left - navRect.left + "px");
    indicator.classList.add("is-visible");
  }

  function activeLink() {
    return nav ? nav.querySelector('.nav__link[aria-current="page"]') : null;
  }

  function initIndicator() {
    if (!indicator) return;
    links.forEach(function (link) {
      link.addEventListener("mouseenter", function () { moveIndicator(link); });
      link.addEventListener("focus", function () { moveIndicator(link); });
    });
    nav.addEventListener("mouseleave", function () { moveIndicator(activeLink()); });
    nav.addEventListener("focusout", function (e) {
      if (!nav.contains(e.relatedTarget)) moveIndicator(activeLink());
    });
    // Wait for web fonts so the measurements are correct
    var place = function () { moveIndicator(activeLink()); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    place();
    window.addEventListener("resize", place);
  }

  /* ---------- 3. Mobile menu ---------- */
  function setMenu(open) {
    if (!toggle) return;
    body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      var first = nav.querySelector(".nav__link");
      if (first) setTimeout(function () { first.focus(); }, 300);
    }
  }

  function initMobileMenu() {
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      setMenu(!body.classList.contains("nav-open"));
    });

    // Close after choosing a link
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    // Escape closes the menu and returns focus to the toggle
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("nav-open")) {
        setMenu(false);
        toggle.focus();
      }
      // Keep keyboard focus inside the open menu
      if (e.key === "Tab" && body.classList.contains("nav-open")) {
        var focusables = [toggle].concat(Array.prototype.slice.call(nav.querySelectorAll("a")));
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Reset when resizing up to desktop
    var onChange = function (e) { if (!e.matches) setMenu(false); moveIndicator(activeLink()); };
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", onChange);
    else if (mobileQuery.addListener) mobileQuery.addListener(onChange);
  }

  /* ---------- 4. Header on scroll ---------- */
  function initHeaderScroll() {
    if (!header) return;
    var ticking = false;
    var update = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- 5. Page transitions ---------- */
  function isInternalPageLink(a, e) {
    if (!a || !a.href) return false;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.target && a.target !== "_self") return false;
    if (a.hasAttribute("download") || a.dataset.noTransition !== undefined) return false;
    if (a.protocol !== window.location.protocol || a.host !== window.location.host) return false;
    // Same page with only a hash change → let the browser scroll
    if (a.pathname === window.location.pathname && a.search === window.location.search) return false;
    // Only intercept links to HTML pages (not PDFs, images, …)
    var last = a.pathname.split("/").pop();
    return last === "" || /\.html?$/i.test(last);
  }

  function initPageTransitions() {
    if (reduceMotion) return;
    var overlay = document.createElement("div");
    overlay.className = "page-transition";
    overlay.setAttribute("aria-hidden", "true");
    body.appendChild(overlay);

    document.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!isInternalPageLink(a, e)) return;
      e.preventDefault();
      var href = a.href;
      overlay.classList.add("is-active");
      // Navigate even if the transition event never fires
      setTimeout(function () { window.location.href = href; }, 420);
    });

    // Coming back with the browser's back button (bfcache) → hide overlay
    window.addEventListener("pageshow", function () {
      overlay.classList.remove("is-active");
    });
  }

  /* ---------- Init ---------- */
  root.classList.remove("no-js");
  root.classList.add("js");
  markCurrent();
  initIndicator();
  initMobileMenu();
  initHeaderScroll();
  initPageTransitions();
})();
