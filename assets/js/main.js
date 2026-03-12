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
          initCopyEmail(); 
        }
      }
    } catch (err) {
      console.error("Fetch failed for:", file, err);
    }
  }
}

// 1. Copy Email to Clipboard Logic
function initCopyEmail() {
  // Select both footer and header buttons
  const emailBtns = document.querySelectorAll('.footer-btn, .header-btn');
  if (emailBtns.length === 0) return;

  // Loop through every button found and attach the click event
  emailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevents the mail app from opening when copying
      
      const email = "hellothere@ianmarder.com";
      navigator.clipboard.writeText(email).then(() => {
        const originalText = btn.textContent;
        
        // Success state
        btn.textContent = "Email Copied!";
        btn.style.backgroundColor = "#01CB84"; // Success green
        btn.style.color = "#0b1120"; 

        // Reset state after 2 seconds
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = ""; 
          btn.style.color = ""; 
        }, 2000);
      });
    });
  });
}

// 2. Navigation Logic
function setupNav() {
  const menu = document.querySelector('#mobile-menu');
  const navLinks = document.querySelector('.nav-menu');

  if (menu && navLinks) {
    // Toggle menu open/closed
    menu.addEventListener('click', () => {
      menu.classList.toggle('is-active');
      navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('is-active');
        navLinks.classList.remove('active');
      });
    });
  }
}

// 3. Animation Observer
function initObserver() {
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
  }, { threshold: 0.15 }); // Slightly lowered threshold for better mobile triggering

  document.querySelectorAll(".reveal").forEach(el => {
    observer.observe(el);
  });
}

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
  initObserver();      // Initialize animations AFTER includes are loaded
  showSlides(); 
});