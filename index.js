const express = require("express"),
    uuid = require("uuid"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    Models = require("./models.js");

    const app = express();

    const Movies = Models.Movie;
    const Users = Models.User;


mongoose.connect('mongodb://127.0.0.1:27017/myFlix', { useNewUrlParser: true, useUnifiedTopology: true });

const cors = require(cors);
app.use(cors);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');




// GET requests

//Get all users
app.get("/users", (req, res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error' + err);
  });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//returns a JSON object containing data about movies
app.get("/movies", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error' + err);
    });
});

//READ
app.get("/movies/:Title", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({Title: req.params.Title}) 
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//READ
app.get("/movies/genre/:genreName", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({'Genre.Name': req.params.genreName}) 
  .then((movies) => {
    res.json(movies);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//READ
app.get("/movies/directors/:directorName", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({'Director.Name': req.params.directorName}) 
  .then((movies) => {
    res.json(movies);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get("/", passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send("Welcome to myFlix Movies!");
});


//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }).then((updatedUser) => {
    res.json(updatedUser);
   }).catch((err) => {
    console.error(err);
      res.status(500).send('Error: ' + err);
   });
  });

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }).then((updatedUser) => {
    res.json(updatedUser);
   }).catch((err) => {
    console.error(err);
      res.status(500).send('Error: ' + err);
   });
  });

// Delete a movie to a user's list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }).then((updatedUser) => {
    res.json(updatedUser);
   }).catch((err) => {
    console.error(err);
      res.status(500).send('Error: ' + err);
   });
  }); 
  
  
// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
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
