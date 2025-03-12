// Get the button and modal elements
const aboutButton = document.getElementById('about');
const aboutModal = document.getElementById('about-modal');
const closeAboutButton = document.getElementById('close-about');

// Function to open the modal
function openModal() {
  aboutModal.classList.add('show');
}

// Function to close the modal
function closeModal() {
  aboutModal.classList.remove('show');
}

// Add click event listener to the About button
aboutButton.addEventListener('click', openModal);

// Add click event listener to the Close button
closeAboutButton.addEventListener('click', closeModal);