const CONTACT_PHONE = "+380506410207";
const CONTACT_EMAIL = "sergey.romanenko@gmail.com";

const gallerySources = ["product.jpg", "photo-2.jpg", "photo-3.jpg", "photo-4.jpg"];
const gallery = document.querySelector("[data-gallery]");
const galleryImage = document.querySelector("[data-gallery-image]");
const galleryCount = document.querySelector("[data-gallery-count]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let availableImages = [];
let currentImage = 0;
let autoAdvance;
let activeScrollFrame;

function setContactDetails() {
  document.querySelectorAll("[data-phone-link]").forEach((link) => {
    link.href = `tel:${CONTACT_PHONE}`;
  });
  document.querySelectorAll("[data-email-link]").forEach((link) => {
    link.href = `mailto:${CONTACT_EMAIL}`;
  });
  document.querySelectorAll("[data-email-text]").forEach((text) => {
    text.textContent = CONTACT_EMAIL;
  });
  document.querySelectorAll("[data-phone-text]").forEach((text) => {
    text.textContent = CONTACT_PHONE;
  });
}

async function copyPhone(event) {
  event.preventDefault();
  const phoneLink = event.currentTarget;
  try {
    await navigator.clipboard.writeText(CONTACT_PHONE);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = CONTACT_PHONE;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }
  const status = phoneLink.querySelector("[data-copy-status]");
  if (status) {
    status.textContent = "Скопійовано";
    window.setTimeout(() => { status.textContent = ""; }, 1800);
  }
}

function showImage(index) {
  if (!availableImages.length) return;
  currentImage = (index + availableImages.length) % availableImages.length;
  galleryImage.classList.remove("loaded");
  galleryImage.src = availableImages[currentImage];
  gallery.classList.toggle("gallery-square", availableImages[currentImage] === "photo-4.jpg");
  galleryImage.onload = () => galleryImage.classList.add("loaded");
  galleryImage.alt = `EVA-килимки, фото ${currentImage + 1}`;
  galleryCount.textContent = `${String(currentImage + 1).padStart(2, "0")} / ${String(availableImages.length).padStart(2, "0")}`;
}

function restartAutoAdvance() {
  window.clearInterval(autoAdvance);
  if (availableImages.length > 1 && !reducedMotion) {
    autoAdvance = window.setInterval(() => showImage(currentImage + 1), 15000);
  }
}

function loadGallery() {
  const checks = gallerySources.map((source) => new Promise((resolve) => {
    const request = new XMLHttpRequest();
    request.open("GET", source, true);
    request.onload = () => resolve(request.status === 200 ? source : null);
    request.onerror = () => resolve(null);
    request.send();
  }));
  Promise.all(checks).then((sources) => {
    availableImages = sources.filter(Boolean);
    if (availableImages.length) {
      showImage(0);
      restartAutoAdvance();
    } else {
      galleryCount.textContent = "01 / 01";
      galleryImage.removeAttribute("src");
    }
  });
}

document.querySelector(".gallery-prev").addEventListener("click", () => { showImage(currentImage - 1); restartAutoAdvance(); });
document.querySelector(".gallery-next").addEventListener("click", () => { showImage(currentImage + 1); restartAutoAdvance(); });
document.querySelectorAll("[data-copy-phone]").forEach((link) => link.addEventListener("click", copyPhone));
gallery.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") { showImage(currentImage - 1); restartAutoAdvance(); }
  if (event.key === "ArrowRight") { showImage(currentImage + 1); restartAutoAdvance(); }
});
gallery.addEventListener("mouseenter", () => window.clearInterval(autoAdvance));
gallery.addEventListener("mouseleave", restartAutoAdvance);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    const start = window.scrollY;
    const destination = target.getBoundingClientRect().top + start;
    const distance = destination - start;
    if (reducedMotion) {
      window.scrollTo(0, destination);
      return;
    }
    const duration = 900;
    let startTime;

    window.cancelAnimationFrame(activeScrollFrame);
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      window.scrollTo(0, start + distance * eased);
      if (progress < 1) activeScrollFrame = window.requestAnimationFrame(step);
    }
    activeScrollFrame = window.requestAnimationFrame(step);
  });
});

const textRevealTargets = document.querySelectorAll(".product-intro > *, .benefit h3, .benefit p, .details-heading > *, .spec-table div, .contact-copy > *, .contact-link");
textRevealTargets.forEach((element, index) => {
  element.classList.add("text-reveal");
  element.style.transitionDelay = `${Math.min((index % 6) * 70, 350)}ms`;
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 55, 300)}ms`;
  revealObserver.observe(element);
});
textRevealTargets.forEach((element) => revealObserver.observe(element));

setContactDetails();
loadGallery();
