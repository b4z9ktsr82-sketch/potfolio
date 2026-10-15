/* ==========================================================================
   PROJECTS — DATA + RENDERING
   --------------------------------------------------------------------------
   HOW TO ADD A PROJECT
   1. Copy the commented TEMPLATE below, paste it inside the PROJECTS array
      (between [ and ]) and remove the comment markers around it.
   2. Fill in every field. Separate multiple projects with a comma:  }, {
      - The Projects page lists every project automatically.
      - The Home page shows every project with featured: true.
      - The details page is opened with:  project-details.html?id=YOUR-ID
   3. Put screenshots in assets/images/ and reference them with relative paths.
   4. Leave liveUrl / sourceUrl as "" if you have no link yet — the button
      shows as "— soon" instead of linking nowhere.
   While the array is empty, the site shows a "projects coming soon" message.
   ========================================================================== */
var PROJECTS = [
  /* TEMPLATE — copy, uncomment and fill in:
  {
    id: "my-project",                  // used in the URL — letters, numbers, dashes only
    featured: true,
    title: "Project name",
    category: "Website",
    year: "2026",
    status: "Completed",              // or "In progress"
    role: "Solo developer",
    duration: "2 weeks",
    summary: "One or two sentences describing what the project is and who it is for.",
    cover: "assets/images/project-placeholder.jpg",
    coverAlt: "Describe the project's main screenshot",
    tech: ["HTML5", "CSS3", "Bootstrap"],

    // Case-study content (project-details.html)
    overview: "What it does, why you built it and its main goal.",
    problem: "The problem it solves and for whom.",
    approach: "How you planned and built it, and why you made those choices.",
    features: ["Feature 1", "Feature 2", "Feature 3"],
    contributions: ["What you built", "A challenge you solved and how"],
    learnings: "What you learned, or what you would improve next time.",
    screenshots: [
      { src: "assets/images/screenshot-placeholder-1.jpg", alt: "Describe screenshot 1", caption: "Caption 1" }
    ],
    liveUrl: "",                      // e.g. "https://my-project.codewithsaqib.com"
    sourceUrl: ""                     // e.g. "https://github.com/b4z9ktsr82-sketch/my-project"
  }
  */
];

/* ---------------- Rendering (no need to edit below this line) ---------------- */
(function () {
  "use strict";

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function detailsUrl(p) { return "project-details.html?id=" + encodeURIComponent(p.id); }

  function tags(list) {
    return '<ul class="tag-list" aria-label="Technologies">' +
      list.map(function (t) { return '<li class="tag">' + esc(t) + "</li>"; }).join("") + "</ul>";
  }

  // Rolling-label button markup shared by all buttons
  function btn(label, href, variant, icon, external) {
    var inner = '<span class="btn__label"><span data-text="' + esc(label) + '">' + esc(label) + '</span></span>' +
      '<span class="btn__icon" aria-hidden="true">' + (icon || "↗") + "</span>";
    if (!href) {
      return '<span class="btn ' + variant + '" aria-disabled="true" title="Link not added yet">' +
        '<span class="btn__label"><span data-text="' + esc(label) + ' — soon">' + esc(label) + ' — soon</span></span></span>';
    }
    return '<a class="btn ' + variant + '" href="' + esc(href) + '"' +
      (external ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + inner + "</a>";
  }

  function card(p, featured) {
    return '' +
      '<article class="project-card' + (featured ? " project-card--featured" : "") + '" data-reveal data-tilt="4">' +
        '<div class="project-card__media">' +
          (p.featured ? '<span class="project-card__badge">Featured</span>' : "") +
          '<img src="' + esc(p.cover) + '" alt="' + esc(p.coverAlt) + '" width="1200" height="750" loading="lazy" decoding="async">' +
        "</div>" +
        '<div class="project-card__body">' +
          '<div class="project-card__meta"><span>' + esc(p.category) + "</span><span>" + esc(p.year) + "</span></div>" +
          '<h3 class="project-card__title"><a href="' + detailsUrl(p) + '">' + esc(p.title) + "</a></h3>" +
          '<p class="project-card__text">' + esc(p.summary) + "</p>" +
          tags(p.tech) +
          '<div class="project-card__footer">' +
            '<a class="link" href="' + detailsUrl(p) + '">Read case study <span aria-hidden="true">→</span></a>' +
            (p.liveUrl ? '<a class="link" href="' + esc(p.liveUrl) + '" target="_blank" rel="noopener noreferrer">Live demo <span aria-hidden="true">↗</span></a>' : "") +
          "</div>" +
        "</div>" +
      "</article>";
  }

  function soonCard() {
    return '' +
      '<div class="project-card project-card--soon" data-reveal>' +
        "<div>" +
          '<span class="eyebrow">Next up</span>' +
          '<h3 class="h3">More projects are on the way</h3>' +
          '<p class="muted">New work will be added here as it is completed.</p>' +
        "</div>" +
      "</div>";
  }

  function emptyState() {
    return '' +
      '<div class="project-card project-card--soon project-card--empty" data-reveal>' +
        "<div>" +
          '<span class="eyebrow">Projects in progress</span>' +
          '<h3 class="h3">First projects coming soon</h3>' +
          '<p class="muted">I&#39;m building projects that turn what I learn into real work. ' +
          "They&#39;ll appear here with live demos and source code.</p>" +
          '<p class="mt-s"><a class="link" href="skills.html#learning">See what I&#39;m learning <span aria-hidden="true">→</span></a></p>' +
        "</div>" +
      "</div>";
  }

  function after(scope) {
    if (window.bindTilt) window.bindTilt(scope);
    if (window.revealNow) window.revealNow(scope);
  }

  /* Home page: featured project(s) */
  function renderFeatured(el) {
    if (!PROJECTS.length) { el.innerHTML = emptyState(); after(el); return; }
    var list = PROJECTS.filter(function (p) { return p.featured; });
    if (!list.length) list = PROJECTS.slice(0, 1);
    el.innerHTML = list.map(function (p, i) { return card(p, i === 0 && list.length === 1); }).join("");
    after(el);
  }

  /* Projects page: all projects + optional category filter */
  function renderGrid(el) {
    var filterBar = document.querySelector("[data-project-filters]");
    var categories = [];
    PROJECTS.forEach(function (p) { if (categories.indexOf(p.category) === -1) categories.push(p.category); });

    if (!PROJECTS.length) {
      if (filterBar) filterBar.remove();
      el.innerHTML = emptyState();
      after(el);
      return;
    }

    function draw(cat) {
      var list = PROJECTS.filter(function (p) { return !cat || p.category === cat; });
      var single = PROJECTS.length === 1;
      el.innerHTML = list.map(function (p) { return card(p, single); }).join("") + soonCard();
      after(el);
    }

    // Filters only make sense with more than one category
    if (filterBar && categories.length > 1) {
      filterBar.innerHTML = ['<button class="filter-btn is-active" type="button" data-cat="">All</button>']
        .concat(categories.map(function (c) {
          return '<button class="filter-btn" type="button" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
        })).join("");
      filterBar.addEventListener("click", function (e) {
        var b = e.target.closest(".filter-btn");
        if (!b) return;
        filterBar.querySelectorAll(".filter-btn").forEach(function (x) { x.classList.toggle("is-active", x === b); });
        draw(b.getAttribute("data-cat"));
      });
    } else if (filterBar) {
      filterBar.remove();
    }
    draw("");
  }

  /* Details page */
  function renderDetail(el) {
    var id = new URLSearchParams(window.location.search).get("id");
    var index = 0;
    if (id) {
      index = PROJECTS.findIndex(function (p) { return p.id === id; });
    }
    var p = PROJECTS[index];

    if (!p) {
      el.innerHTML = '' +
        '<section class="page-hero"><div class="container page-hero__inner">' +
          crumbs("Not found") +
          '<span class="eyebrow">Error</span>' +
          '<h1 class="page-hero__title">Project not found</h1>' +
          '<p class="lead">The project you are looking for does not exist or has been moved.</p>' +
          '<div class="btn-row">' + btn("All projects", "projects.html", "btn--primary", "→") + "</div>" +
        "</div></section>";
      return;
    }

    document.title = p.title + " — Case Study | Saqibullah Khan";
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", p.summary);

    var prev = PROJECTS[index - 1];
    var next = PROJECTS[index + 1];

    el.innerHTML = '' +
      '<header class="page-hero page-hero--case">' +
        '<div class="container">' +
          '<div class="page-hero__inner">' +
            crumbs(p.title) +
            '<span class="eyebrow">Case study · ' + esc(p.category) + "</span>" +
            '<h1 class="page-hero__title">' + esc(p.title) + "</h1>" +
            '<p class="lead">' + esc(p.summary) + "</p>" +
            '<div class="btn-row">' +
              btn("Live demo", p.liveUrl, "btn--primary", "↗", true) +
              btn("Source code", p.sourceUrl, "btn--ghost", "↗", true) +
            "</div>" +
          "</div>" +
          '<figure class="case-hero__media" data-reveal="zoom">' +
            '<img src="' + esc(p.cover) + '" alt="' + esc(p.coverAlt) + '" width="1600" height="900">' +
          "</figure>" +
        "</div>" +
      "</header>" +
      '<section class="section section--tight">' +
        '<div class="container case-layout">' +
          "<div>" +
            block("01", "Overview", "<p>" + esc(p.overview) + "</p>") +
            block("02", "The problem", "<p>" + esc(p.problem) + "</p>") +
            block("03", "Approach", "<p>" + esc(p.approach) + "</p>") +
            block("04", "Main features", '<ul class="check-list">' + p.features.map(li).join("") + "</ul>") +
            block("05", "My role & contributions", '<ul class="check-list">' + p.contributions.map(li).join("") + "</ul>") +
            block("06", "Screenshots",
              '<div class="gallery">' + p.screenshots.map(function (s) {
                return '<figure><img src="' + esc(s.src) + '" alt="' + esc(s.alt) + '" width="1200" height="750" loading="lazy" decoding="async"><figcaption>' + esc(s.caption) + "</figcaption></figure>";
              }).join("") + "</div>") +
            block("07", "What I learned", "<p>" + esc(p.learnings) + "</p>") +
            '<nav class="case-nav" aria-label="More projects">' +
              (prev ? '<a class="link" href="' + detailsUrl(prev) + '">← ' + esc(prev.title) + "</a>" : '<a class="link" href="projects.html">← All projects</a>') +
              (next ? '<a class="link" href="' + detailsUrl(next) + '">' + esc(next.title) + " →</a>" : '<a class="link" href="contact.html">Discuss a project →</a>') +
            "</nav>" +
          "</div>" +
          '<aside class="case-aside">' +
            '<div class="card" data-reveal>' +
              '<h2 class="footer__title">Project info</h2>' +
              '<ul class="info-list">' +
                "<li><span>Role</span><span>" + esc(p.role) + "</span></li>" +
                "<li><span>Year</span><span>" + esc(p.year) + "</span></li>" +
                "<li><span>Duration</span><span>" + esc(p.duration) + "</span></li>" +
                "<li><span>Status</span><span>" + esc(p.status) + "</span></li>" +
              "</ul>" +
            "</div>" +
            '<div class="card" data-reveal>' +
              '<h2 class="footer__title">Technologies</h2>' + tags(p.tech) +
            "</div>" +
          "</aside>" +
        "</div>" +
      "</section>";

    after(el);
  }

  function crumbs(current) {
    return '<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>' +
      '<li><a href="index.html">Home</a></li>' +
      '<li><a href="projects.html">Projects</a></li>' +
      '<li><span aria-current="page">' + esc(current) + "</span></li></ol></nav>";
  }

  function li(t) { return "<li>" + esc(t) + "</li>"; }

  function block(num, title, html) {
    return '<section class="case-block prose" data-reveal>' +
      '<span class="eyebrow">' + num + "</span>" +
      '<h2 class="h2 mt-s">' + esc(title) + "</h2>" + html + "</section>";
  }

  var featured = document.querySelector("[data-featured-project]");
  var grid = document.querySelector("[data-projects-grid]");
  var detail = document.querySelector("[data-project-detail]");
  if (featured) renderFeatured(featured);
  if (grid) renderGrid(grid);
  if (detail) renderDetail(detail);
})();
