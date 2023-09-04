const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    Title : String,
    Author : String,
    Category : String,
    Content : String,
    Image :String,
    user_id : {type : String, required : true}
})

const BlogModel = mongoose.model('blog', BlogSchema);

module.exports = {
    BlogModel
}