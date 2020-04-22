const express = require("express");
const path = require("path");

const PORT = process.env.PORT || 3000;
const noteServer = express();

// Configure server to handle data parsing
noteServer.use(express.urlencoded({ extended: true }));
noteServer.use(express.json());

// Configure static assets folder for access to css / js files
noteServer.use('/assets', express.static(path.join(__dirname, 'public/assets')))

// Start the server 
noteServer.listen(PORT, function () {
    console.log(`Note Taker Application listening on Port: ${PORT}`);
});

// include file to handle data requests and processing 
require("./routes/apiRoutes")(noteServer);
// include file to handle all html request routing
require("./routes/htmlRoutes")(noteServer);
