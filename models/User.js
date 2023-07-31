const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    name: String,
    profilePic: String,
    createdAt: String,
    age: Number,
    gender: String,
    dob: Date,
    mobile: String,
});

module.exports = model('User', userSchema);
