document.addEventListener('DOMContentLoaded', function() {

  const img = document.getElementById('puzzle-image'); // Get the image element
  const canvas = document.getElementById('canvas'); // Get the canvas element
  const ctx = canvas.getContext('2d'); // Get the 2D drawing context for the canvas

  // Create and style the overlay and circle elements
  const overlay = document.createElement('div');
  const circle = document.createElement('div');
  overlay.id = 'overlay';
  circle.id = 'circle';
  overlay.appendChild(circle);
  document.body.appendChild(overlay); // Append overlay to the body

  // Explicit dimensions for the circle
  const circleDiameter = 40;
  circle.style.width = circleDiameter + 'px';
  circle.style.height = circleDiameter + 'px';

  let clickX, clickY; // Variables to store click coordinates
  const letters = []; // Array to store letters and their positions

  // Set canvas dimensions to match the image dimensions
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  // Adjust the canvas size in the DOM to match the image
  canvas.style.width = img.width + 'px';
  canvas.style.height = img.height + 'px';

  // Event listener for canvas clicks
  document.getElementById('canvas').addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect(); // Get canvas bounding rectangle
    clickX = event.clientX - rect.left; // Calculate click's X coordinate relative to the canvas
    clickY = event.clientY - rect.top; // Calculate click's Y coordinate relative to the canvas

    // Calculate circle's position relative to the overlay
    const circleX = event.clientX - circleDiameter / 2;
    const circleY = event.clientY - circleDiameter / 2;

    // Position the circle around the clicked area
    circle.style.transform = `translate(${circleX}px, ${circleY}px)`;
    overlay.style.display = 'flex'; // Show the overlay
    overlay.style.pointerEvents = 'auto'; // Enable pointer events for the overlay

    // Add a keydown event listener to capture user input
    document.addEventListener('keydown', handleKeydown);
  });

  // Event listener to hide the overlay on click
  overlay.addEventListener('click', function() {
      overlay.style.display = 'none'; // Hide the overlay
      document.removeEventListener('keydown', handleKeydown); // Remove the keydown event listener
  });

  // Function to handle keydown events
  function handleKeydown(event) {
    if (overlay.style.display === 'flex') { // Check if the overlay is displayed
      const letter = event.key; // Get the pressed key
      if (letter === 'Backspace' || letter === 'Delete') {
        removeLetter(clickX, clickY); // Remove letter if Backspace or Delete is pressed
      } else if (letter.length === 1 && letter.match(/[a-z]/i)) {
        drawLetter(clickX, clickY, letter); // Draw the letter on the canvas
      }
      overlay.style.display = 'none'; // Hide the overlay
      // Remove the keydown event listener
      document.removeEventListener('keydown', handleKeydown);
    }
  }

  // Function to draw a letter centered at (x, y) on the canvas
  function drawLetter(x, y, letter, push=true) {
    ctx.font = '20px Arial'; // Set font size and family
    ctx.fillStyle = 'black'; // Set text color

    letter = letter.toUpperCase(); // I don't see a reason to allow lowercase

    const textWidth = ctx.measureText(letter).width; // Measure text width
    const textHeight = parseInt(ctx.font, 10); // Approximate text height

    // Draw the text centered at (x, y)
    ctx.fillText(letter, x - textWidth / 2, y + textHeight / 2);

    // Store the letter and its position
    if (push) {
      letters.push({ x, y, letter, width: textWidth, height: textHeight });
    }
    
  }

  // Function to remove a letter if clicked and backspace/delete is pressed
  function removeLetter(x, y) {
    // Find the letter close to the click coordinates
    const index = letters.findIndex(letter => {
      return Math.abs(letter.x - x) < letter.width / 2 && Math.abs(letter.y - y) < letter.height / 2;
    });

    if (index !== -1) {
      // Remove the letter from the array
      letters.splice(index, 1);

      // Clear the canvas and redraw all remaining letters
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      letters.forEach(letter => {
          drawLetter(letter.x, letter.y, letter.letter, push=false);
      });
    }
  }

});
