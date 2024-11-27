// Data for emojis categorized with Dutch names
const emojiData = {
  activiteiten: [
    { char: '⚽', name: 'voetbal' },
    { char: '🏀', name: 'basketbal' },
    { char: '🏈', name: 'amerikaans voetbal' },
    { char: '🎾', name: 'tennis' },
    { char: '🏐', name: 'volleybal' },
    { char: '🏉', name: 'rugby' },
    { char: '🎱', name: 'biljart' },
    { char: '🏓', name: 'tafeltennis' },
    { char: '🏸', name: 'badminton' },
    { char: '🥅', name: 'doelnet' },
    { char: '🏒', name: 'ijshockey' },
    { char: '🏏', name: 'cricket' },
    { char: '⛳', name: 'golf' },
    { char: '🏹', name: 'boogschieten' },
    { char: '🎣', name: 'vissen' },
    { char: '🤿', name: 'duiken' },
    { char: '🥊', name: 'boksen' },
    { char: '🥋', name: 'vechtsport' },
    { char: '⛸️', name: 'schaatsen' },
    { char: '🥌', name: 'curling' },
    { char: '🧗', name: 'klimmen' },
    { char: '🏇', name: 'paardrijden' },
    { char: '🚴', name: 'fietsen' },
    { char: '🏊', name: 'zwemmen' },
    // ... Add more activities to reach at least 300 emojis across all categories
  ],
  // ... Include all other categories with their respective emojis
  // Ensure that the total number of emojis across all categories is at least 300
};

// List of category names
let categories = Object.keys(emojiData);
let currentCategoryIndex = 0;

// Variables for drag-and-drop functionality
let draggedEmoji = null;
let draggedEmojiClone = null;
let currentDroppable = null;

// Variables for auto-scrolling
let autoScrollInterval = null;
const scrollThreshold = 50;
const scrollSpeed = 10;

// Initialize the application
function init() {
  try {
    // Load the default emoji category
    loadEmojis(categories[currentCategoryIndex]);

    // Update live time every second
    updateLiveTime();
    setInterval(updateLiveTime, 1000);

    // Initialize placeholders
    initializePlaceholders();

    // Initialize event listeners
    addGlobalEventListeners();
  } catch (error) {
    logError('init', 'Failed to initialize the application.', { error });
  }
}

// Function to initialize placeholders
function initializePlaceholders() {
  document.querySelectorAll('.add-placeholder-button').forEach(button => {
    button.addEventListener('click', handleAddPlaceholder);
  });

  document.querySelectorAll('.emoji-placeholder').forEach(placeholder => {
    makePlaceholderDroppable(placeholder);
  });
}

// Function to handle adding a new placeholder
function handleAddPlaceholder() {
  const sector = this.closest('.sector');
  const placeholdersContainer = sector.querySelector('.placeholders');
  const time = this.previousElementSibling.getAttribute('data-time');
  const currentPlaceholders = placeholdersContainer.querySelectorAll('.placeholder-container').length;

  if (currentPlaceholders < 5) {
    // Create new placeholder
    const newPlaceholderContainer = document.createElement('div');
    newPlaceholderContainer.classList.add('placeholder-container');

    const placeholder = document.createElement('div');
    placeholder.classList.add('emoji-placeholder');
    placeholder.setAttribute('data-time', time);
    placeholder.setAttribute('data-empty', 'true');
    makePlaceholderDroppable(placeholder);

    const addButton = this.cloneNode(true);
    addButton.addEventListener('click', handleAddPlaceholder);

    newPlaceholderContainer.appendChild(placeholder);
    newPlaceholderContainer.appendChild(addButton);
    placeholdersContainer.appendChild(newPlaceholderContainer);

    // Remove "+" button from the previous container
    this.remove();
  } else {
    alert('Maximum aantal placeholders bereikt voor deze sectie.');
  }
}

// Function to make placeholders droppable
function makePlaceholderDroppable(placeholder) {
  placeholder.addEventListener('dragover', handleDragOver);
  placeholder.addEventListener('drop', handleDrop);
  placeholder.addEventListener('dragstart', handleDragStartPlaceholder);
  placeholder.addEventListener('dragend', handleDragEndPlaceholder);
}

// Handle drag start on placeholder (to swap emojis)
function handleDragStartPlaceholder(e) {
  if (this.textContent && !this.hasAttribute('data-empty')) {
    draggedEmoji = this;
    e.dataTransfer.setData('text/plain', this.textContent);
    e.dataTransfer.effectAllowed = 'move';
  } else {
    e.preventDefault();
  }
}

// Handle drag over on placeholder
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.classList.add('highlight');
}

// Handle drop on placeholder
function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('highlight');
  const droppedEmoji = e.dataTransfer.getData('text/plain');

  if (draggedEmoji && draggedEmoji !== this) {
    // Swap emojis
    const temp = this.textContent;
    this.textContent = draggedEmoji.textContent;
    draggedEmoji.textContent = temp;

    // Update data-empty attributes
    updateEmptyAttribute(this);
    updateEmptyAttribute(draggedEmoji);
  } else if (!this.textContent) {
    // Place the emoji in the placeholder
    this.textContent = droppedEmoji;
    updateEmptyAttribute(this);
  }

  // Reset draggedEmoji
  draggedEmoji = null;
}

// Handle drag end on placeholder
function handleDragEndPlaceholder() {
  this.classList.remove('highlight');
}

// Update the data-empty attribute
function updateEmptyAttribute(element) {
  if (element.textContent.trim() === '') {
    element.setAttribute('data-empty', 'true');
  } else {
    element.removeAttribute('data-empty');
  }
}

// Function to load emojis
function loadEmojis(category) {
  try {
    const emojiGrid = document.getElementById('emoji-grid');
    emojiGrid.innerHTML = ''; // Clear existing emojis
    const emojis = emojiData[category];

    // Create and append emoji items
    emojis.forEach(emojiObj => {
      const emojiItem = createEmojiItem(emojiObj.char, emojiObj.name);
      emojiGrid.appendChild(emojiItem);
    });

    // Update the category name display
    const categoryNameDisplay = document.getElementById('category-name');
    categoryNameDisplay.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  } catch (error) {
    logError('loadEmojis', 'Failed to load emojis for category.', { category, error });
  }
}

// Function to create an emoji item
function createEmojiItem(emojiChar, emojiName) {
  const emojiItem = document.createElement('div');
  emojiItem.classList.add('emoji-item');
  emojiItem.textContent = emojiChar;
  emojiItem.dataset.name = emojiName.toLowerCase();

  // Make the emoji draggable
  emojiItem.setAttribute('draggable', 'true');

  // Event listeners for drag-and-drop
  emojiItem.addEventListener('dragstart', handleDragStartEmoji);
  emojiItem.addEventListener('dragend', handleDragEndEmoji);

  return emojiItem;
}

// Drag-and-Drop Event Handlers for Emojis
function handleDragStartEmoji(e) {
  draggedEmoji = e.target;
  e.dataTransfer.setData('text/plain', e.target.textContent);
  e.dataTransfer.effectAllowed = 'copyMove';
}

function handleDragEndEmoji(e) {
  draggedEmoji = null;
}

// Event listeners for category navigation
document.getElementById('prev-category').addEventListener('click', () => navigateCategory('prev'));
document.getElementById('next-category').addEventListener('click', () => navigateCategory('next'));

// Function to navigate categories
function navigateCategory(direction) {
  try {
    if (direction === 'prev') {
      currentCategoryIndex = (currentCategoryIndex - 1 + categories.length) % categories.length;
    } else if (direction === 'next') {
      currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
    }
    const newCategory = categories[currentCategoryIndex];
    loadEmojis(newCategory);
  } catch (error) {
    logError('navigateCategory', 'Failed to navigate categories.', { direction, error });
  }
}

// Emoji search functionality
const emojiSearchInput = document.getElementById('emoji-search-input');
emojiSearchInput.addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  filterEmojis(searchTerm);
});

function filterEmojis(searchTerm) {
  const emojis = document.querySelectorAll('.emoji-item');
  emojis.forEach(emoji => {
    if (emoji.dataset.name.includes(searchTerm)) {
      emoji.style.display = 'flex';
    } else {
      emoji.style.display = 'none';
    }
  });
}

// Huiswerk Button Toggle Functionality
const huiswerkButton = document.querySelector('.huiswerk-button');
huiswerkButton.addEventListener('click', () => {
  try {
    huiswerkButton.classList.toggle('active');
  } catch (error) {
    logError('huiswerkButton', 'Failed to toggle Huiswerk button.', { error });
  }
});

// Update live time display
function updateLiveTime() {
  try {
    const liveTimeElement = document.getElementById('live-time');
    const now = new Date();
    liveTimeElement.textContent = now.toLocaleTimeString('nl-NL', { hour12: false });
  } catch (error) {
    logError('updateLiveTime', 'Failed to update live time.', { error });
  }
}

// Reset Button Functionality
document.getElementById('reset-button').addEventListener('click', () => {
  try {
    // Clear emojis from placeholders
    const placeholders = document.querySelectorAll('.emoji-placeholder');
    placeholders.forEach(placeholder => {
      placeholder.textContent = '';
      placeholder.setAttribute('data-empty', 'true');
    });

    // Reset Huiswerk button
    huiswerkButton.classList.remove('active');

    // Reset day rating
    ratingButtons.forEach(button => {
      button.classList.remove('selected');
    });
  } catch (error) {
    logError('resetButton', 'Failed to reset planner.', { error });
  }
});

// Day Rating System
const ratingButtons = document.querySelectorAll('.rating-button');
ratingButtons.forEach(button => {
  button.addEventListener('click', () => {
    try {
      ratingButtons.forEach(btn => {
        btn.classList.remove('selected');
      });
      button.classList.add('selected');
    } catch (error) {
      logError('ratingButton', 'Failed to select rating.', { button, error });
    }
  });
});

// Error Logging Function
function logError(eventType, message, details = {}) {
  console.error(`Error [${eventType}]: ${message}`, details);
}

// Initialize the application
init();
