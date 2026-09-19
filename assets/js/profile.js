/* ═══════════════════════════════════════════════════════════════════════════
   AL-MIHWAR / THE AXIS — page behaviour
   Bilingual EN/AR with true RTL mirroring · axis tick index · executive view
   · scroll reveals · live programme countdown.
   No dependencies. Degrades gracefully with JavaScript disabled.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  window.__profileReady = true;  // stands the inline blank-page fallback down

  var root = document.documentElement;
  var body = document.body;
  var KEY_LANG = "badi_profile_lang";
  var KEY_VIEW = "badi_profile_view";

  function store(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  function read(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1 · Language ──────────────────────────────────────────────────────── */
  var btnEn = document.getElementById("btn-en");
  var btnAr = document.getElementById("btn-ar");
  var sweep = document.getElementById("sweep");

  // Alt text and the skip target are the two strings CSS cannot swap.
  var imgs = Array.prototype.slice.call(document.querySelectorAll("img[data-alt-ar]"));
  imgs.forEach(function (img) { img.setAttribute("data-alt-en", img.getAttribute("alt") || ""); });

  function applyLang(lang) {
    root.setAttribute("lang", lang);
    // Keep the language in the URL so an Arabic reader can share what they read.
    try {
      var u = new URL(window.location.href);
      if (lang === "ar") u.searchParams.set("lang", "ar"); else u.searchParams.delete("lang");
      window.history.replaceState(null, "", u.pathname + (u.search || "") + u.hash);
    } catch (e) { /* file:// in some browsers */ }
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    imgs.forEach(function (img) {
      img.setAttribute("alt", img.getAttribute(lang === "ar" ? "data-alt-ar" : "data-alt-en") || "");
    });
    if (btnEn && btnAr) {
      btnEn.classList.toggle("on", lang === "en");
      btnAr.classList.toggle("on", lang === "ar");
      btnEn.setAttribute("aria-pressed", String(lang === "en"));
      btnAr.setAttribute("aria-pressed", String(lang === "ar"));
    }
  }

  // The axis sweeps across the viewport; the document turns over behind it.
  // `pending` holds the language the last click asked for, so a second click
  // mid-sweep wins instead of being overwritten by the first one's timer.
  var pending = null;
  var sweepTimers = [];

  function switchLang(lang) {
    if (root.getAttribute("lang") === lang && pending === null) return;
    pending = lang;
    store(KEY_LANG, lang);
    if (reduced || !sweep) { applyLang(lang); pending = null; return; }
    // Where the browser supports it, let it cross-fade the whole document —
    // the sweep stays as the fallback everywhere else.
    if (document.startViewTransition) {
      document.startViewTransition(function () { applyLang(lang); });
      pending = null;
      return;
    }
    sweepTimers.forEach(window.clearTimeout);
    sweepTimers.length = 0;
    sweep.classList.remove("run");
    void sweep.offsetWidth; // restart the animation
    sweep.classList.add("run");
    sweepTimers.push(window.setTimeout(function () { applyLang(pending); }, 300));
    sweepTimers.push(window.setTimeout(function () {
      sweep.classList.remove("run");
      applyLang(pending);
      pending = null;
    }, 720));
  }

  if (btnEn) btnEn.addEventListener("click", function () { switchLang("en"); });
  if (btnAr) btnAr.addEventListener("click", function () { switchLang("ar"); });

  /* ── 2 · Executive view ────────────────────────────────────────────────── */
  var btnExec = document.getElementById("btn-exec");
  var tickLinks = [];   // filled in by the axis index below; used by syncTicks()

  function applyView(mode) {
    var exec = mode === "exec";
    body.classList.toggle("exec", exec);
    if (btnExec) btnExec.setAttribute("aria-pressed", String(exec));
    if (exec) {
      Array.prototype.forEach.call(document.querySelectorAll("details.tech[open]"), function (d) { d.open = false; });
    }
    syncTicks();
  }

  // A tick pointing at a hidden section is a dead control; drop it instead.
  // Number by VISIBLE position, so the rail stays contiguous in Executive view
  // too — an index with gaps in it is the tell of a document edited down.
  function syncTicks() {
    var n = 0;
    tickLinks.forEach(function (t) {
      var sec = document.getElementById(t.id);
      var hidden = !!sec && sec.offsetParent === null;
      t.el.classList.toggle("gone", hidden);
      if (!hidden) { n += 1; t.el.textContent = (n < 10 ? "0" : "") + n; }
    });
  }

  if (btnExec) {
    btnExec.addEventListener("click", function () {
      var next = body.classList.contains("exec") ? "full" : "exec";
      applyView(next);
      store(KEY_VIEW, next);
    });
  }


  /* ── 3 · Axis tick index ───────────────────────────────────────────────── */
  // Read the order off the document rather than keeping a second copy of it:
  // the hand-maintained list drifted the moment a section moved.
  var SECTIONS = Array.prototype.map.call(
    document.querySelectorAll("main > section[id]"),
    function (el) { return el.id; }
  );
  var ticks = document.getElementById("ticks");

  if (ticks) {
    SECTIONS.forEach(function (id, i) {
      if (!document.getElementById(id)) return;
      var a = document.createElement("a");
      a.href = "#" + id;
      a.textContent = "";   // numbered by visible position in syncTicks()
      a.setAttribute("aria-label", id);
      ticks.appendChild(a);
      tickLinks.push({ el: a, id: id });
    });
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a"));

  function markActive(id) {
    tickLinks.forEach(function (t) { t.el.classList.toggle("on", t.id === id); });
    navLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + id); });
  }

  /* ── 4 · Scroll reveal + active section ────────────────────────────────── */
  var revealables = Array.prototype.slice.call(document.querySelectorAll(".rv"));

  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    revealables.forEach(function (el) { revealObs.observe(el); });

    var sectionEls = SECTIONS.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var activeObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) markActive(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sectionEls.forEach(function (el) { activeObs.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("in"); });
  }


  /* ── 5 · Reading position ───────────────────────────────────────────────
     The axis says WHICH section. Below 1400px it is not there at all, and even
     above it, an index is not a position. This is the position. */
  var progTicking = false;
  function paintProgress() {
    progTicking = false;
    var den = document.documentElement.scrollHeight - window.innerHeight;
    var p = den > 0 ? window.scrollY / den : 0;
    if (!(p >= 0)) p = 0;          // also catches NaN
    if (p > 1) p = 1;
    root.style.setProperty("--prog", p.toFixed(4));
  }
  function queueProgress() {
    if (progTicking) return;
    progTicking = true;
    window.requestAnimationFrame(paintProgress);
  }
  window.addEventListener("scroll", queueProgress, { passive: true });
  window.addEventListener("resize", queueProgress, { passive: true });
  paintProgress();

  /* ── 6 · Enlarging a plate ──────────────────────────────────────────────
     The screenshots are the argument. At 700px a MITRE matrix is a texture,
     so any plate opens at the resolution it was captured at. */
  var lb = document.getElementById("lb");
  if (lb && typeof lb.showModal === "function") {
    var lbImg = document.getElementById("lb-img");
    var lbBar = document.getElementById("lb-bar");
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest(".plate-open") : null;
      if (!a) return;
      e.preventDefault();
      var fig = a.closest("figure");
      var bar = fig ? fig.querySelector(".plate-bar") : null;
      lbBar.innerHTML = bar ? bar.innerHTML : "";
      lbImg.src = a.getAttribute("href");
      lbImg.alt = a.querySelector("img") ? a.querySelector("img").alt : "";
      lb.showModal();
    });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    var lbClose = document.getElementById("lb-close");
    if (lbClose) lbClose.addEventListener("click", function () { lb.close(); });
    lb.addEventListener("close", function () { lbImg.removeAttribute("src"); });
  }

  /* ── 7 · Boot ──────────────────────────────────────────────────────────── */
  var urlLang = null;
  try {
    var q = new URL(window.location.href).searchParams.get("lang");
    if (q === "ar" || q === "en") urlLang = q;
    else if (window.location.hash === "#ar") urlLang = "ar";
  } catch (e) { /* ignore */ }
  /* English by default, for everyone.
     The browser's language is deliberately not consulted: this link is sent to
     people, and it should open the same way for all of them. An explicit choice
     still wins — ?lang=ar in the URL, or the toggle, whose choice is stored. */
  var storedLang = read(KEY_LANG);
  applyLang(urlLang || (storedLang === "ar" || storedLang === "en" ? storedLang : "en"));
  applyView(read(KEY_VIEW) === "full" ? "full" : "exec");  // the CEO is the default reader

  syncTicks();

  // The hero is above the fold: reveal it immediately rather than on scroll.
  window.setTimeout(function () {
    Array.prototype.forEach.call(document.querySelectorAll(".hero .rv"), function (el, i) {
      window.setTimeout(function () { el.classList.add("in"); }, reduced ? 0 : i * 70);
    });
  }, 40);
})();
