const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const connection = require('./config/db');
const { UserModel } = require('./models/Users.model');
const { BlogModel } = require('./models/Blogs.model');
const {authentication} = require('./Middlewares/authenticationMiddleware')

const app = express();
require("dotenv").config();

const cors = require("cors");
app.use(bodyParser.json());
app.use(cors({
    origin: "*"
}));


app.post('/signup', async (req, res) => {
    const newUser = req.body;
    console.log(newUser);
    if (!newUser.password) {
        return res.send("Password is required");
    }
    bcrypt.hash(newUser.password, 10, async function (err, hash) {
        if (err) {
            console.log("Error in hashing: " + err);
            return res.send("Error in hashing");
        }
        newUser.password = hash;
        console.log(newUser);
        try {
            await UserModel.create(newUser);
            res.json({ message: 'User added successfully' });
        } catch (error) {
            console.log(error);
            res.send('Internal server error');
        }
    });
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (user) {
            const hashed_password = user.password;
            const result = bcrypt.compareSync(password, hashed_password);
            if (result) {
                var token = jwt.sign({ userId: user.id }, 'shhhhh');
                res.json({ "message": "Logged in successfully", "token": token });
            } else {
                res.json({ "message": 'wrong credentials' });
            }
        } else {
            res.json({ "message": 'login failed' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
});



//for blogs
app.get('/blogs', authentication, async (req, res) => {
    try {
        const { category, author } = req.query;
        const query = { user_id: req.userId };

         if (category && author) {
            query.Category = category;
            query.Author = author;
        } else if (category) {
            query.Category = category;
        } else if (author) {
            query.Author = author;
        }


        const blogs = await BlogModel.find(query);
        res.send(blogs);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
});

app.post('/blogs/create', authentication, async (req, res) => {
    const newBlog = req.body;
    const userId = req.userId;
    console.log(userId);

    newBlog.user_id = userId;
    console.log(newBlog);
    try {
        await BlogModel.create(newBlog);
        res.send("Blog added successfully");
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
});


app.put('/blogs/:blogID', authentication, async (req, res) => {
    try {
        const { blogID } = req.params;
        const updatedBlogData = req.body;
        const existingBlog = await BlogModel.findOne({ _id: blogID, user_id: req.userId });
        if (!existingBlog) {
            return res.json({ message: 'Blog not found or you are not authorised' });
        }
        existingBlog.Title = updatedBlogData.Title || existingBlog.Title;
        existingBlog.Author = updatedBlogData.Author || existingBlog.Author;
        existingBlog.Category = updatedBlogData.Category || existingBlog.Category;
        existingBlog.Content = updatedBlogData.Content || existingBlog.Content;
        existingBlog.Image = updatedBlogData.Image || existingBlog.Image;
        await existingBlog.save();
        res.json({ message: 'Blog updated successfully', updatedBlog: existingBlog });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.delete('/blogs/:blogID', authentication, async (req, res) => {
    const { blogID } = req.params;
    console.log(blogID);
    try {
        await BlogModel.findOneAndDelete({ _id: blogID, user_id: req.userId });
        res.send("Blog deleted");
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
});

app.listen(process.env.PORT, async () => {
    try {
        await connection;
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.log(error);
    }
    console.log(`Listening on port ${process.env.PORT}`);
});
