const User = require('../models/User');

const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

const { validateUpdateUser } = require('../util/validator');
const { generateToken } = require('../util/token');
const { SECRET_KEY } = require('../config');


exports.getUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const token = req.body.token;

        const errors = {};

        if (!userId && !token) {
            errors.request = 'Request Parameters are missing';
            return res.json({
                status: 'failure',
                errors: errors,
            });
        }

        // Validate Token
        const validateToken = jwt.verify(token, SECRET_KEY);
        if (!validateToken) {
            errors.token = 'Token Expired, Login again';

            return res.json({
                status: 'failure',
                errors: errors,
            });
        }

        const user = await User.findOne({ _id: userId });

        if (!user) {
            errors.userNotFound = 'User not found';
            return res.json({
                status: 'failure',
                errors: errors,
            });
        }

        const data = {
            id: user._id,
            email: user.email,
            name: user.name,
            profilePic: user.profilePic,
            age: user.age,
            gender: user.gender,
            dob: user.dob,
            mobile: user.mobile,
        };

        return res.json({
            status: 'success',
            user: data,
            errors: errors,
        });
    } catch (e) {
        return res.json({
            status: 'failure',
            errors: e,
        });
    }
};


// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const uploadStorage = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    },
}).single('updateProfilePic');

exports.updateUser = (req, res, next) => {
    try {
        const errors = {};

        uploadStorage(req, res, async function (err) {
            if (err) {
                // file handle error
                errors.file = err.message;
                return res.json({
                    status: 'failure',
                    errors: errors,
                });
            }

            const id = req.body.id;
            const password = req.body.password;
            const newPassword = req.body.newPassword;
            const email = req.body.email;
            const name = req.body.name;
            const age = req.body.age;
            const gender = req.body.gender;
            const dob = req.body.dob;
            const mobile = req.body.mobile;
            const passedToken = req.body.token;

            if (!passedToken) {
                errors.request = 'Authentication Token is missing, Login again';
                return res.json({
                    status: 'failure',
                    errors: errors,
                });
            }

            // Validate Token
            const validateToken = jwt.verify(passedToken, SECRET_KEY);
            if (!validateToken) {
                errors.token = 'Token Expired, Login again';

                return res.json({
                    status: 'failure',
                    errors: errors,
                });
            }

            if (err) {
                // handle error
                errors.file = err;
                return res.json({
                    status: 'failure',
                    errors: errors,
                });
            }

            if (!id || id.length <= 0) {
                errors.userId = 'User ID missing';
                return res.json({
                    status: 'success',
                    error: errors,
                });
            }

            // Get Existing User Data
            const oldData = await User.findOne({ _id: id });

            if (!oldData) {
                return res.json({
                    status: 'success',
                    errors: { userNotFound: 'User not found' },
                });
            }

            let profilePic = oldData.profilePic;

            if (req.file) {
                profilePic = 'uploads/' + req.file.filename;
            }

            const { valid, validationErrors } = validateUpdateUser(name, email);

            if (!valid) {
                return res.json({
                    status: 'success',
                    errors: validationErrors,
                });
            }

            const updateData = { name, email, profilePic, age, gender, dob, mobile };
            // If user wants to change password
            if (password.length > 0 || newPassword.length > 0) {
                const match = await bcrypt.compare(password, oldData.password);
                if (!match) {
                    return res.json({
                        status: 'success',
                        errors: { oldPassword: 'Old password is incorrect' },
                    });
                }

                if (newPassword.length <= 0) {
                    return res.json({
                        status: 'success',
                        errors: { newPassword: 'New password is empty' },
                    });
                }

                const encryPassword = await bcrypt.hash(newPassword, 12);
                updateData.password = encryPassword;
            }

            const doc = await User.findByIdAndUpdate(id, updateData, { new: true });

            const latestData = {
                id: doc._id,
                username: doc.username, // Assuming username exists in the User model
                email: doc.email,
                name: doc.name,
                profilePic: doc.profilePic,
                age: doc.age,
                gender: doc.gender,
                dob: doc.dob,
                mobile: doc.mobile,
            };

            const token = generateToken(latestData);

            return res.json({
                status: 'success',
                user: latestData,
                token,
                errors,
            });
        });
    } catch (error) {
        return res.json({
            status: 'failure',
            errors: { serverError: error },
        });
    }
};
