async function includeHTML() {
  const elements = document.querySelectorAll('[data-include]');
  
  for (const el of elements) {
    const file = el.getAttribute('data-include');

    try {
      const response = await fetch(file);
      if (response.ok) {
        const content = await response.text();
        el.innerHTML = content;

        // If we just loaded the header, initialize the nav logic
        if (file.includes('header')) {
          setupNav();
        }
        
        // If we just loaded the footer, update the year
        if (file.includes('footer')) {
          const yearEl = document.getElementById('year');
          if (yearEl) yearEl.textContent = new Date().getFullYear();
        }
      }
    } catch (err) {
      console.error("Fetch failed for:", file, err);
    }
  }
}

// Separate Nav Logic to keep it clean
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

// Drawer Toggle Logic for the Work page
function toggleDrawer(selectedDrawer) {
  document.querySelectorAll('.project-drawer').forEach(drawer => {
    if (drawer !== selectedDrawer) {
      drawer.classList.remove('is-open');
    }
  });
  selectedDrawer.classList.toggle('is-open');
}

let slideIndex = 0;

// Fade in / slide up JS

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;

      // Optional delay support
      const delay = el.dataset.delay;
      if (delay) {
        el.style.setProperty("--delay", delay + "ms");
      }

      el.classList.add("is-visible");
      observer.unobserve(el); // animate once
    }
  });
}, {
  threshold: 0.20
});

document.querySelectorAll(".reveal").forEach(el => {
  observer.observe(el);
});

function showSlides() {
  const slides = document.querySelectorAll(".slide");
  if (slides.length === 0) return;

  // Find the currently active slide
  const currentActive = document.querySelector(".slide.active");
  
  // Calculate next index
  slideIndex++;
  if (slideIndex > slides.length) { slideIndex = 1; }

  // 1. Remove active class from previous
  if (currentActive) {
      currentActive.classList.remove("active");
  }

  // 2. Add active class to next
  slides[slideIndex - 1].classList.add("active");

  // Keep the timing long enough to enjoy the zoom
  setTimeout(showSlides, 7000); 
}



document.addEventListener('DOMContentLoaded', () => {
  includeHTML();
  showSlides(); // Start the carousel
});