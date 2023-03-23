//import the http module
const http = require("http"),
    fs = require("fs"),
    url = require("url");

//Create a request handler to handle requests and responses from web server
http.createServer((request, response) => {
    let addr = request.url,
        q = url.parse(addr, true),
        filePath = "";

    //use the fs module to log both the request URL  and a timestamp to the “log.txt” file
    fs.appendFile(
        "log.txt",
        "URL: " + addr + "\nTimestamp: " + new Date() + "\n\n",
        (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Added to log.");
            }
        }
    );

    if (q.pathname.includes("documentation")) {
        filePath = __dirname + "/documentation.html";
    } else {
        filePath = "index.html";
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }

        response.writeHead(200, { "Content-Type": "text/html" });
        response.write(data);
        response.end();
    });
    //add port for server to listen for requests on port 8080
}).listen(8080);
console.log("My test server is running on Port 8080.");
