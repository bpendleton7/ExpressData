const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/data', {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

let mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'connection error'));
mdb.once('open', callback => {

});

/**
 * correct is the index of the correct answer
 * @typedef {{question: string, responses: string[], correct: number}} Question
 */

const scheme = {
    username: String,
    password: String,
    email: String,
    age: Number,
    questions: []
};

let userSchema = new mongoose.Schema(scheme);

let User = mongoose.model('users', userSchema);

exports.index = (req, res) => {
    let today = new Date();
    let date = `${today.getMonth()}-${today.getDate()}-${today.getFullYear()}     ${(today.getHours() + 24) % 12 || 12}:${today.getMinutes()}:${today.getSeconds()}`

    let displayDate = '';
    if (req.cookies.lastVisit) {
        displayDate = `Last Visited: ${req.cookies.lastVisit}`;
    } else {
        displayDate = `Welcome!`
    }

    res.cookie('lastVisit', date, { maxAge: 999999999999 });
    res.render('index', {
        title: 'Home',
        lastVisitedTime: displayDate,
        isLoggedIn: req.session.isLoggedIn,
        user: req.session.user
    });
}

// LOGIN page
exports.login = (req, res) => {
    res.render('login', {
        title: 'Login',
        icon_href: '/images/login.png',
        css_href: '/login.css'
    });
};

// Check user info against the database
exports.verifyLogin = async (req, res) => {
    // ******* THIS IS WHERE WE SHOULD CHECK AGAINST THE DATABASE TO CHECK IF THE USER EXISTS AND THE PASSWORD MATCHES *******
    // instead of req.body.user === 'user' &&...     it would be some thing like req.body.user exists in the database && the password matches that is in the database

    let user = await User.findOne({ username: req.body.username });
    if (user == null) {
        res.redirect('/login');
        console.log(`*Username: "${req.body.username}" not found in database.*`);
    } else {
        let validPassword = await bcrypt.compare(req.body.password, user.password);
        if (validPassword) {
            // once user and pass are verified then we create a session with any key:value pair we want, which we can check for later
            req.session.user = {
                isAuthenticated: true,
                username: user.username,
                questions: user.questions
            }
            console.log(`User: "${req.body.username}" was authenticated.`);
            //Once logged in redirect to this page
            res.redirect('/update');
        } else {
            res.redirect('/login');
            console.log(`*Failed to log in, user "${req.body.username}" entered the wrong password.`);
        }

    }
}

// CREATE page
exports.create = (req, res) => {
    res.render('create', {
        title: 'Create Account',
        icon_href: '/images/create.png',
        css_href: '/create.css',
        script_src: 'create.js',
        questions: [
            {
              "question": "Which of the following is the oldest of these computers by release date?",
              "answers": [
                "TRS-80",
                "Commodore 64",
                "ZX Spectrum",
                "Apple 3"
              ]
            },
            {
              "question": "Who became Prime Minister of the United Kingdom in July 2016?",
              "answers": [
                "Theresa May",
                "Boris Johnson",
                "David Cameron",
                "Tony Blair"
              ]
            },
            {
              "question": "Who created the \"Metal Gear\" Series?",
              "answers": [
                "Hideo Kojima",
                "Hiroshi Yamauchi",
                "Shigeru Miyamoto",
                "Gunpei Yokoi"
              ]
            }
          ]
    })
}
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.updateUser = async (req, res) => {
    console.log(req.session.user);
    User.updateOne({_id: req.body.username}, {...req.body}, (err, raw) => {
        if(err) {
            console.error(err);
        }
        res.sendStatus(200);
    })
}

//Update page
exports.update = (req, res) => {
    res.render('update', {
        title: 'Update',
        icon_href: '/images/update.png',
        css_href: '/update.css'
    });
};

// Creating user in the database
exports.createUser = async (req, res) => {
    let dbUser = await User.findOne({ username: req.body.username });
 
    if (dbUser == null) {

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);
        let questions = [];
        for(let i = 0; i < 3; i++) {
            let question = JSON.parse(req.body['obj-question'+i]);
            question.answer = req.body['question'+i];
            questions.push(question);
        }

        let user = new User({
            firstName: req.body.fname,
            lastName: req.body.lname,
            username: req.body.username,
            password: hash,
            email: req.body.email,
            questions: questions
        });
        user.save((err, user) => {
            if (err) return console.error(err);
            console.log(user.firstName + ' added');
        });
        res.redirect('/login');
    } else {
        res.render('create', {
            title: 'Create Account',
            icon_href: '/images/create.png',
            css_href: '/create.css',
            script_src: 'create.js',
            UsernameExists: `*Username: "${req.body.username}" already exists. Please choose a new username.*`
        });
        console.log(`*Username: "${req.body.username}" already exists.*`);
    }
};