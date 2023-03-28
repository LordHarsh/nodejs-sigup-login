const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

const app = express();
app.use(express.json());

// Route for serving the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });

// Signup route
app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  const user = new User({ email, password });
  user.save((err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error signing up');
    } else {
      res.status(200).send('Signup successful');
    }
  });
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error logging in');
    } else if (!user) {
      res.status(401).send('User not found');
    } else {
      user.comparePassword(password, (err, isMatch) => {
        if (isMatch && !err) {
          const token = jwt.sign({ email }, 'SECRET_KEY', { expiresIn: '1h' });
          res.status(200).json({ token });
        } else {
          res.status(401).send('Incorrect password');
        }
      });
    }
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
