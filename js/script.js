document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.menu-btn');
 
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Pequeño efecto de "presionado" antes de navegar
      btn.style.transform = 'scale(0.95)';
    });
  });
});