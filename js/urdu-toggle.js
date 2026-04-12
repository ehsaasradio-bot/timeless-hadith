/* Urdu Translation — Inline Accordion Toggle (CSP-compliant) */
document.addEventListener('click', function(e) {
  var btn = e.target.closest('.urdu-trans-btn');
  if (!btn) return;
  var body = btn.nextElementSibling;
  if (!body) return;
  var isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
});
