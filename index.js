/**
 * @module index
 * @description This is the main module of this application which holds all the API calls
 */
const express = require("express"),
    uuid = require("uuid"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Models = require("./models.js");

const app = express();

const Movies = Models.Movie;
const Users = Models.User;

//connect API to mongoose DB
mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const cors = require("cors");
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

const { check, validationResult } = require("express-validator");

// GET requests

//Get all users
/**
 * @description Get all users
 * @name GET /users
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * none
 * @example
 * Response data format
 * [
 *   {
 *     _id: ObjectID
 *     "Username": "",
 *     "Password": "",
 *     "Email": "",
 *     "Birthday": Date,
 *     "FavoriteMovies": [ObjectID],
 *   }
 * ]
 */
app.get("/users", (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error" + err);
        });
});

// Get a user by username
/**
 * @description Get a user by username
 * @name GET /users/:username
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * none
 * @example
 * Response data format
 *   {
 *     _id: ObjectID
 *     "Username": "",
 *     "Password": "",
 *     "Email": "",
 *     "Birthday": Date,
 *     "FavoriteMovies": [ObjectID],
 *   }
 */
app.get(
    "/users/:Username",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Users.findOne({ Username: req.params.Username })
            .then((user) => {
                res.json(user);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error: " + err);
            });
    }
);

//returns a JSON object containing data about movies
/**
 * @description Get all movies
 * @name GET /movies
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * none
 * @example
 * Response data format
 * [
 *   {
 *     _id: ObjectID
 *     "Title": "",
 *     "Description": "",
 *     "Genre": ObjectID,
 *     "Director": ObjectID,
 *     "Actors": [ObjectID],
 *     "ImagePath": "",
 *     "Featured": Boolean,
 *   }
 * ]
 */
app.get(
    "/movies",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Movies.find()
            .then((movies) => {
                res.status(201).json(movies);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error" + err);
            });
    }
);

//READ
/**
 * @description Get a movie by title
 * @name GET /movies/:Title
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * none
 * @example
 * Response data format
 * {
 *   _id: ObjectID
 *   "Title": "",
 *   "Description": "",
 *   "Genre": ObjectID,
 *   "Director": [ObjectID],
 *   "Actors": [ObjectID],
 *   "ImagePath": "",
 *   "Featured": Boolean,
 * }
 */
app.get(
    "/movies/:Title",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Movies.findOne({ Title: req.params.Title })
            .then((movie) => {
                res.json(movie);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error: " + err);
            });
    }
);

//READ
/**
 * @description Get details of a movie genre
 * @name GET /movies/:Genre/:Genre.Name
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * none
 * @example
 * Response data format
 * {
 *   "Name": "",
 *   "Description": "",
 * }
 */
app.get(
    "/movies/genre/:genreName",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Movies.find({ "Genre.Name": req.params.genreName })
            .then((movies) => {
                res.json(movies);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error: " + err);
            });
    }
);

//READ
/**
 * @description Get details of a movie genre
 * @name GET /movies/:Genre/:Genre.Name
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * none
 * @example
 * Response data format
 * {
 *   "Name": "",
 *   "Bio": "",
 *   "Birth": Date
 * }
 */
app.get(
    "/movies/directors/:directorName",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Movies.find({ "Director.Name": req.params.directorName })
            .then((movies) => {
                res.json(movies);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error: " + err);
            });
    }
);

/**
 * @description Navigate to the user registration page
 * @name GET /
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 * none
 * @example
 * Response data format
 * none
 */
app.get("/", (req, res) => {
    res.send("Welcome to myFlix Movies!");
});

//Add a user
/**
 * @description Get a user by username
 * @name POST /users/:username
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 {
 *     _id: ObjectID
 *     "Username": "",
 *     "Password": "",
 *     "Email": "",
 *     "Birthday": Date,
 *   }
 * @example
 * Response data format
 *   {
 *     _id: ObjectID
 *     "Username": "",
 *     "Password": "",
 *     "Email": "",
 *     "Birthday": Date,
 *     "FavoriteMovies": [ObjectID],
 *   }
 */

app.post(
    "/users",
    // Validation logic here for request
    //you can either use a chain of methods like .not().isEmpty()
    //which means "opposite of isEmpty" in plain english "is not empty"
    //or use .isLength({min: 5}) which means
    //minimum value of 5 characters are only allowed
    [
        check(
            "Username",
            "Minimum number of 5 characters for Username is required"
        ).isLength({ min: 5 }),
        check(
            "Username",
            "Username contains non alphanumeric characters - not allowed."
        ).isAlphanumeric(),
        check("Password", "Minimum number of 5 characters for Password is required")
            .not()
            .isEmpty(),
        check("Email", "Email does not appear to be valid").isEmail(),
    ],
    (req, res) => {
        // check the validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
            .then((user) => {
                if (user) {
                    //If the user is found, send a response that it already exists
                    return res
                        .status(400)
                        .send(req.body.Username + " already exists");
                } else {
                    Users.create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday,
                    })
                        .then((user) => {
                            res.status(201).json(user);
                        })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send("Error: " + error);
                        });
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send("Error: " + error);
            });
    }
);

// Update a user's info, by username
/**
 * @description Update a user
 * @name PUT /users/:UserName
 * @example
 * Authentication: Bearer token (JWT)
 * Request data format
 * {
 *  "Username": "",
 *  "Password": "",
 *  "Email": "",
 *  "Birthday:" ""
 * }
 * @example
 * Response data format
 * {
 *   "_id": ObjectID,
 *   "FirstName": ""
 *   "LastName": ""
 *   "Username": "",
 *   "Password": "",
 *   "Email": "",
 *   "Birthday": "",
 *   "FavoriteMovies": [ObjectID]
 * }
 */
app.put(
    "/users/:Username",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Users.findOneAndUpdate(
            { Username: req.params.Username },
            {
                $set: {
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday,
                },
            },
            { new: true }
        )
            .then((updatedUser) => {
                res.json(updatedUser);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error: " + err);
            });
    }
);

// Add a movie to a user's list of favorites
/**
 * @description Add movie to list of favourites
 * @name POST /users/:username/:movies/:movieID
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 *     _id: ObjectID
 * @example
 * Response data format
 *   {
 *     _id: ObjectID
 *     "Username": "",
 *     "Password": "",
 *     "Email": "",
 *     "Birthday": Date,
 *     "FavoriteMovies": [ObjectID],
 *   }
 */
app.post(
    "/users/:Username/movies/:MovieID",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Users.findOneAndUpdate(
            { Username: req.params.Username },
            {
                $push: { FavoriteMovies: req.params.MovieID },
            },
            { new: true }
        )
            .then((updatedUser) => {
                res.json(updatedUser);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error: " + err);
            });
    }
);

// Delete a movie to a user's list of favorites
/**
 * @description Delete movie to list of favourites
 * @name DELETE /users/:username/:movies/:movieID
 * @example
 * Authentication: Bearer token (JWT)
 * @example
 * Request data format
 *     _id: ObjectID
 * @example
 * Response data format
 *   {
 *     _id: ObjectID
 *     "Username": "",
 *     "Password": "",
 *     "Email": "",
 *     "Birthday": Date,
 *     "FavoriteMovies": [ObjectID],
 *   }
 */
app.delete(
    "/users/:Username/movies/:MovieID",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Users.findOneAndUpdate(
            { Username: req.params.Username },
            {
                $pull: { FavoriteMovies: req.params.MovieID },
            },
            { new: true }
        )
            .then((updatedUser) => {
                res.json(updatedUser);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error: " + err);
            });
    }
);

// Delete a user by username
/**
 * @description Delet a user
 * @name PUT /users/:UserName
 * @example
 * Authentication: Bearer token (JWT)
 * Request data format
 * {
 *     _id: ObjectID
 *     "Username": "",
 *     "Password": "",
 *     "Email": "",
 *     "Birthday": Date,
 *     "FavoriteMovies": [ObjectID],
 *   }
 * @example
 * Response data format
 * none
 */
app.delete(
    "/users/:Username",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Users.findOneAndRemove({ Username: req.params.Username })
            .then((user) => {
                if (!user) {
                    res.status(400).send(
                        req.params.Username + " was not found"
                    );
                } else {
                    res.status(200).send(req.params.Username + " was deleted.");
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error: " + err);
            });
    }
);

//express.static to serve your “documentation.html” file from the public folder
app.use(express.static("./public"));

//error-handling middleware function that will log all application-level errors to the terminal
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
    console.log("Listening on Port " + port);
});
