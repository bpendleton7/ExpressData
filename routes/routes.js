const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb+srv://user:pass@cluster0.zylfw.mongodb.net/Users?retryWrites=true&w=majority', {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

let mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'connection error'));
mdb.once('open', callback => {

});

let userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    password: String,
    email: String,
});

let User = mongoose.model('User_Collection', userSchema);

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
                username: user.username
            }
            console.log(`User: "${req.body.username}" was authenticated.`);
            //Once logged in redirect to this page
            res.redirect('/play');
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
        script_src: 'create.js'
    })
}

// Creating user in the database
exports.createUser = async (req, res) => {
    let dbUser = await User.findOne({ username: req.body.username });
 
    if (dbUser == null) {

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);
        let user = new User({
            firstName: req.body.fname,
            lastName: req.body.lname,
            username: req.body.username,
            password: hash,
            email: req.body.email,
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