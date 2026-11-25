const firebaseApp = firebase.initializeApp(firebaseConfig);
const firestoreDb = firebaseApp.firestore();
const confirmacionesRef = firestoreDb.collection('confirmaciones');

const confirmationModal = document.getElementById('confirmationModal');
const openConfirmationModalButton = document.getElementById('openConfirmationModal');
const closeConfirmationModalButton = document.getElementById('closeConfirmationModal');
const confirmationForm = document.getElementById('confirmationForm');
const confirmationStatus = document.getElementById('confirmationStatus');
const tieneHijosSelect = confirmationForm.querySelector('select[name="tieneHijos"]');
const cuantosHijosField = document.getElementById('cuantosHijosField');
const cuantosHijosInput = confirmationForm.querySelector('input[name="cuantosHijos"]');
const platosNinosField = document.getElementById('platosNinosField');
const platosNinosList = document.getElementById('platosNinosList');
const rsvpDeadlineText = document.getElementById('rsvpDeadline');

// Fecha límite de confirmación: hasta el 25 de diciembre a las 11:59 p. m. (hora de Colombia).
const RSVP_DEADLINE = new Date('2026-12-26T00:00:00-05:00').getTime();

function isRsvpClosed() {
  return Date.now() >= RSVP_DEADLINE;
}

function updateRsvpAvailability() {
  if (!isRsvpClosed()) return false;
  openConfirmationModalButton.disabled = true;
  rsvpDeadlineText.classList.add('is-closed');
  rsvpDeadlineText.textContent = 'La fecha de confirmación terminó el 25 de diciembre.';
  return true;
}

// Opciones del menú infantil (solo para los niños).
const PLATOS_NINOS = ['Salchipapa', 'Perro caliente'];
const MAX_HIJOS = Number(cuantosHijosInput.max) || 10;

function getCuantosHijos() {
  const value = Math.floor(Number(cuantosHijosInput.value) || 0);
  return Math.min(Math.max(value, 0), MAX_HIJOS);
}

// Crea un selector de plato por cada niño, conservando lo ya elegido.
function renderPlatosNinos() {
  const count = tieneHijosSelect.value === 'si' ? getCuantosHijos() : 0;
  const previous = Array.from(platosNinosList.querySelectorAll('select')).map((select) => select.value);

  platosNinosList.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const label = document.createElement('label');
    label.textContent = `Plato del niño ${i + 1}`;

    const select = document.createElement('select');
    select.name = 'platoNino';
    select.required = true;
    select.add(new Option('Selecciona un plato', ''));
    PLATOS_NINOS.forEach((plato) => select.add(new Option(plato, plato)));
    select.value = previous[i] || '';

    label.appendChild(select);
    platosNinosList.appendChild(label);
  }

  platosNinosField.classList.toggle('is-hidden', count === 0);
}

function setCuantosVisibility() {
  const shouldShow = tieneHijosSelect.value === 'si';
  cuantosHijosField.classList.toggle('is-hidden', !shouldShow);
  cuantosHijosInput.required = shouldShow;
  // Deshabilitado mientras está oculto para que no bloquee la validación del navegador.
  cuantosHijosInput.disabled = !shouldShow;
  if (!shouldShow) {
    cuantosHijosInput.value = '0';
  } else if (getCuantosHijos() === 0) {
    cuantosHijosInput.value = '1';
  }
  renderPlatosNinos();
}

function setStatus(message, type = '') {
  confirmationStatus.textContent = message;
  confirmationStatus.classList.remove('is-success', 'is-error');
  if (type) {
    confirmationStatus.classList.add(type);
  }
}

function setModalState(isOpen) {
  confirmationModal.classList.toggle('is-open', isOpen);
  confirmationModal.setAttribute('aria-hidden', String(!isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

tieneHijosSelect.addEventListener('change', setCuantosVisibility);
cuantosHijosInput.addEventListener('input', renderPlatosNinos);
setCuantosVisibility();

// Revisa el plazo al cargar y cada minuto, por si la página queda abierta al pasar la fecha.
if (!updateRsvpAvailability()) {
  const rsvpCheckId = setInterval(() => {
    if (updateRsvpAvailability()) clearInterval(rsvpCheckId);
  }, 60000);
}

openConfirmationModalButton.addEventListener('click', () => {
  if (updateRsvpAvailability()) return;
  setModalState(true);
});
closeConfirmationModalButton.addEventListener('click', () => setModalState(false));
confirmationModal.addEventListener('click', (event) => {
  if (event.target === confirmationModal) setModalState(false);
});

confirmationForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (isRsvpClosed()) {
    setStatus('La fecha de confirmación terminó.', 'is-error');
    updateRsvpAvailability();
    return;
  }

  const formData = new FormData(confirmationForm);
  const tieneHijos = String(formData.get('tieneHijos') || '').trim();
  const cuantosHijos = tieneHijos === 'si' ? getCuantosHijos() : 0;
  const platosNinos = tieneHijos === 'si'
    ? formData.getAll('platoNino').map((plato) => String(plato).trim())
    : [];

  const payload = {
    nombreCompleto: String(formData.get('nombreCompleto') || '').trim(),
    tieneHijos,
    cuantosHijos,
    platosNinos,
    vieneEnPareja: String(formData.get('vieneEnPareja') || '').trim(),
    createdAt: new Date().toISOString()
  };

  if (!payload.nombreCompleto || !payload.tieneHijos || !payload.vieneEnPareja) {
    setStatus('Completa todos los campos obligatorios.', 'is-error');
    return;
  }

  if (tieneHijos === 'si' && cuantosHijos < 1) {
    setStatus('Indica cuántos niños vienen.', 'is-error');
    return;
  }

  if (platosNinos.length !== cuantosHijos || platosNinos.some((plato) => !PLATOS_NINOS.includes(plato))) {
    setStatus('Elige un plato para cada niño.', 'is-error');
    return;
  }

  setStatus('Enviando...', '');
  try {
    await confirmacionesRef.add(payload);
    setStatus('¡Gracias! Tu confirmación fue enviada con éxito.', 'is-success');
    confirmationForm.reset();
    platosNinosList.innerHTML = '';
    setCuantosVisibility();
    setTimeout(() => {
      setModalState(false);
      setStatus('', '');
    }, 1600);
  } catch (error) {
    console.error('Error al guardar en Firebase:', error);
    setStatus('No se pudo enviar. Intenta de nuevo.', 'is-error');
  }
});
