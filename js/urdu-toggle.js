/* Urdu Translation — Inline Accordion Toggle */
function thUrduToggle(btn) {
  var body = btn.nextElementSibling;
  if (!body) return;
  var isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
}
