// Skills index (index2.html): one row open at a time.
// Click/tap opens a row. Hover only highlights (see skills.css) — opening on
// hover made rows collapse under the cursor and cascade.
(function () {
  const skills = Array.from(document.querySelectorAll('.skill'));
  if (!skills.length) return;

  function setOpen(li, on) {
    li.classList.toggle('is-open', on);
    li.querySelector('.skill-row').setAttribute('aria-expanded', on);

    const proof = li.querySelector('.skill-proof');
    if (on) proof.removeAttribute('inert');
    else proof.setAttribute('inert', '');

    // Only play videos in the open row
    li.querySelectorAll('video').forEach(v => {
      if (on) v.play().catch(() => {});
      else v.pause();
    });
  }

  function open(target) {
    skills.forEach(li => setOpen(li, li === target));
  }

  skills.forEach(li => {
    const row = li.querySelector('.skill-row');

    row.addEventListener('click', () => {
      if (li.classList.contains('is-open')) setOpen(li, false);
      else open(li);
    });
  });

  // Sync initial state (first row open by default in the markup)
  open(skills.find(li => li.classList.contains('is-open')) || skills[0]);
})();
