// auto year
document.getElementById("year").textContent =
  new Date().getFullYear();
  const icons = document.querySelectorAll('.icon');
  icons.forEach (icon => {  
    icon.addEventListener('click', (event) => {
      icon.classList.toggle("open");
    });
  });