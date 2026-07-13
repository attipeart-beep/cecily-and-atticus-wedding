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

  /* ---- RSVP form (Netlify Forms) ---- */
  var form = document.getElementById("rsvp-form");
  if (form) {
    var more = document.getElementById("rsvp-more");
    var guest2Fields = document.getElementById("guest2-fields");
    var attendingExtra = document.getElementById("attending-extra");
    var g1Diet = document.getElementById("g1-diet");
    var g2Diet = document.getElementById("g2-diet");

    // Google Apps Script web app that logs each RSVP to the Sheet and emails
    // us. The site posts here directly (more reliable than Netlify's webhook).
    var TRACKER_URL = "https://script.google.com/macros/s/AKfycby0NPNHU4u3JCrP84qbdv7dZ32doRrtfupma657A_Rq-pY7w65Md0gnixElOhFKO_h0/exec";

    function picked(name) {
      var r = form.querySelector('input[name="' + name + '"]:checked');
      return r ? r.value : null;
    }

    function updateForm() {
      // Reveal the rest only once Guest 1 has answered the attendance question.
      if (more) more.hidden = !picked("guest_1_attending");

      // Guest 1's dietary question appears only if they're attending.
      var g1Attending = picked("guest_1_attending") === "Joyfully Accept";
      if (g1Diet) g1Diet.hidden = !g1Attending;

      // Second-guest fields appear only if the guest is responding for two.
      var showG2 = picked("has_guest_2") === "Yes";
      if (guest2Fields) guest2Fields.hidden = !showG2;
      // Only the name/email are required for a second guest — NOT the dietary
      // field (which lives in the same block and can be hidden when declining).
      form.querySelectorAll('input[name="guest_2_name"], input[name="guest_2_email"]')
        .forEach(function (i) { i.required = showG2; });
      form.querySelectorAll('input[name="guest_2_attending"]').forEach(function (i) { i.required = showG2; });

      // Guest 2's dietary question appears only if they're attending.
      var g2Attending = showG2 && picked("guest_2_attending") === "Joyfully Accept";
      if (g2Diet) g2Diet.hidden = !g2Attending;

      // Accommodation is a shared catch-all — shown if at least one guest is attending.
      var anyAttending = g1Attending || g2Attending;
      if (attendingExtra) attendingExtra.hidden = !anyAttending;
      form.querySelectorAll('input[name="accommodation"]').forEach(function (i) { i.required = anyAttending; });
    }

    form.querySelectorAll('input[name="guest_1_attending"], input[name="has_guest_2"], input[name="guest_2_attending"]')
      .forEach(function (r) { r.addEventListener("change", updateForm); });
    updateForm();

    function firstName(full) {
      return (full || "").trim().split(/\s+/)[0] || "";
    }

    // Build "New RSVP from Jane" or "...Jane & John" from whoever is being
    // responded for, and store it in the hidden "subject" field. Netlify uses
    // a field named "subject" as the notification email's subject line.
    function setSubject() {
      var names = [];
      var g1 = form.querySelector('[name="guest_1_name"]');
      var n1 = firstName(g1 ? g1.value : "");
      if (n1) names.push(n1);
      if (picked("has_guest_2") === "Yes") {
        var g2 = form.querySelector('[name="guest_2_name"]');
        var n2 = firstName(g2 ? g2.value : "");
        if (n2) names.push(n2);
      }
      var field = document.getElementById("rsvp-subject");
      if (field) {
        field.value = names.length ? "New RSVP from " + names.join(" & ") : "New RSVP";
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending…";

      setSubject();

      // Local demo mode: when previewing off a real host (file:// or
      // localhost) there is no Netlify backend, so just show success.
      var host = location.hostname;
      var isLocal = host === "" || host === "localhost" || host === "127.0.0.1";
      if (isLocal) {
        showSuccess();
        return;
      }

      var fd = new FormData(form);

      // Send a copy straight to the Google tracker (Sheet + email). This is
      // fire-and-forget: "no-cors" means we can't read the reply, but Apps
      // Script still receives it and runs. Sending JSON as text/plain keeps it
      // a "simple" request so the browser doesn't block it.
      if (TRACKER_URL) {
        var payload = {};
        fd.forEach(function (v, k) { payload[k] = v; });
        try {
          fetch(TRACKER_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
          }).catch(function () {});
        } catch (err) { /* ignore — tracker is best-effort */ }
      }

      // Also record the submission in Netlify (URL-encoded, includes form-name).
      var body = new URLSearchParams(fd).toString();

      fetch(form.getAttribute("action") || "/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
      })
        .then(function (res) {
          if (res.ok) { showSuccess(); }
          else { throw new Error("Bad response"); }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = original;
          alert("Sorry — something went wrong sending your RSVP. Please try again, or email us directly at cecandatti@gmail.com.");
        });
    });

    function valOf(name) {
      var el = form.querySelector('[name="' + name + '"]');
      return el ? el.value : "";
    }

    function showSuccess() {
      var success = document.getElementById("rsvp-success");
      var msgEl = document.getElementById("success-message");
      var ctaEl = document.getElementById("success-cta");

      var hasG2 = picked("has_guest_2") === "Yes";
      var n1 = firstName(valOf("guest_1_name"));
      var n2 = hasG2 ? firstName(valOf("guest_2_name")) : "";
      var g1acc = picked("guest_1_attending") === "Joyfully Accept";
      var g2acc = hasG2 && picked("guest_2_attending") === "Joyfully Accept";
      var anyAttending = g1acc || g2acc;
      var namesStr = [n1, n2].filter(Boolean).join(" & ");

      var ack = "Your RSVP has been received. ";
      var msg;
      if (anyAttending && g1acc && (!hasG2 || g2acc)) {
        // Everyone responding is coming.
        msg = ack + (namesStr ? namesStr + ", we" : "We") +
          " can’t wait to celebrate with you!";
        if (ctaEl) ctaEl.style.display = "";
      } else if (!anyAttending) {
        // Everyone responding has declined.
        msg = ack + (namesStr ? namesStr + ", we’re" : "We’re") +
          " so sorry you can’t be with us, and you’ll be very much missed.";
        if (ctaEl) ctaEl.style.display = "none";
      } else {
        // Mixed: one of a pair accepts, the other declines.
        var accepter = g1acc ? n1 : n2;
        var decliner = g1acc ? n2 : n1;
        msg = ack + (accepter || "You") +
          ", we can’t wait to celebrate with you, and we’ll miss " +
          (decliner || "your guest") + ".";
        if (ctaEl) ctaEl.style.display = "";
      }
      if (msgEl) msgEl.textContent = msg;

      form.style.display = "none";
      if (success) {
        success.style.display = "block";
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  /* ---- Grounds map lightbox ---- */
  var mapLink = document.querySelector(".grounds-map a");
  if (mapLink) {
    var lb = document.createElement("div");
    lb.className = "map-lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-label", "Map of the grounds");
    lb.innerHTML =
      '<button type="button" class="map-lightbox-close" aria-label="Close map">&times;</button>' +
      '<img alt="Map of the grounds at Babington House" />' +
      '<p class="map-lightbox-hint">Tap outside the map to close</p>';
    var lbImg = lb.querySelector("img");
    document.body.appendChild(lb);

    function openLightbox(e) {
      e.preventDefault();
      if (!lbImg.getAttribute("src")) {
        lbImg.src = mapLink.getAttribute("href");
      }
      lb.classList.add("open");
      document.body.classList.add("lightbox-open");
    }
    function closeLightbox() {
      lb.classList.remove("open");
      document.body.classList.remove("lightbox-open");
    }

    mapLink.addEventListener("click", openLightbox);
    // Close on anything except the image itself (so pinch/double-tap zoom still works).
    lb.addEventListener("click", function (e) {
      if (e.target !== lbImg) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("open")) closeLightbox();
    });
  }
})();
