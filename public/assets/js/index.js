var $noteTitle = $(".note-title");
var $noteText = $(".note-textarea");
var $saveNoteBtn = $(".save-note");
var $undoNoteBtn = $(".undo-note");
var $newNoteBtn = $(".new-note");
var $noteList = $(".list-container .list-group");
var $noteTakerLink = $(".note-taker-link");
var $modalDialog = $(".modal");
var $modalDialogOkBtn = $(".modal-dialog-ok");
var $modalDialogCancelBtn = $(".modal-dialog-cancel");
var $modalDialogText = $(".modal-text");

// Validation messages and modal dialog buttons
const changesNotSavedMessage = "Changes made to this note have not been saved. <br>Do you wish to proceed without saving ?";
const dataValidationMessage = "Please enter a valid Note Title and Text!";
const ModalButtonType = { OkCancel: 1, Close: 2 };

// activeNote is used to keep track of the note in the textarea
var activeNote = {};

// A function for getting all notes from the db
var getNotes = function () {
  return $.ajax({
    url: "/api/notes",
    method: "GET"
  });
};

// A function for saving a note to the db
var saveNote = function (note) {
  return $.ajax({
    url: "/api/notes",
    data: note,
    method: "POST"
  });
};

// A function for deleting a note from the db
var deleteNote = function (id) {
  return $.ajax({
    url: "/api/notes/" + id,
    method: "DELETE"
  });
};

// If there is an activeNote, display it, otherwise render empty inputs
var renderActiveNote = function () {
  if (activeNote.id) {
    $noteTitle.val(activeNote.title);
    $noteText.val(activeNote.text);
  } else {
    $noteTitle.val("");
    $noteText.val("");
  }
  updateButtonDisplay();
};

// Load original note data to undo changes to it
var handleNoteUndo = function () {
  renderActiveNote();
}

// Validate and save note to the db, and update the view
var handleNoteSave = function () {
  // If title / text are empty -- show validation message
  if (!$noteTitle.val().trim() || !$noteText.val().trim()) {
    showModalDialog(dataValidationMessage, ModalButtonType.Close);
    return;
  }

  console.log("saving ...");
  var newNote = {
    title: $noteTitle.val(),
    text: $noteText.val()
  };
  if (activeNote.id) {
    newNote.id = activeNote.id;
  }
  saveNote(newNote).then(function (data) {
    activeNote = {};
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Delete the clicked note
var handleNoteDelete = function (event, validate = true) {

  // prevents the click listener for the list from being called when the button inside of it is clicked
  if (event) event.stopPropagation();

  if (validate && !validateForm("handleNoteDelete", this))
    return;

  var note = $(this)
    .parent(".list-group-item")
    .data();

  if (activeNote.id === note.id) {
    activeNote = {};
  }

  deleteNote(note.id).then(function () {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Load selected note for viewing and editing
var handleNoteView = function (_, validate = true) {
  if (validate && !validateForm("handleNoteView", this))
    return;
  activeNote = $(this).data();
  renderActiveNote();
};

// Create a new note for the user 
var handleNewNoteView = function (_, validate = true) {
  if (validate && !validateForm("handleNewNoteView", this))
    return;
  activeNote = {};
  renderActiveNote();
};

// Check for unsaved data before navigating to the link
var handleNoteTakerLink = function (event, validate = true) {
  if (event) event.preventDefault();
  if (validate && !validateForm("handleNoteTakerLink", this)) {
    return;
  }
  window.location = $(this).href;
};

// This function is executed when the ok button is clicked on the modal dialog 
// It fetches the last operation details saved on the ok button and executes it
var handleModalOkBtn = function () {
  $modalDialog.modal('hide');
  // Retrieve function name to be executed and the 'this' context from the ok button's data 
  let target = $modalDialogOkBtn.data("function");
  let data = $modalDialogOkBtn.data("context");
  if (typeof window[target] == "function") {
    // Execute function with context and send the 'validate' parameter as false to skip re-validation
    window[target].call(data, null, false);
  }
};

// Check for unsaved data and display a modal dialog prompting the user to save changes
var validateForm = function (callingFunction, data) {
  if (isNoteUpdated()) {
    // Save last method call and context into the ok button's data so it can be accessed later
    // This is required since the modal dialog displays asynchronously 
    $modalDialogOkBtn.data("function", callingFunction);
    $modalDialogOkBtn.data("context", data);
    showModalDialog(changesNotSavedMessage, ModalButtonType.OkCancel);
    return false;
  }
  return true;
};

// Displays a modal dialog asynchronously with the given message and button type
var showModalDialog = function (message, buttonType) {
  console.log(message);
  $modalDialogText.html(message);
  if (buttonType == ModalButtonType.OkCancel) {
    // Show Ok Cancel Buttons
    $modalDialogOkBtn.show();
    $modalDialogCancelBtn.text("Cancel");
  } else {
    // Close button is shown by default
    $modalDialogOkBtn.hide();
    $modalDialogCancelBtn.text("Close");
  }
  $modalDialog.modal('show');
}

// Check if the note has updates on it and show / hide save and undo button
var updateButtonDisplay = function () {
  if (isNoteUpdated()) {
    $saveNoteBtn.show();
    $undoNoteBtn.show();
  } else {
    $undoNoteBtn.hide();
    $saveNoteBtn.hide();
  }
}

// Checks if the current note has unsaved changes 
var isNoteUpdated = function () {
  if (activeNote.id == undefined) {
    // New Note
    return ($noteTitle.val() != "" ||
      $noteText.val() != "")
  }

  // Edited Note
  return (activeNote.title != $noteTitle.val() ||
    activeNote.text != $noteText.val());
}

// Render's the list of note titles
var renderNoteList = function (notes) {
  $noteList.empty();
  var noteListItems = [];

  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];

    var $li = $("<li class='list-group-item'>").data(note);
    var $span = $("<span>").text(note.title);
    var $delBtn = $(
      "<i class='fas fa-trash-alt float-right text-danger delete-note'>"
    );

    $li.append($span, $delBtn);
    noteListItems.push($li);
  }

  $noteList.append(noteListItems);
};

// Gets notes from the db and renders them to the sidebar
var getAndRenderNotes = function () {
  return getNotes().then(function (data) {
    renderNoteList(data);
  });
};

//Event Handlers
$saveNoteBtn.on("click", handleNoteSave);
$undoNoteBtn.on("click", handleNoteUndo);
$noteList.on("click", ".list-group-item", handleNoteView);
$newNoteBtn.on("click", handleNewNoteView);
$noteList.on("click", ".delete-note", handleNoteDelete);
$noteTitle.on("keyup", updateButtonDisplay);
$noteText.on("keyup", updateButtonDisplay);
$modalDialogOkBtn.on("click", handleModalOkBtn);
$noteTakerLink.on("click", handleNoteTakerLink)

// Gets and renders the initial list of notes
getAndRenderNotes();
