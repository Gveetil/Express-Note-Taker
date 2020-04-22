const NoteTaker = require("../lib/NoteTaker");

/**
 * This module handles server data requests and processing for the note taker application 
 * @param {Express} noteServer the express server object 
 */
function processDataRequests(noteServer) {
    // JSON containing list of all note objects in the database 
    noteServer.get("/api/notes", (request, response) => {
        response.json(NoteTaker.getNotes());
    });

    // Saves a new note / updates an existing note based on the JSON Note object recieved
    noteServer.post("/api/notes", (request, response) => {
        let result = NoteTaker.saveNote(request.body);
        response.send(result);
    });

    // Deletes a note based on the note id passed in 
    noteServer.delete("/api/notes/:id", (request, response) => {
        let result = NoteTaker.deleteNoteById(request.params.id);
        response.send(result);
    });
}

module.exports = processDataRequests;