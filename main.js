const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const config = require('./config');
const User = require('./app/models/user')

mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', (req, res, next) => {
    res.send('Hello! The api is at http://localhost:8000/api');
});

app.get('/setup', (req, res, next) => {
    let nick = new User(
        {
            name: 'Neelesh Dwivedi',
            password: 'hellonode',
            admin: true,
        }
    );

    nick.save()
        .then(result => res.json({ message: 'user saved successfully!!' }))
        .catch(err => console.log(err));
});

const apiRoutes = express.Router();

apiRoutes.get('/', (req, res, next) => {
    res.json({ message: 'Authenticating a node api with json web token' });
});

apiRoutes.get('/users', (req, res, next) => {
    User.find({})
        .then(result => res.json(result))
        .catch(err => res.json({ error: err }))
})

app.use('/api', apiRoutes);

app.listen(8000, console.log('Magic happens at http://localhost:8000'));