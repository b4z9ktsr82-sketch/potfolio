/* ==========================================================================
   CONTACT FORM
   - Front-end validation with clear, accessible error messages
   - If SITE_CONFIG.formEndpoint is set (js/config.js), the form is sent there
     as JSON and success is shown ONLY when the service confirms it.
   - If no endpoint is configured, nothing is sent. The visitor is told so and
     offered a mailto: fallback that opens their own email app.
   ========================================================================== */
(function () {
  "use strict";

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  var config = window.SITE_CONFIG || {};
  var status = form.querySelector("[data-form-status]");
  var submitBtn = form.querySelector('[type="submit"]');
  var submitted = false;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Validation rules for each field (by name attribute)
  var rules = {
    name: function (v) {
      if (!v) return "Please enter your name.";
      if (v.length < 2) return "Your name should be at least 2 characters.";
      return "";
    },
    email: function (v) {
      if (!v) return "Please enter your email address.";
      if (!EMAIL_RE.test(v)) return "Please enter a valid email address (e.g. name@example.com).";
      return "";
    },
    subject: function (v) {
      if (!v) return "Please add a subject.";
      if (v.length < 3) return "The subject should be at least 3 characters.";
      return "";
    },
    message: function (v) {
      if (!v) return "Please write a message.";
      if (v.length < 20) return "Your message should be at least 20 characters (" + v.length + "/20).";
      if (v.length > 2000) return "Your message is too long (max 2000 characters).";
      return "";
    }
  };

  function fieldOf(input) { return input.closest(".field"); }

  function validateField(input) {
    var rule = rules[input.name];
    if (!rule) return true;
    var msg = rule(input.value.trim());
    var field = fieldOf(input);
    var errorEl = field.querySelector(".field__error");
    field.classList.toggle("is-invalid", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (errorEl) errorEl.textContent = msg;
    return !msg;
  }

  function validateAll() {
    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (input && !validateField(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  // Live feedback: validate on blur, and while typing after the first submit
  Object.keys(rules).forEach(function (name) {
    var input = form.elements[name];
    if (!input) return;
    input.addEventListener("blur", function () { if (input.value.trim() || submitted) validateField(input); });
    input.addEventListener("input", function () {
      if (submitted || fieldOf(input).classList.contains("is-invalid")) validateField(input);
    });
  });

  // Character counter for the message
  var msgInput = form.elements.message;
  var counter = form.querySelector("[data-char-count]");
  if (msgInput && counter) {
    var updateCount = function () { counter.textContent = msgInput.value.length + " / 2000"; };
    msgInput.addEventListener("input", updateCount);
    updateCount();
  }

  /* ---------- Status messages ---------- */
  function showStatus(type, html) {
    status.className = "form-status form-status--" + type + " is-visible";
    status.innerHTML = html;
    status.setAttribute("tabindex", "-1");
    status.focus({ preventScroll: true });
    status.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function clearStatus() {
    status.className = "form-status";
    status.innerHTML = "";
  }

  function data() {
    return {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      subject: form.elements.subject.value.trim(),
      message: form.elements.message.value.trim()
    };
  }

  function mailtoLink(d) {
    var body = d.message + "\n\n— " + d.name + " (" + d.email + ")";
    return "mailto:" + (config.email || "") +
      "?subject=" + encodeURIComponent(d.subject) +
      "&body=" + encodeURIComponent(body);
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.classList.toggle("is-loading", on);
    submitBtn.setAttribute("aria-busy", String(on));
  }

  /* ---------- Submit ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    submitted = true;
    clearStatus();

    // Honeypot: real people never fill this hidden field
    if (form.elements.website && form.elements.website.value) return;

    if (!validateAll()) {
      showStatus("error", "<strong>Please check the form.</strong><span>Some fields need your attention — see the messages below each field.</span>");
      return;
    }

    var d = data();

    // No form service connected → be honest and offer the mailto fallback
    if (!config.formEndpoint) {
      showStatus("info",
        "<strong>This form is not connected to a sending service yet, so your message has not been sent.</strong>" +
        "<span>You can send it with your own email app instead — your text will be filled in for you.</span>" +
        '<div class="btn-row">' +
          '<a class="btn btn--primary btn--sm" href="' + mailtoLink(d).replace(/"/g, "&quot;") + '"><span class="btn__label"><span data-text="Open email app">Open email app</span></span><span class="btn__icon" aria-hidden="true">↗</span></a>' +
        "</div>");
      return;
    }

    // Send to the configured form service
    setLoading(true);
    fetch(config.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(d)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Server responded with " + res.status);
        showStatus("success", "<strong>Thank you — your message has been sent.</strong><span>I will get back to you as soon as possible.</span>");
        form.reset();
        submitted = false;
        if (counter) counter.textContent = "0 / 2000";
        form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("is-invalid"); });
      })
      .catch(function () {
        showStatus("error",
          "<strong>Sorry, your message could not be sent.</strong>" +
          "<span>Please try again in a moment, or email me directly.</span>" +
          '<div class="btn-row"><a class="btn btn--ghost btn--sm" href="' + mailtoLink(d).replace(/"/g, "&quot;") + '"><span class="btn__label"><span data-text="Email instead">Email instead</span></span><span class="btn__icon" aria-hidden="true">↗</span></a></div>');
      })
      .then(function () { setLoading(false); });
  });
})();
