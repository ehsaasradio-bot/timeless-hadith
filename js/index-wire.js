(function () {
  document.querySelectorAll('.glass-panel').forEach(function (card) {
    card.addEventListener('mousemove', function (event) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', (event.clientX - rect.left) + 'px');
      card.style.setProperty('--mouse-y', (event.clientY - rect.top) + 'px');
    });
  });
})();
