const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser'); // added body-parser

// Define a simple users object
const users = [
    { id: '1', username: 'user1', password: 'password1' },
    { id: '2', username: 'user2', password: 'password2' }
];

// Set up the Passport Local Strategy
passport.use(new LocalStrategy(
    (username, password, done) => {
        const user = users.find((user) => user.username === username && user.password === password);
        if (!user) {
            console.log('Invalid username or password');
            return done(null, false, { message: 'Invalid username or password' });
        }
        console.log('Authenticated user:', user);
        return done(null, user);
    }
));

// Set up Passport's session serialization and deserialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = users.find((user) => user.id === id);
    if (!user) {
        return done(new Error('User not found'));
    }
    return done(null, user);
});

// Set up the Express app
const app = express();

// Enable sessions and passport authentication middleware
app.use(require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: false })); // added body-parser
app.use(passport.initialize());
app.use(passport.session());

// Define a route to handle login
app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

// Define a route to handle logout
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// Define a route to display the dashboard
app.get('/dashboard', (req, res) => {
    if (!req.user) {
        res.redirect('/login');
    } else {
        res.send(`Welcome, ${req.user.username}! <a href="/logout">Log out</a>`);
    }
});

// Define a route to display the login form
app.get('/login', (req, res) => {
    res.send(`
    <form method="post" action="/login">
      <input type="text" name="username" placeholder="Username" /><br />
      <input type="password" name="password" placeholder="Password" /><br />
      <input type="submit" value="Log in" />
    </form>
  `);
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
