async function includeHTML() {
  const elements = document.querySelectorAll('[data-include]');
  
  for (const el of elements) {
    const file = el.getAttribute('data-include');

    try {
      const response = await fetch(file);
      if (response.ok) {
        const content = await response.text();
        el.innerHTML = content;

        // Header Logic
        if (file.includes('header')) {
          setupNav();
        }
        
        // Footer Logic
        if (file.includes('footer')) {
          const yearEl = document.getElementById('year');
          if (yearEl) yearEl.textContent = new Date().getFullYear();
          initCopyEmail(); // Initialize the copy feature
        }
      }
    } catch (err) {
      console.error("Fetch failed for:", file, err);
    }
  }
}

// 1. Copy Email to Clipboard Logic
function initCopyEmail() {
  const emailBtn = document.querySelector('.footer-button');
  if (!emailBtn) return;

  emailBtn.addEventListener('click', (e) => {
    // Optional: Uncomment the line below to prevent the mail app from opening
    // e.preventDefault(); 
    
    const email = "hellothere@ianmarder.com";
    navigator.clipboard.writeText(email).then(() => {
      const originalText = emailBtn.textContent;
      emailBtn.textContent = "Email Copied!";
      emailBtn.style.backgroundColor = "#28a745"; // Success green

      setTimeout(() => {
        emailBtn.textContent = originalText;
        emailBtn.style.backgroundColor = ""; // Reset to CSS default
      }, 2000);
    });
  });
}

// 2. Navigation Logic
function setupNav() {
  const menu = document.querySelector('#mobile-menu');
  const navLinks = document.querySelector('.nav-menu');

  if (menu && navLinks) {
    menu.addEventListener('click', () => {
      menu.classList.toggle('is-active');
      navLinks.classList.toggle('active');
    });
  }
}

// 3. Animation Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.dataset.delay;
      if (delay) {
        el.style.setProperty("--delay", delay + "ms");
      }
      el.classList.add("is-visible");
      observer.unobserve(el);
    }
  });
}, { threshold: 0.20 });

document.querySelectorAll(".reveal").forEach(el => {
  observer.observe(el);
});

// 4. Ken Burns Slideshow
let slideIndex = 0;
function showSlides() {
  const slides = document.querySelectorAll(".slide");
  if (slides.length === 0) return;

  const currentActive = document.querySelector(".slide.active");
  
  slideIndex++;
  if (slideIndex > slides.length) { slideIndex = 1; }

  if (currentActive) {
      currentActive.classList.remove("active");
  }

  slides[slideIndex - 1].classList.add("active");
  setTimeout(showSlides, 7000); 
}

// 5. Initialize All
document.addEventListener('DOMContentLoaded', async () => {
  await includeHTML(); // Wait for header/footer to be in the DOM
  showSlides(); 
});