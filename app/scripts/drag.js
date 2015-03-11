// target elements with the "draggable" class
interact('.draggable')
  .on('tap', function (event){
    var target = event.target;
    var urlInput = document.getElementById('url_input');
    urlInput.value = parseImageURL(event.target.style.backgroundImage);
  }) 

  .draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    restrict: {
      restriction: "parent",
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },

    // call this function on every dragmove event
    onmove: function (event) {
      var target = event.target,
          // keep the dragged position in the data-x/data-y attributes
          x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
          y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      // translate the element
      target.style.webkitTransform =
      target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    },
    // call this function on every dragend event
    onend: function (event) {
    }
  });

  // Returns the URL from the backgroundImage property of an element
  function parseImageURL(input) {
    return input;
  }

  function editMode() {
      var className;
      var click;
      var folders = document.getElementById('canvas').children;
      var editButton = document.getElementById('edit_mode');
      var urlInput = document.getElementById('url_input');

      // Check to see if the button is currently to set or disable,
      // enables or disabled edit mode according to button data
      if(editButton.getAttribute('data-editMode') == 'disabled') {
        // Enable the editing of folders and reflect changes with button
        className = 'folder draggable';
        click = "";
        editButton.setAttribute('data-editMode', 'enabled');
        editButton.innerHTML = 'Disable Edit Mode';

        // enable the url input
        urlInput.disabled = false;
        urlInput.setAttribute('placeholder', 'Click a folder to view/edit the URL');
      } else {
        // Disable the editing of folders and reflect changes with button
        className = 'folder';
        click = "navigate(assoc.guid)";
        editButton.innerHTML = 'Enable Edit Mode';
        editButton.setAttribute('data-editMode', 'disabled');

        // disable the url input and change text
        urlInput.disabled = true;
        urlInput.setAttribute('placeholder', 'Edit mode must be enabled to edit the background image of a folder');

      }

      for(var i = 0; i < folders.length; i++) {
          folders[i].className = className;
          folders[i].setAttribute('ng-click', click);
        }
  }

