/* ==========================================================================
   ANIMATIONS & INTERACTIONS
   - Cursor-following grid glow + live x/y coordinates
   - Scroll progress bar
   - Scroll reveal (IntersectionObserver)
   - Hero headline word split
   - "$ build" terminal progress line
   - 3D tilt cards, magnetic buttons, portrait tilt
   - Mouse / scroll parallax for floating shapes
   - Timeline progress line
   - Seamless marquee
   Every effect checks prefers-reduced-motion and touch support.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var pointer = { x: window.innerWidth / 2, y: window.innerHeight / 3, nx: 0, ny: 0 };

  /* ---------- Cursor glow + coordinates ---------- */
  function initCursor() {
    var coords = document.querySelectorAll("[data-coords]");
    var pending = false;

    function pad(n) { return String(Math.max(0, Math.round(n))).padStart(3, "0").slice(-4); }

    function update() {
      root.style.setProperty("--mx", pointer.x + "px");
      root.style.setProperty("--my", pointer.y + "px");
      for (var i = 0; i < coords.length; i++) {
        coords[i].textContent = "x:" + pad(pointer.x) + " y:" + pad(pointer.y);
      }
      pending = false;
    }

    window.addEventListener("pointermove", function (e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = e.clientX / window.innerWidth * 2 - 1;  // -1 … 1
      pointer.ny = e.clientY / window.innerHeight * 2 - 1;
      if (!pending) { pending = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* ---------- Scroll progress ---------- */
  function initScrollProgress() {
    var bar = document.querySelector(".scroll-progress");
    if (!bar) return;
    var pending = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty("--progress", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
      pending = false;
    }
    window.addEventListener("scroll", function () {
      if (!pending) { pending = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    // Staggered children: add data-reveal-group to a parent
    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      var step = parseFloat(group.getAttribute("data-reveal-group")) || 0.08;
      Array.prototype.forEach.call(group.querySelectorAll("[data-reveal]"), function (el, i) {
        el.style.setProperty("--reveal-delay", (i * step).toFixed(2) + "s");
      });
    });

    var items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // Also reveal elements already above the viewport (e.g. after jumping with the End key)
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });

    // Safety net: on a busy main thread the observer can miss fast scrolls,
    // so anything that has reached the viewport is revealed on scroll too.
    var pending = false;
    window.addEventListener("scroll", function () {
      if (pending) return;
      pending = true;
      setTimeout(function () {
        pending = false;
        var vh = window.innerHeight;
        document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach(function (el) {
          if (el.getBoundingClientRect().top < vh) { el.classList.add("is-revealed"); io.unobserve(el); }
        });
      }, 150);
    }, { passive: true });
  }

  // Elements added later (e.g. project cards rendered by projects.js)
  window.revealNow = function (scope) {
    (scope || document).querySelectorAll("[data-reveal]:not(.is-revealed)").forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", (i * 0.08).toFixed(2) + "s");
      requestAnimationFrame(function () { el.classList.add("is-revealed"); });
    });
  };

  /* ---------- Split hero headline into words ---------- */
  function initSplit() {
    var index = 0;
    document.querySelectorAll("[data-split]").forEach(function (el) {
      var nodes = Array.prototype.slice.call(el.childNodes);
      el.textContent = "";
      nodes.forEach(function (node) {
        var text = node.textContent;
        var cls = node.nodeType === 1 ? node.className : "";
        text.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(" ")); return; }
          var span = document.createElement("span");
          span.className = "word" + (cls ? " " + cls : "");
          span.style.setProperty("--i", index++);
          span.textContent = part;
          el.appendChild(span);
        });
      });
    });
  }

  /* ---------- "$ build [██████████] 100%" ---------- */
  function initBuildLine() {
    document.querySelectorAll("[data-build]").forEach(function (el) {
      var bar = el.querySelector(".terminal-line__bar");
      var pct = el.querySelector(".terminal-line__pct");
      var cells = 10;
      function render(p) {
        var filled = Math.round(p / 100 * cells);
        bar.textContent = "[" + "█".repeat(filled) + "░".repeat(cells - filled) + "]";
        pct.textContent = p + "%";
      }
      if (reduceMotion) { render(100); return; }
      var p = 0;
      render(0);
      setTimeout(function tick() {
        p = Math.min(100, p + Math.ceil(Math.random() * 9));
        render(p);
        if (p < 100) setTimeout(tick, 40 + Math.random() * 90);
      }, 500);
    });
  }

  /* ---------- 3D tilt cards ---------- */
  function initTilt() {
    if (reduceMotion || !canHover) return;
    document.querySelectorAll("[data-tilt]").forEach(bindTilt);
  }
  function bindTilt(el) {
    if (el.dataset.tiltBound) return;
    el.dataset.tiltBound = "1";
    var max = parseFloat(el.getAttribute("data-tilt")) || 7;
    el.addEventListener("pointerenter", function () { el.classList.add("is-tilting"); });
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--tilt-y", ((px - 0.5) * max * 2).toFixed(2) + "deg");
      el.style.setProperty("--tilt-x", ((0.5 - py) * max * 2).toFixed(2) + "deg");
      el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
      el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
    });
    el.addEventListener("pointerleave", function () {
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
    });
  }
  window.bindTilt = function (scope) {
    if (reduceMotion || !canHover) return;
    (scope || document).querySelectorAll("[data-tilt]").forEach(bindTilt);
  };

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (reduceMotion || !canHover) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.getAttribute("data-magnetic")) || 0.25;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * strength;
        var y = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Portrait tilt follows the pointer across the page ---------- */
  /* ---------- Parallax shapes ([data-depth] → mouse, [data-speed] → scroll) ---------- */
  function initParallax() {
    if (reduceMotion) return;
    var frame = document.querySelector(".portrait__frame");
    var depthEls = Array.prototype.slice.call(document.querySelectorAll("[data-depth]"));
    var speedEls = Array.prototype.slice.call(document.querySelectorAll("[data-speed]"));
    if (!frame && !depthEls.length && !speedEls.length) return;

    var cur = { x: 0, y: 0 };
    var running = true;

    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(loop);
    });

    function loop() {
      if (!running) return;
      // ease towards the pointer for a smooth, weighty feel
      cur.x += (pointer.nx - cur.x) * 0.06;
      cur.y += (pointer.ny - cur.y) * 0.06;

      if (frame && canHover) {
        frame.style.setProperty("--ry", (cur.x * 10).toFixed(2) + "deg");
        frame.style.setProperty("--rx", (-cur.y * 8).toFixed(2) + "deg");
      }
      var sy = window.scrollY;
      for (var i = 0; i < depthEls.length; i++) {
        var d = parseFloat(depthEls[i].getAttribute("data-depth")) || 20;
        var s = parseFloat(depthEls[i].getAttribute("data-speed")) || 0;
        depthEls[i].style.transform = "translate3d(" + (cur.x * d).toFixed(1) + "px," + (cur.y * d + sy * s).toFixed(1) + "px,0)";
      }
      for (var j = 0; j < speedEls.length; j++) {
        if (speedEls[j].hasAttribute("data-depth")) continue;
        var sp = parseFloat(speedEls[j].getAttribute("data-speed")) || 0;
        speedEls[j].style.transform = "translate3d(0," + (sy * sp).toFixed(1) + "px,0)";
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ---------- Timeline line fills as you scroll ---------- */
  function initTimeline() {
    var lines = document.querySelectorAll(".timeline");
    if (!lines.length) return;
    function update() {
      var vh = window.innerHeight;
      lines.forEach(function (tl) {
        var prog = tl.querySelector(".timeline__progress");
        if (!prog) return;
        var r = tl.getBoundingClientRect();
        var p = (vh * 0.7 - r.top) / r.height;
        prog.style.setProperty("--line-progress", Math.max(0, Math.min(1, p)).toFixed(3));
      });
    }
    if (reduceMotion) {
      lines.forEach(function (tl) {
        var prog = tl.querySelector(".timeline__progress");
        if (prog) prog.style.setProperty("--line-progress", 1);
      });
      return;
    }
    window.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Marquee: duplicate content for a seamless loop ---------- */
  function initMarquee() {
    document.querySelectorAll(".marquee__track").forEach(function (track) {
      var items = Array.prototype.slice.call(track.children);
      items.forEach(function (item) {
        var clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });
    });
  }

  /* ---------- Init ---------- */
  initSplit();
  initCursor();
  initScrollProgress();
  initReveal();
  initBuildLine();
  initTilt();
  initMagnetic();
  initParallax();
  initTimeline();
  initMarquee();
})();
