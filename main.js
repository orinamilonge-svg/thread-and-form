/* Thread & Form — site script */

/* ================= SITE SETTINGS — edit these two lines =================
   whatsappNumber: digits only, country code first, no "+" or spaces.
                   Example format: 234XXXXXXXXXX (Nigeria = 234).
   instagramUrl:   the full profile address, starting with https://
   Until real values are entered, every WhatsApp and Instagram button shows
   a "not set up yet" notice instead of opening a link.                     */
const SITE_CONFIG = {
  whatsappNumber: "2348132471870",                              // 0813 247 1870 in international format
  instagramUrl: "https://www.instagram.com/orinamipriscillia/"
};
/* ======================================================================= */

(function () {
  "use strict";

  const waDigits = String(SITE_CONFIG.whatsappNumber).replace(/[\s+()-]/g, "");
  const WA_READY = /^\d{8,15}$/.test(waDigits);
  const IG_READY = /^https:\/\/(www\.)?instagram\.com\/[^\s]+$/i.test(SITE_CONFIG.instagramUrl);

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Mobile navigation ---------- */
  const toggle = document.querySelector(".menu-toggle");
  const panel = document.getElementById("mobile-menu");
  if (toggle && panel) {
    const setOpen = open => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
      panel.hidden = !open;
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    panel.addEventListener("click", e => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setOpen(false); toggle.focus(); }
    });
    window.matchMedia("(min-width: 1100px)").addEventListener("change", e => { if (e.matches) setOpen(false); });
  }

  /* ---------- Placeholder notice dialog ---------- */
  const dialog = document.getElementById("notice");
  const dTitle = document.getElementById("notice-title");
  const dText = document.getElementById("notice-text");
  const dQuote = document.getElementById("notice-message");
  const dCopy = document.getElementById("notice-copy");
  const dStatus = document.getElementById("notice-status");
  let lastTrigger = null;

  function openNotice(title, text, message) {
    if (!dialog) return;
    dTitle.textContent = title;
    dText.textContent = text;
    dQuote.hidden = !message;
    dCopy.hidden = !message;
    dQuote.textContent = message || "";
    dStatus.textContent = "";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }
  if (dialog) {
    dialog.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => dialog.close()));
    dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => { if (lastTrigger) lastTrigger.focus(); });
    dCopy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(dQuote.textContent);
        dStatus.textContent = "Message copied.";
      } catch (err) {
        const range = document.createRange();
        range.selectNodeContents(dQuote);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        dStatus.textContent = "Copying is blocked here. The message is selected, so you can copy it yourself.";
      }
    });
  }

  /* ---------- WhatsApp enquiries ---------- */
  function waMessage(el) {
    const name = el.dataset.product;
    const price = el.dataset.price;
    if (name) {
      return `Hello Thread & Form, I'd like to enquire about ${name}${price ? " (" + price + ")" : ""}. Could you share availability and sizing?`;
    }
    return "Hello Thread & Form, I'd like to make an enquiry.";
  }

  document.querySelectorAll("[data-whatsapp]").forEach(el => {
    const message = waMessage(el);
    if (WA_READY) {
      el.href = `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`;
      el.target = "_blank";
      el.rel = "noopener";
    } else {
      el.setAttribute("aria-haspopup", "dialog");
      el.addEventListener("click", e => {
        e.preventDefault();
        lastTrigger = el;
        openNotice(
          "WhatsApp is not set up yet",
          "This is a portfolio demonstration, so no business number has been added. Once a number is added in the site settings, this button opens a WhatsApp chat with this message ready to send:",
          message
        );
      });
    }
  });

  const waPretty = /^234\d{10}$/.test(waDigits)
    ? "+234 " + waDigits.slice(3, 6) + " " + waDigits.slice(6, 9) + " " + waDigits.slice(9)
    : "+" + waDigits;
  document.querySelectorAll("[data-whatsapp-number]").forEach(el => {
    el.textContent = WA_READY ? waPretty : SITE_CONFIG.whatsappNumber;
  });
  document.querySelectorAll("[data-wa-placeholder]").forEach(el => { el.hidden = WA_READY; });

  /* ---------- Instagram ---------- */
  document.querySelectorAll("[data-instagram]").forEach(el => {
    if (IG_READY) {
      el.href = SITE_CONFIG.instagramUrl;
      el.target = "_blank";
      el.rel = "noopener";
    } else {
      el.setAttribute("aria-haspopup", "dialog");
      el.addEventListener("click", e => {
        e.preventDefault();
        lastTrigger = el;
        openNotice("Instagram is not set up yet",
          "This is a portfolio demonstration, so no Instagram profile has been linked. Once a profile address is added in the site settings, this link opens it.",
          "");
      });
    }
  });
  document.querySelectorAll("[data-ig-placeholder]").forEach(el => { el.hidden = IG_READY; });
  const igHandle = IG_READY ? "@" + SITE_CONFIG.instagramUrl.replace(/\/+$/, "").split("/").pop() : "";
  document.querySelectorAll("[data-instagram-label]").forEach(el => { if (IG_READY) el.textContent = igHandle + " on Instagram"; });

  /* ---------- Helpers shared by product pages and the enquiry list ---------- */
  const waHref = message => `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`;
  const naira = n => "₦" + Number(n).toLocaleString("en-NG");
  const MEASURE_LABELS = { bust: "Bust", waist: "Waist", hips: "Hips", shoulder: "Shoulder", length: "Length", height: "Height" };
  function describeChoice(choice) {
    if (choice.type === "standard") return "Size " + choice.size;
    const parts = Object.keys(MEASURE_LABELS).filter(k => choice.m[k]).map(k => `${MEASURE_LABELS[k]} ${choice.m[k]}`);
    return `Custom measurements (${choice.units === "cm" ? "cm" : "inches"}): ${parts.join(", ")}` + (choice.notes ? `. Notes: ${choice.notes}` : "");
  }
  function openWhatsApp(link, message, trigger) {
    if (WA_READY) { link.href = waHref(message); return true; }
    lastTrigger = trigger;
    openNotice("WhatsApp is not set up yet",
      "No business number has been added yet. Once it is, this opens a WhatsApp chat with this message ready to send:", message);
    return false;
  }

  /* ---------- Enquiry list storage (this browser only) ---------- */
  const LIST_KEY = "tf-enquiry-list";
  let storageOK = true, memoryList = [];
  function loadList() {
    try { const v = JSON.parse(localStorage.getItem(LIST_KEY) || "[]"); return Array.isArray(v) ? v : []; }
    catch (e) { storageOK = false; return memoryList; }
  }
  function saveList(list) {
    memoryList = list;
    try { localStorage.setItem(LIST_KEY, JSON.stringify(list)); } catch (e) { storageOK = false; }
    renderList();
  }
  const sameChoice = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  /* ---------- Enquiry list dialog ---------- */
  const listDialog = document.getElementById("enquiry-list");
  const listItems = document.getElementById("list-items");
  const listSend = document.getElementById("list-send");
  const listStatus = document.getElementById("list-status");
  let listTrigger = null;

  function listMessage(list) {
    const lines = list.map((it, i) => `${i + 1}. ${it.name} (${it.price}) - ${describeChoice(it.choice)}`);
    const total = list.reduce((s, it) => s + Number(it.priceValue || 0), 0);
    return `Hello Thread & Form, I'd like to enquire about these pieces:\n${lines.join("\n")}\nEstimated total: ${naira(total)}\nCould you confirm availability, sizing and delivery?`;
  }

  function renderList() {
    const list = loadList();
    document.querySelectorAll("[data-list-count]").forEach(el => { el.textContent = list.length; });
    document.querySelectorAll(".list-btn").forEach(b => b.setAttribute("aria-label", `Enquiry list, ${list.length} ${list.length === 1 ? "piece" : "pieces"}`));
    const bar = document.querySelector("[data-list-bar]");
    if (bar) { bar.hidden = list.length === 0; document.body.classList.toggle("has-list-bar", list.length > 0); }
    if (!listDialog) return;
    listItems.innerHTML = "";
    list.forEach((it, i) => {
      const li = document.createElement("li");
      const a = document.createElement("a"); a.className = "item-name"; a.href = it.url; a.textContent = it.name;
      const p = document.createElement("span"); p.className = "price"; p.textContent = it.price;
      const d = document.createElement("p"); d.className = "item-detail"; d.textContent = describeChoice(it.choice);
      const r = document.createElement("button"); r.type = "button"; r.className = "item-remove"; r.textContent = "Remove";
      r.setAttribute("aria-label", `Remove ${it.name}, ${describeChoice(it.choice)}, from your list`);
      r.addEventListener("click", () => {
        const l = loadList(); l.splice(i, 1); saveList(l);
        listStatus.textContent = `${it.name} removed.`;
        const next = listItems.querySelector(".item-remove") || document.getElementById("list-empty").querySelector("a");
        if (next) next.focus();
      });
      li.append(a, p, d, r);
      listItems.append(li);
    });
    const empty = list.length === 0;
    document.getElementById("list-empty").hidden = !empty;
    listSend.hidden = empty;
    document.getElementById("list-clear").hidden = empty;
    const total = list.reduce((s, it) => s + Number(it.priceValue || 0), 0);
    document.getElementById("list-total").textContent = empty ? "" : `Estimated total: ${naira(total)} (prices are confirmed on WhatsApp)`;
    document.getElementById("list-storage").hidden = storageOK;
    if (!empty && WA_READY) { listSend.href = waHref(listMessage(list)); listSend.target = "_blank"; listSend.rel = "noopener"; }
  }

  if (listDialog) {
    document.querySelectorAll("[data-open-list]").forEach(b => b.addEventListener("click", () => {
      listTrigger = b; listStatus.textContent = "";
      if (toggle && toggle.getAttribute("aria-expanded") === "true") toggle.click();
      renderList();
      listDialog.showModal();
    }));
    listDialog.querySelector("[data-close-list]").addEventListener("click", () => listDialog.close());
    listDialog.addEventListener("click", e => { if (e.target === listDialog) listDialog.close(); });
    listDialog.addEventListener("close", () => { if (listTrigger && document.contains(listTrigger) && listTrigger.offsetParent) listTrigger.focus(); });
    document.getElementById("list-clear").addEventListener("click", () => {
      saveList([]); listStatus.textContent = "Your list is now empty.";
      document.getElementById("list-empty").querySelector("a").focus();
    });
    listSend.addEventListener("click", e => {
      const list = loadList();
      if (!list.length) { e.preventDefault(); return; }
      if (!openWhatsApp(listSend, listMessage(list), listSend)) { e.preventDefault(); listDialog.close(); }
    });
    window.addEventListener("storage", e => { if (e.key === LIST_KEY) renderList(); });
    renderList();
  }

  /* ---------- Product page: size or custom measurements ---------- */
  const info = document.querySelector("[data-product-page]");
  if (info) {
    const form = document.getElementById("order-form");
    const std = document.getElementById("standard-panel");
    const cus = document.getElementById("custom-panel");
    const err = document.getElementById("order-error");
    const status = document.getElementById("order-status");
    const waBtn = document.getElementById("order-wa");
    const sizeSet = form.querySelector(".sizes");
    const sizeErr = document.getElementById("size-error");
    const RANGES = { in: { bust: [20, 70], waist: [16, 70], hips: [20, 75], shoulder: [10, 30], length: [10, 75], height: [48, 84] },
                     cm: { bust: [50, 180], waist: [40, 180], hips: [50, 190], shoulder: [25, 75], length: [25, 190], height: [120, 215] } };
    const product = { key: info.dataset.key, name: info.dataset.name, price: info.dataset.price, priceValue: Number(info.dataset.priceValue), url: info.dataset.url };

    const field = n => form.querySelector(`[name="${n}"]`);   // safe lookup ("length" clashes with form.elements.length)
    const fit = () => form.elements.fit.value;
    const showPanel = () => { const c = fit() === "custom"; std.hidden = c; cus.hidden = !c; err.textContent = ""; };
    form.querySelectorAll('input[name="fit"]').forEach(r => r.addEventListener("change", showPanel));
    showPanel();

    function fieldMsg(name, units) {
      const f = field(name), v = f.value.trim(), [lo, hi] = RANGES[units][name];
      const label = MEASURE_LABELS[name];
      if (!v) return f.required ? `Please enter your ${label.toLowerCase()} measurement.` : "";
      const n = Number(v);
      if (!isFinite(n) || n < lo || n > hi) return `${label} should be between ${lo} and ${hi} ${units === "cm" ? "cm" : "inches"}. Check the unit you selected.`;
      return "";
    }

    function readChoice() {
      err.textContent = "";
      if (fit() === "standard") {
        const size = form.elements.size.value;
        sizeSet.setAttribute("aria-invalid", size ? "false" : "true");
        sizeErr.textContent = size ? "" : "Please choose a size, or select Custom measurements.";
        if (!size) { form.querySelector('input[name="size"]').focus(); return null; }
        return { type: "standard", size };
      }
      const units = form.elements.units.value;
      let first = null; const m = {};
      for (const name of Object.keys(MEASURE_LABELS)) {
        const f = field(name), msg = fieldMsg(name, units);
        f.setAttribute("aria-invalid", msg ? "true" : "false");
        document.getElementById(`m-${name}-error`).textContent = msg;
        if (msg && !first) first = f;
        if (!msg && f.value.trim()) m[name] = Number(f.value);
      }
      if (first) { err.textContent = "Please check the highlighted measurements."; first.focus(); return null; }
      const notes = form.elements.notes.value.trim().replace(/\s+/g, " ");
      return { type: "custom", units, m, notes };
    }

    form.querySelectorAll('input[name="size"]').forEach(r => r.addEventListener("change", () => { sizeErr.textContent = ""; sizeSet.setAttribute("aria-invalid", "false"); }));
    Object.keys(MEASURE_LABELS).forEach(name => field(name).addEventListener("input", () => {
      const f = field(name);
      if (f.getAttribute("aria-invalid") === "true") { const msg = fieldMsg(name, form.elements.units.value); document.getElementById(`m-${name}-error`).textContent = msg; f.setAttribute("aria-invalid", msg ? "true" : "false"); }
    }));

    const singleMessage = choice => `Hello Thread & Form, I'd like to enquire about ${product.name} (${product.price}).\n${describeChoice(choice)}\nCould you confirm availability?`;

    waBtn.addEventListener("click", e => {
      const choice = readChoice();
      if (!choice) { e.preventDefault(); return; }
      waBtn.target = "_blank"; waBtn.rel = "noopener";
      if (!openWhatsApp(waBtn, singleMessage(choice), waBtn)) e.preventDefault();
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      const choice = readChoice();
      if (!choice) return;
      const list = loadList();
      const dup = list.some(it => it.key === product.key && sameChoice(it.choice, choice));
      if (!dup) { list.push({ ...product, choice }); saveList(list); }
      status.innerHTML = "";
      const t = document.createElement("span");
      t.textContent = dup ? `${product.name} (${describeChoice(choice)}) is already in your list.` : `Added ${product.name} (${describeChoice(choice)}) to your enquiry list.`;
      const view = document.createElement("button"); view.type = "button"; view.textContent = "View list"; view.setAttribute("data-open-list", "");
      view.addEventListener("click", () => { listTrigger = view; renderList(); listDialog.showModal(); });
      status.append(t, view);
    });
  }

  /* ---------- Shop filtering ---------- */
  const filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    const buttons = Array.from(filterBar.querySelectorAll(".filter-btn"));
    const cards = Array.from(document.querySelectorAll(".shop-grid .product-card"));
    const count = document.getElementById("result-count");
    const valid = buttons.map(b => b.dataset.filter);

    const apply = (slug, updateHash) => {
      if (!valid.includes(slug)) slug = "all";
      buttons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.filter === slug)));
      let shown = 0;
      cards.forEach(c => {
        const match = slug === "all" || c.dataset.category === slug;
        c.hidden = !match;
        if (match) shown++;
      });
      const label = buttons.find(b => b.dataset.filter === slug).textContent.trim();
      count.textContent = slug === "all"
        ? `Showing all ${shown} pieces`
        : `Showing ${shown} ${shown === 1 ? "piece" : "pieces"} in ${label}`;
      if (updateHash) {
        try { history.replaceState(null, "", "#" + slug); } catch (e) { /* hash not writable here */ }
      }
    };

    buttons.forEach(b => b.addEventListener("click", () => apply(b.dataset.filter, true)));
    window.addEventListener("hashchange", () => apply(location.hash.slice(1), false));
    apply(location.hash.slice(1), false);
  }

  /* ---------- Contact form (front-end demonstration) ---------- */
  const form = document.getElementById("contact-form");
  if (form) {
    const success = document.getElementById("form-success");
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const rules = {
      name: v => v.trim() ? "" : "Please enter your name.",
      email: v => !v.trim() ? "Please enter your email address."
        : (emailRe.test(v.trim()) ? "" : "Please enter a valid email address, for example name@example.com."),
      subject: v => v.trim() ? "" : "Please add a subject.",
      message: v => v.trim().length >= 10 ? "" : (v.trim() ? "Please write a little more (at least 10 characters)." : "Please enter a message.")
    };
    const check = field => {
      const msg = rules[field.name](field.value);
      const err = document.getElementById(field.id + "-error");
      field.setAttribute("aria-invalid", msg ? "true" : "false");
      err.textContent = msg;
      return !msg;
    };
    Object.keys(rules).forEach(n => {
      const f = form.elements[n];
      f.addEventListener("blur", () => { if (f.value) check(f); });
      f.addEventListener("input", () => { if (f.getAttribute("aria-invalid") === "true") check(f); });
    });
    form.addEventListener("submit", e => {
      e.preventDefault();
      const fields = Object.keys(rules).map(n => form.elements[n]);
      const results = fields.map(check);
      const firstBad = fields[results.indexOf(false)];
      if (firstBad) { firstBad.focus(); success.hidden = true; return; }
      const name = form.elements.name.value.trim().split(/\s+/)[0];
      document.getElementById("success-name").textContent = name;
      form.reset();
      fields.forEach(f => f.removeAttribute("aria-invalid"));
      success.hidden = false;
      success.focus();
    });
  }
})();
