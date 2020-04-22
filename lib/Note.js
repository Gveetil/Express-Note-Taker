
/** This class represents a Note */
class Note {
    /**
     * Creates an instance of a Note
     * @param {Number} id the Note Id as an integer
     * @param {String} title the Note title  
     * @param {String} text the Note text
     */
    constructor({ id, title, text }) {
        if (id == null) {
            // If Id is not specified, default to the next available note id
            this.id = Note.getNextId();
        }
        else {
            let noteId = parseInt(id);
            if (isNaN(noteId) || noteId <= 0) {
                // Invalid Id - throw an error
                throw new Error("Parameter 'id' has to be a positive number");
            }
            this.id = noteId;
        }
        this.title = (title == null) ? "" : title;
        this.text = (text == null) ? "" : text;
        Note.updateNextId(this.id);
    }
}

/** property keeps track of the current note id in use */
Note.maxNoteId = 0;

/** Check and update the current note id once it has been used */
Note.updateNextId = function (currentId) {
    if (Note.maxNoteId < currentId)
        Note.maxNoteId = currentId;
}

/** Gets the next available note id */
Note.getNextId = function () {
    return Note.maxNoteId + 1;
}

module.exports = Note;