/* Cecily & Atticus — shared behaviour */
(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") nav.classList.remove("open");
    });
  }

  /* ---- Highlight active nav link ---- */
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach(function (a) {
    if (a.getAttribute("href") === here) a.classList.add("active");
  });

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Countdown to the wedding ---- */
  var cd = document.getElementById("countdown");
  if (cd) {
    var target = new Date("2026-12-10T16:00:00").getTime();
    var fields = {
      days:    cd.querySelector('[data-unit="days"]'),
      hours:   cd.querySelector('[data-unit="hours"]'),
      minutes: cd.querySelector('[data-unit="minutes"]')
    };
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        cd.innerHTML = '<p class="script" style="font-size:2.4rem;color:var(--cream)">Today is the day!</p>';
        return;
      }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      if (fields.days)    fields.days.textContent = d;
      if (fields.hours)   fields.hours.textContent = h;
      if (fields.minutes) fields.minutes.textContent = m;
    }
    tick();
    setInterval(tick, 60000);
  }

  /* ---- RSVP form (Formspree) ---- */
  var form = document.getElementById("rsvp-form");
  if (form) {
    var more = document.getElementById("rsvp-more");
    var guest2Fields = document.getElementById("guest2-fields");
    var attendingExtra = document.getElementById("attending-extra");

    function picked(name) {
      var r = form.querySelector('input[name="' + name + '"]:checked');
      return r ? r.value : null;
    }

    function updateForm() {
      // Reveal the rest only once Guest 1 has answered the attendance question.
      if (more) more.hidden = !picked("guest_1_attending");

      // Second-guest fields appear only if the guest is responding for two.
      var showG2 = picked("has_guest_2") === "Yes";
      if (guest2Fields) guest2Fields.hidden = !showG2;
      form.querySelectorAll('#guest2-fields input[type="text"], #guest2-fields input[type="email"]')
        .forEach(function (i) { i.required = showG2; });
      form.querySelectorAll('input[name="guest_2_attending"]').forEach(function (i) { i.required = showG2; });

      // Accommodation + dietary only matter if at least one guest is attending.
      var anyAttending = picked("guest_1_attending") === "Joyfully Accept" ||
                         (showG2 && picked("guest_2_attending") === "Joyfully Accept");
      if (attendingExtra) attendingExtra.hidden = !anyAttending;
      form.querySelectorAll('input[name="accommodation"]').forEach(function (i) { i.required = anyAttending; });
    }

    form.querySelectorAll('input[name="guest_1_attending"], input[name="has_guest_2"], input[name="guest_2_attending"]')
      .forEach(function (r) { r.addEventListener("change", updateForm); });
    updateForm();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var endpoint = form.getAttribute("action");
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending…";

      // If the Formspree endpoint hasn't been configured yet, just show success (demo).
      if (!endpoint || endpoint.indexOf("YOUR_FORM_ID") !== -1) {
        showSuccess();
        return;
      }

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) { showSuccess(); }
          else { throw new Error("Bad response"); }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = original;
          alert("Sorry — something went wrong sending your RSVP. Please try again, or email us directly.");
        });
    });

    function showSuccess() {
      var success = document.getElementById("rsvp-success");
      form.style.display = "none";
      if (success) {
        success.style.display = "block";
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }
})();
