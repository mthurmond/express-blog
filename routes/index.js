const express = require('express'); 
const router = express.Router(); 

// hook up db
const { Sequelize } = require('../db'); // automatically pulls in index.js file
const db = require('../db'); 
const { Post } = db.models;
const { User } = db.models;

db.sequelize.sync({ force: true }); // creates db and table(s)

const loginCheck = function (req, res, next) {
    if (req.session && req.session.userId) {
        return next()
    } else {
        let err = new Error('You must be logged in to perform this action.'); 
        err.status = 401; 
        return next(err);
    }
};

// GET /register
router.get('/register', (req, res) => {
    res.render('register', { }); 
}); 

// POST /register
router.post('/register', async (req, res) => {
    const user = await User.create(req.body); 
    res.redirect('/'); 
}); 

// GET /login
router.get('/login', (req, res) => {
    res.render('login', { }); 
}); 

// POST /login
router.post('/login', async (req, res, next) => { 
    const user = await User.findOne({where: {email: req.body.email}}); 
    const passwordMatch = await user.checkPasswordMatch(req.body.password, user.password);
    if (passwordMatch) {
        req.session.userId = user.id;
        res.redirect('/');
    } else {
        let err = new Error('Passwords do not match');
        err.status = 401;
        next(err); 
    }
}); 

// GET /logout
router.get('/logout', function(req, res, next) {
    req.session.destroy();
    return res.redirect('/'); 
});  

// GET /
router.get('/', async (req, res) => {
    const posts = await Post.findAll({ order: [[ 'createdAt', 'DESC' ]] }); 
    res.render('index', { posts }); 
}); 

// GET /new
router.get('/new', loginCheck, (req, res) => {
    res.render('new', { }); 
}); 

// POST /new
router.post('/new', loginCheck, async (req, res) => {
    const post = await Post.create(req.body); 
    res.redirect(`/${post.id}`);   
});

// GET /edit 
router.get('/edit/:id', loginCheck, async (req, res) => {
    const id = req.params.id; 
    const post = await Post.findByPk(id); 
    res.render('edit', { post }); 
}); 

// POST /edit 
router.post('/edit/:id', loginCheck, async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    await post.update(req.body); 
    res.redirect(`/${post.id}`);   
});

// GET /destroy
router.get('/destroy/:id', loginCheck, async (req, res) => {
    const id = req.params.id; 
    const post = await Post.findByPk(id); 
    res.render('destroy', { post }); 
}); 

// POST /destroy
router.post('/destroy/:id', loginCheck, async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    await post.destroy(); 
    res.redirect('/');   
});

// GET /:id
router.get('/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id); 
    res.render('post', { post } ); 
}); 

// GET /error
router.get('/error', (req, res, next, err) => {
    res.render('error', { error: err } ); 
}); 

module.exports = router;