/** Stuff to run once the document is ready **/
document.addEventListener('DOMContentLoaded', function() {

  /**
  * TODO: I think this is an ugly way to do this
  * but I'm unfamiliar with promises and such
  * Does anyone want to modularize this further?
  **/

  // check that fetch is enabled
  if(typeof window.fetch !== "function") {
    alert('Please upgrade to a modern browser');
  }

  // Grab puzzle from query string if available
  var url = new URL(window.location.href);
  var puzzle = url.searchParams.get("puzzle");
  if (!puzzle) puzzle = url.searchParams.get("file");

  // We default to the flower power puzzle if one is not there
  if (!puzzle) puzzle = "flowerpower.vpuz";

  // Fetch the puzzle and process
  fetch(puzzle)
    .then(function (response) {
      if (response.status === 200 || response.status === 0) {
        return Promise.resolve(response.json())
      } else {
        return Promise.reject(new Error(response.statusText))
      }
    })
    .then(function success(data) {
      // All the interesting code here
      const img = document.getElementById('puzzle-image'); // Get the image element
      const canvas = document.getElementById('canvas'); // Get the canvas element
      const ctx = canvas.getContext('2d'); // Get the 2D drawing context for the canvas

      /** Define what to do when the image loads **/
      img.onload = function() {
        // Set canvas dimensions to match the image dimensions
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Adjust the canvas size in the DOM to match the image
        canvas.style.width = img.width + 'px';
        canvas.style.height = img.height + 'px';
      }

      /** Replace the HTML with data from the file **/

      // Puzzle image
      data = readVpuz(data);
      img.src = data['puzzle-image'];

      // Metadata
      if (data.title) {
        document.title = data.title + ' | ' + document.title;
        document.getElementById('modal-title').innerHTML = data.title;
      }
      if (data.author) document.getElementById('modal-author').innerHTML = data.author;
      if (data.copyright) document.getElementById('modal-copyright').innerHTML = data.copyright;
      if (data.notes) document.getElementById('modal-notepad').innerHTML = data.notes;

      // Clues
      /* TODO: we're living dangerously here and assuming exactly two clue arrays */
      for (var i=0; i < 2; i++) {
        // Fix the title
        var titleId = "clues-" + i.toString() + "-title";
        document.getElementById(titleId).innerHTML = data['improved-clues'][i].title;

        // Fix the clues
        var thisHTML = '';
        data['improved-clues'][i].clues.forEach(obj => {
          thisHTML += `<li class="clue-item"><span class="clue-number">${obj.number}</span><span class="clue-text">${obj.text}</span></li>`;
        });
        var clueListId = `clue-list-${i}`;
        document.getElementById(clueListId).innerHTML = thisHTML;
      }


      /** Now for the puzzle functionality **/
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

        // Confetti if needed
        checkIfSolved(data, letters)

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
});

/** Modal functionality **/

// Show the modal when the button is clicked
document.getElementById('infoButton').addEventListener('click', function() {
  document.getElementById('infoModal').style.display = 'flex';
});

// Hide the modal when the close button is clicked
document.getElementById('closeModal').addEventListener('click', function() {
  document.getElementById('infoModal').style.display = 'none';
});

// Hide the modal when clicking outside the modal content
document.getElementById('infoModal').addEventListener('click', function(event) {
  if (event.target === infoModal) {
    document.getElementById('infoModal').style.display = 'none';
  }
});

/** vPuz parsing **/
function readVpuz(data) {
    // If there's a "solution-string", add a sorted version
    if (data['solution-string']) {
      data['solution-string-sorted'] = sortString(data['solution-string']);
    }

    // If there's an "intro" but no notes, replace "notes" with "intro"
    if (data.intro && !data.notes) {
      data.notes = data.intro;
    }

    /** Standardize how the clues are presented **/
    const clues = [];

    // Iterate through the titles of the clues (if they exist)
    var titles = Object.keys(data['clues']) || {};

    titles.forEach( function(title) {
        var thisClues = [];
        data['clues'][title].forEach( function (clue) {
            var number = '', text = '';
            // a "clue" can be an array or an object (or a string?)
            if (Array.isArray(clue)) {
                number = clue[0].toString();
                text = clue[1];
            } else if (typeof clue === 'string') {
              text = clue;
            } else { // object
                if (clue.number) {
                  number = clue.number.toString();
                }
                text = clue.clue;
            }
            thisClues.push({'number': number, 'text': text});
        });
        clues.push({'title': title.split(':').at(-1), 'clues': thisClues});
    });

    data['improved-clues'] = clues;
    return data;
}

// confetti code from https://gist.github.com/elrumo/3055a9163fd2d0d19f323db744b0a094
var confetti={maxCount:150,speed:2,frameInterval:15,alpha:1,gradient:!1,start:null,stop:null,toggle:null,pause:null,resume:null,togglePause:null,remove:null,isPaused:null,isRunning:null};!function(){confetti.start=s,confetti.stop=w,confetti.toggle=function(){e?w():s()},confetti.pause=u,confetti.resume=m,confetti.togglePause=function(){i?m():u()},confetti.isPaused=function(){return i},confetti.remove=function(){stop(),i=!1,a=[]},confetti.isRunning=function(){return e};var t=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame,n=["rgba(30,144,255,","rgba(107,142,35,","rgba(255,215,0,","rgba(255,192,203,","rgba(106,90,205,","rgba(173,216,230,","rgba(238,130,238,","rgba(152,251,152,","rgba(70,130,180,","rgba(244,164,96,","rgba(210,105,30,","rgba(220,20,60,"],e=!1,i=!1,o=Date.now(),a=[],r=0,l=null;function d(t,e,i){return t.color=n[Math.random()*n.length|0]+(confetti.alpha+")"),t.color2=n[Math.random()*n.length|0]+(confetti.alpha+")"),t.x=Math.random()*e,t.y=Math.random()*i-i,t.diameter=10*Math.random()+5,t.tilt=10*Math.random()-10,t.tiltAngleIncrement=.07*Math.random()+.05,t.tiltAngle=Math.random()*Math.PI,t}function u(){i=!0}function m(){i=!1,c()}function c(){if(!i)if(0===a.length)l.clearRect(0,0,window.innerWidth,window.innerHeight),null;else{var n=Date.now(),u=n-o;(!t||u>confetti.frameInterval)&&(l.clearRect(0,0,window.innerWidth,window.innerHeight),function(){var t,n=window.innerWidth,i=window.innerHeight;r+=.01;for(var o=0;o<a.length;o++)t=a[o],!e&&t.y<-15?t.y=i+100:(t.tiltAngle+=t.tiltAngleIncrement,t.x+=Math.sin(r)-.5,t.y+=.5*(Math.cos(r)+t.diameter+confetti.speed),t.tilt=15*Math.sin(t.tiltAngle)),(t.x>n+20||t.x<-20||t.y>i)&&(e&&a.length<=confetti.maxCount?d(t,n,i):(a.splice(o,1),o--))}(),function(t){for(var n,e,i,o,r=0;r<a.length;r++){if(n=a[r],t.beginPath(),t.lineWidth=n.diameter,e=(i=n.x+n.tilt)+n.diameter/2,o=n.y+n.tilt+n.diameter/2,confetti.gradient){var l=t.createLinearGradient(e,n.y,i,o);l.addColorStop("0",n.color),l.addColorStop("1.0",n.color2),t.strokeStyle=l}else t.strokeStyle=n.color;t.moveTo(e,n.y),t.lineTo(i,o),t.stroke()}}(l),o=n-u%confetti.frameInterval),requestAnimationFrame(c)}}function s(t,n,o){var r=window.innerWidth,u=window.innerHeight;window.requestAnimationFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){return window.setTimeout(t,confetti.frameInterval)};var m=document.getElementById("confetti-canvas");null===m?((m=document.createElement("canvas")).setAttribute("id","confetti-canvas"),m.setAttribute("style","display:block;z-index:999999;pointer-events:none;position:fixed;top:0"),document.body.prepend(m),m.width=r,m.height=u,window.addEventListener("resize",(function(){m.width=window.innerWidth,m.height=window.innerHeight}),!0),l=m.getContext("2d")):null===l&&(l=m.getContext("2d"));var s=confetti.maxCount;if(n)if(o)if(n==o)s=a.length+o;else{if(n>o){var f=n;n=o,o=f}s=a.length+(Math.random()*(o-n)+n|0)}else s=a.length+n;else o&&(s=a.length+o);for(;a.length<s;)a.push(d({},r,u));e=!0,i=!1,c(),t&&window.setTimeout(w,t)}function w(){e=!1}}();

// helper function to sort a string
function sortString(s) {
    return s.split("").sort().join("");
}

// Check if solved
function checkIfSolved(data, letters) {
  // Grab the solution string
  const solutionString = data['solution-string-sorted'];

  // We don't need to go in if the letter counts are mismatched
  if (!solutionString || solutionString.length !== letters.length) {
    return;
  }

  // Sort the letters the user has typed
  const userLetters = letters.map(item => item.letter);
  const userLettersString = userLetters.join('');
  const userLettersSorted = sortString(userLettersString);

  // If they match, make some confetti
  if (solutionString == userLettersSorted) {
    confetti.start();
    setTimeout(function() {
        confetti.stop()
    }, 3000);
  }
}
