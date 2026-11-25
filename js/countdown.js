// Fecha objetivo para el contador regresivo.
const target = new Date('2027-01-06T14:00:00-05:00').getTime();

// Actualiza los valores del contador cada segundo.
function tick() {
  const difference = Math.max(0, target - Date.now());
  const values = {
    days: Math.floor(difference / 86400000),
    hours: Math.floor(difference / 3600000) % 24,
    mins: Math.floor(difference / 60000) % 60,
    secs: Math.floor(difference / 1000) % 60,
  };

  for (const [key, value] of Object.entries(values)) {
    document.getElementById(key).textContent = String(value).padStart(2, '0');
  }
}

tick();
setInterval(tick, 1000);
