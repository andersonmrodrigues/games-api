const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const JWTSecret = "kYJynZEA2BdaBK";

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//middleware
function auth(req, res, next) {
  const authToken = req.headers["authorization"];
  console.log(authToken);
  if (authToken != undefined) {
    const bearer = authToken.split(" ");
    const token = bearer[1];
    jwt.verify(token, JWTSecret, (err, data) => {
      if (err) {
        res.status(401);
        res.json("Invalid Token");
      } else {
        req.token = token;
        req.loggedUser = { id: data.id, email: data.email };
        next();
      }
    });
  } else {
    res.status(401);
    res.json("Invalid Token");
  }
}

var DB = {
  games: [
    {
      id: 23,
      title: "Call of Duty MW",
      year: 2018,
      price: 40,
    },
    {
      id: 2,
      title: "Sea of Thieves",
      year: 2019,
      price: 60,
    },
    {
      id: 3,
      title: "Minecraft",
      year: 2012,
      price: 20,
    },
  ],
  users: [
    {
      id: 1,
      name: "Anderson Rodrgues",
      email: "anderson@email.com",
      password: "1234",
    },
    {
      id: 2,
      name: "Roger Rodrgues",
      email: "roger@email.com",
      password: "1234",
    },
  ],
};

app.get("/games", auth, (req, res) => {
  res.statusCode = 200;
  res.json(DB.games);
});

app.get("/game/:id", auth, (req, res) => {
  if (isNaN(req.params.id)) {
    res.sendStatus(400);
  } else {
    var game = DB.games.find((data) => data.id === parseInt(req.params.id));
    if (game === undefined) {
      res.sendStatus(404);
    } else {
      res.statusCode = 200;
      res.json(game);
    }
  }
});

app.post("/game", auth, (req, res) => {
  var { title, price, year } = req.body;

  var nextId = DB.games[DB.games.length - 1].id + 1;

  var game = {
    id: nextId,
    title: title,
    price: price,
    year: year,
  };

  DB.games.push(game);

  res.sendStatus(200);
});

app.delete("/game/:id", auth, (req, res) => {
  if (isNaN(req.params.id)) {
    res.sendStatus(400);
  } else {
    var index = DB.games.findIndex(
      (data) => data.id === parseInt(req.params.id)
    );
    if (index === -1) {
      res.sendStatus(404);
    } else {
      DB.games.splice(index, 1);
      console.log(DB.games);
      res.sendStatus(200);
    }
  }
});

app.patch("/game/:id", auth, (req, res) => {
  if (isNaN(req.params.id)) {
    res.sendStatus(400);
  } else {
    var game = DB.games.find((data) => data.id === parseInt(req.params.id));
    if (game === undefined) {
      res.sendStatus(404);
    } else {
      var { title, price, year } = req.body;
      if (title != undefined) {
        game.title = title;
      }
      if (price != undefined) {
        game.price = price;
      }
      if (year != undefined) {
        game.year = year;
      }
      console.log(DB.games);
      res.sendStatus(200);
    }
  }
});

app.post("/auth", (req, res) => {
  var { email, password } = req.body;
  if (email === undefined || password === undefined) {
    res.sendStatus("400");
  }
  var user = DB.users.find((user) => user.email === email);
  if (user === undefined) {
    res.status(404);
    res.json({
      err: "E-mail not found in database",
    });
  } else if (user != undefined && user.password != password) {
    res.status(401);
    res.json({
      err: "Invalid crendetials",
    });
  } else {
    jwt.sign(
      {
        email: user.email,
        id: user.id,
      },
      JWTSecret,
      {
        expiresIn: "48h",
      },
      (err, token) => {
        if (err) {
          console.log(err);
        } else {
          res.status(200);
          res.json({
            token: token,
          });
        }
      }
    );
  }
});

app.listen(8080, () => {
  console.log("SERVER Up!");
});
