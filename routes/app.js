
const express = require('express');
const multer = require('multer');

const storageConfig = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'user-image');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storageConfig })

const router = express.Router();

const db = require('../data/database');

router.get('/', function (req, res) {
    res.redirect('/posts')
});

router.get('/posts', async function (req, res) {
    const query = `
    SELECT posts.* FROM project.posts
    `;
    const [posts] = await db.query(query)
    res.render('posts-list', { posts: posts });
});

router.get('/create-post', function (req, res) {
    res.render('create-post');
});

router.post('/posts', upload.single('file'), async function (req, res) {
    const data = [
        req.body.title,
        req.body.by,
        req.body.content,
    ];

    const query = `
    INSERT INTO project.posts (title, name, content) VALUES (?)
    `;

    await db.query(query, [
        data
    ]);
    res.redirect('/posts');
});

router.get('/posts/:id', async function (req, res) {
    const query = `
        SELECT * FROM project.posts WHERE id = ?
    `;
    const [posts] = await db.query(query, [req.params.id]);

    if (!posts || posts.length === 0) {
        return res.status(404).render('404');
    }

    const postData = {
        ...posts[0],
        date: posts[0].date.toISOString(),
        humanReadableDate: posts[0].date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
    };

    res.render('post-detail', { post: postData });
});

router.get('/posts/:id/edit', async function (req, res) {
    const query = `
        SELECT * FROM project.posts WHERE id = ?
    `;
    const [posts] = await db.query(query, [req.params.id]);

    if (!posts || posts.length === 0) {
        return res.status(404).render('404');
    }

    res.render('update-post', { post: posts[0] });
});


router.post('/posts/:id/edit', async function(req, res) {
    const query = `
    UPDATE project.posts SET title = ?, name = ?, content = ?
    WHERE id = ?
    `;
    await db.query(query, [req.body.title, req.body.by, req.body.content, req.params.id]);

    res.redirect('/posts');
});

router.post('/posts/:id/delete', async function (req, res) {
    db.query('DELETE FROM project.posts WHERE id = ?', [req.params.id]);
    res.redirect('/posts');
});

module.exports = router;