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

apiRoutes.post('/authenticate', (req, res, next) => {
    User.findOne(
        {
            name: req.body.name,
        }
    ).then(user => {
        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found' });
        }
        else if (user.password !== req.body.password){
            res.json({ success: false, message: 'Authentication failed. Wrong password'});
        }
        else {
            const payload = {
                admin: user.admin
            }
            let token = jwt.sign(payload, app.get('superSecret'), {
                expiresIn: 1440
            });

            res.json({
                success: true,
                message: '--Here is your token---',
                token: token
            });
        }
    })
    .catch(err => {throw err});
});

apiRoutes.use((req, res, next) => {
    let token = req.body.token || req.params.token || req.headers['x-access-token'];
    console.log(token);

    if (token){
        jwt.verify(token, app.get('superSecret'))
        .then(decoded => {
            req.decoded = decoded;
            return next();
        })
        .catch(err => res.status(403).json({
            success: false,
            message: 'No token provided'
        }));
    }
    else{
        res.json({
            success: false,
            message: 'No token was provided',
        })
    }
})

apiRoutes.get('/', (req, res, next) => {
    res.json({ message: 'Authenticating a node api with json web token' });
});

apiRoutes.get('/users', (req, res, next) => {
    User.find({})
        .then(result => res.json(result))
        .catch(err => res.json({ error: err }))
});

app.use('/api', apiRoutes);

app.listen(8000, console.log('Magic happens at http://localhost:8000'));