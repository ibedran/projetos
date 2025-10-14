// Aplica o fade in quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});

// Intercepta cliques nos links para criar fade out
document.querySelectorAll('a.botao').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault(); // previne navegação imediata
    const url = this.href;
    document.body.classList.remove('loaded'); // fade out
    setTimeout(() => {
      window.location.href = url; // navega após o fade
    }, 600); // tempo igual ao transition do CSS
  });
});