const bootSequence = document.getElementById('boot-sequence');
const desktop = document.getElementById('desktop');
const appButtons = document.querySelectorAll('.app-icon');
const modal = document.getElementById('coming-soon-modal');
const modalTitle = document.getElementById('modal-title');
const closeModalButton = document.getElementById('close-modal');
const clock = document.getElementById('clock');

const bootDurationMs = 4400;

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

setInterval(updateClock, 1000);
updateClock();

setTimeout(() => {
  bootSequence.classList.add('hidden');
  desktop.classList.remove('hidden');
}, bootDurationMs);

appButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const appName = button.dataset.app ?? 'This app';
    modalTitle.textContent = `${appName} — Coming Soon`;
    modal.showModal();
  });
});

closeModalButton.addEventListener('click', () => {
  modal.close();
});

modal.addEventListener('click', (event) => {
  const rect = modal.getBoundingClientRect();
  const insideDialog =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

  if (!insideDialog) {
    modal.close();
  }
});
