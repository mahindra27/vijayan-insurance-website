/* =============================================================
   Vijayan Supramaniam — Great Eastern Life | main.js
   Handles: WhatsApp deep-links, mobile nav, FAQ, scroll reveal,
   sticky header, enquiry form -> WhatsApp message.
   ============================================================= */

// ---- CONFIG: update the WhatsApp number here (international format, no + or spaces) ----
const WHATSAPP_NUMBER = "60193852581"; // Malaysia 019-385 2581

document.addEventListener("DOMContentLoaded", () => {
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* ---- Year in footer ---- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Toast helper ---- */
  const toast = $("#toast");
  const toastMsg = $("#toastMsg");
  function showToast(msg) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* ---- Open WhatsApp with a prefilled message ---- */
  function openWhatsApp(message) {
    const text = encodeURIComponent(message || "Hi Vijayan!");
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    showToast("Opening WhatsApp…");
    window.open(url, "_blank", "noopener");
  }

  /* ---- Generic WhatsApp links (.js-wa) ---- */
  $$(".js-wa").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openWhatsApp(el.dataset.waMsg || "Hi Vijayan!");
    });
  });

  /* ---- Sticky header shadow ---- */
  const header = $("#header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile nav toggle ---- */
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("open");
      navToggle.classList.toggle("active", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });
    $$("#navMenu a").forEach((a) =>
      a.addEventListener("click", () => {
        navMenu.classList.remove("open");
        navToggle.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---- Scroll-spy: highlight active nav link ---- */
  const navLinkEls = $$(".nav__links a[href^='#']");
  const spySections = navLinkEls
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && spySections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = "#" + entry.target.id;
            navLinkEls.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    spySections.forEach((s) => spy.observe(s));
  }

  /* ---- FAQ accordion ---- */
  $$(".faq__item").forEach((item) => {
    const q = $(".faq__q", item);
    const a = $(".faq__a", item);
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      $$(".faq__item").forEach((other) => {
        other.classList.remove("open");
        $(".faq__a", other).style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---- Scroll reveal ---- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---- Enquiry form -> WhatsApp ---- */
  const form = $("#enquiryForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const val = (id) => (form.elements[id]?.value || "").trim();
      const name = val("name");
      const phone = val("phone");
      const interest = val("interest");

      // Simple boundary validation on required fields
      let firstInvalid = null;
      [["name", name], ["phone", phone], ["interest", interest]].forEach(([id, v]) => {
        const field = form.elements[id];
        if (!v) {
          field.style.borderColor = "#c8102e";
          if (!firstInvalid) firstInvalid = field;
        } else {
          field.style.borderColor = "";
        }
      });
      if (firstInvalid) {
        firstInvalid.focus();
        showToast("Please complete the required fields");
        return;
      }

      const lines = [
        "*New Insurance Enquiry*",
        `Name: ${name}`,
        val("age") && `Age: ${val("age")}`,
        `Phone/WhatsApp: ${phone}`,
        val("email") && `Email: ${val("email")}`,
        val("occupation") && `Occupation: ${val("occupation")}`,
        `Interested in: ${interest}`,
        val("existing") && `Existing coverage: ${val("existing")}`,
        val("preferred") && `Preferred time: ${val("preferred")}`,
        val("message") && `Message: ${val("message")}`,
      ].filter(Boolean);

      openWhatsApp(lines.join("\n"));
    });
  }

  /* ---- Smooth-scroll offset for sticky header on hash links ---- */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 78;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });
});
