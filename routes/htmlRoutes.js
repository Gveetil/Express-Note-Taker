const path = require("path");

/**
 * This module handles routing of html page requests for the note taker application 
 * @param {Express} noteServer the express server object 
 */
function processHtmlRoutes(noteServer) {
    // Notes route 
    noteServer.get("/notes", (request, response) => {
        response.sendFile(path.join(__dirname, "../public/notes.html"));
    });

    // For all other routes, redirect to the note taker home page by default
    noteServer.get("*", (request, response) => {
        response.sendFile(path.join(__dirname, "../public/index.html"));
    });

}

module.exports = processHtmlRoutes;