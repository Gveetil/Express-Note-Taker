const fs = require("fs");
const path = require("path");
const Note = require("./Note");

// Path to the database folder and file
const databasePath = path.join(__dirname, "../db");
const databaseFile = path.join(databasePath, "db.json");

/** This class provides functionality to create, change and delete notes */
class NoteTaker {
    /** Loads notes into a static class variable when accessed for the first time */
    constructor() {
        if (NoteTaker.notes == undefined) {
            this.initializeNotes();
        }
    }

    /** Loads up the note objects from the database */
    initializeNotes() {
        NoteTaker.notes = [];
        if (fs.existsSync(databaseFile)) {
            const savedNotes = fs.readFileSync(databaseFile);
            let notes = JSON.parse(savedNotes, this.noteParser);
            if (notes != undefined) {
                NoteTaker.notes = notes;
            }
        }
    }

    /**
     * This method is used while parsing JSON from the database.
     * It converts a database object into an instances of the Note class. 
     * @param {string} key key being parsed
     * @param {object} value value being parsed
     * @returns {object} Note in case of objects, the value otherwise
     */
    noteParser(key, value) {
        // If the value being parsed is a note, return instance of Note object 
        if (typeof (value) == "object" && Array.isArray(value) == false) {
            return new Note(value);
        }
        return value;
    }

    /**
     * Creates or Updates a note based on the data passed in
     * @param {object} note object containing note data
     * @returns {boolean} true if successful
     */
    saveNote(note) {
        if (note.id == undefined) {
            // Create a new note
            return this.add(note);
        }
        // Update note
        const isUpdated = this.update(note);
        if (!isUpdated) {
            // Note was not found (i.e. was deleted by another user)
            // so create a new note instead
            note.id = null;
            return this.add(note);
        }
        return isUpdated;
    }

    /**
     * Adds a new note based on the data passed in
     * @param {object} note object containing note data
     * @returns {boolean} true if successful
     */
    add(note) {
        NoteTaker.notes.push(new Note(note));
        this.updateDatabase();
        return true;
    }

    /**
     * Updates a note based on the data passed in
     * @param {object} note object containing note data
     * @returns {boolean} true if successful
     */
    update(note) {
        let selectedIndex = this.findIndexOf(note.id);
        if (selectedIndex >= 0) {
            // Note found - update details
            NoteTaker.notes[selectedIndex].title = note.title;
            NoteTaker.notes[selectedIndex].text = note.text;
            this.updateDatabase();
            return true;
        }
        return false;
    }

    /**
     * Finds and returns the index of a given note
     * @param {object} id the id of the note to be found 
     * @returns {number} index of the note
     */
    findIndexOf(id) {
        let noteId = parseInt(id);
        if (noteId == null || isNaN(noteId) || noteId <= 0) {
            // Invalid Id - throw an error
            throw new Error("Parameter 'id' has to be a positive number");
        }
        return NoteTaker.notes.findIndex(element => element.id === noteId);
    }

    /**
     * Deletes a note based on the note id 
     * @param {object} id the id of the note to delete
     * @returns {boolean} true if successful
     */
    deleteNoteById(id) {
        let selectedIndex = this.findIndexOf(id);
        if (selectedIndex >= 0) {
            // Note Found - delete and save
            NoteTaker.notes.splice(selectedIndex, 1);
            this.updateDatabase();
            return true;
        }
        return false;
    }

    /**
     * Gets a list of all saved notes
     * @returns {Array<Note>} an array of note objects
     */
    getNotes() {
        return [...NoteTaker.notes];
    }

    /** Saves the notes array into the database file */
    updateDatabase() {
        // Create db folder if it doesn't exist
        if (!fs.existsSync(databasePath))
            fs.mkdirSync(databasePath);
        const jsonNotes = JSON.stringify(NoteTaker.notes, null, 2);
        fs.writeFileSync(databaseFile, jsonNotes);
    }
}

module.exports = new NoteTaker();
