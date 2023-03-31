const express = require("express"),
    morgan = require("morgan"),
    fs = require("fs"), // import built in node modules fs and path
    path = require("path");

const app = express();

//create a list of top movies
let topMovies = [];

let movies = [
    {
        title: "The Godfather",
        director: "Francis Ford Coppola",
        genre: "Crime",
        year: 1972,
    },
    {
        title: "Pulp Fiction",
        director: "Quentin Tarantino",
        genre: "Crime",
        year: 1994,
    },
    {
        title: "Titanic",
        director: "James Cameron",
        genre: "Romance",
        year: 1997,
    },
    {
        title: "The Shawshank Redemption",
        director: "Frank Darabont",
        genre: "Drama",
        year: 1994,
    },
    {
        title: "Inception",
        director: "Christopher Nolan",
        genre: "Sci-Fi",
        year: 2010,
    },
    {
        title: "The Dark Knight",
        director: "Christopher Nolan",
        genre: "Action",
        year: 2008,
    },
    {
        title: "Forrest Gump",
        director: "Robert Zemeckis",
        genre: "Drama",
        year: 1994,
    },
    {
        title: "The Lion King",
        director: "Jon Favreau",
        genre: "Animation",
        year: 1994,
    },
    {
        title: "The Matrix",
        director: "Lilly Wachowski",
        genre: "Sci-Fi",
        year: 1999,
    },
    {
        title: "Jurassic Park",
        director: "Steven Spielberg",
        genre: "Adventure",
        year: 1993,
    },
    {
        title: "Indiana Jones and the Raiders of the Lost Ark",
        director: "Steven Spielberg",
        genre: "Adventure",
        year: 1981,
    },
];

// create a write stream (in append mode)
//a 'log.txt' file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
    flags: "a",
});

//Use the Morgan middleware library to log all requests
app.use(morgan("combined", { stream: accessLogStream }));

// GET requests
//returns a JSON object containing data about your top 10 movies
app.get("/movies", (req, res) => {
    for (let i = 0; i < 10; i++) {
        topMovies.push(movies[i]);
    }
    res.json(topMovies);
});

app.get("/documentation", (req, res) => {
    res.sendFile("/documentation.html", { root: __dirname });
});

app.get("/", (req, res) => {
    res.send("Welcome to myFlix Movies!");
});

//express.static to serve your “documentation.html” file from the public folder
app.use(express.static("./public"));

//error-handling middleware function that will log all application-level errors to the terminal
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

// listen for requests
app.listen(8080, () => {
    console.log("Your app is listening on port 8080.");
});
