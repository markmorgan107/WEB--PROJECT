const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid credentials.' });
        }

        if (user.isAdmin) {
            req.session.userId = user._id;
            req.session.isAdmin = true;
            return res.redirect('/admin/dashboard');
        }

        req.session.userId = user._id;
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.postSignup = async (req, res) => {
    const { name, email, password, 'confirm-password': confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.render('signup', { error: 'Passwords do not match.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('signup', { error: 'User already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const encodedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: encodedPassword,
            level: 1,
            xp: 0,
            coins: 0
        });

        await newUser.save();

        // Dynamically fetch all distinct active quests on the platform
        const distinctQuests = await require('../models/Quest').aggregate([
            {
                $group: {
                    _id: "$title",
                    description: { $first: "$description" },
                    xpReward: { $first: "$xpReward" },
                    coinsReward: { $first: "$coinsReward" },
                    difficulty: { $first: "$difficulty" },
                    skill: { $first: "$skill" }
                }
            }
        ]);

        const defaultQuests = distinctQuests.map(q => ({
            title: q._id,
            description: q.description,
            xpReward: q.xpReward || 0,
            coinsReward: q.coinsReward || 0,
            difficulty: q.difficulty,
            skill: q.skill || 'mindfulness',
            status: 'pending',
            userId: newUser._id
        }));

        const defaultSkills = [
            { name: 'Intellect', description: 'Books read, learning sessions, deep work', level: 1, xp: 0, userId: newUser._id },
            { name: 'Strength', description: 'Workouts, diet adherence, steps', level: 1, xp: 0, userId: newUser._id },
            { name: 'Mindfulness', description: 'Meditation, journaling, yoga', level: 1, xp: 0, userId: newUser._id },
            { name: 'Charisma', description: 'Networking, social events, public speaking', level: 1, xp: 0, userId: newUser._id },
            { name: 'Finance', description: 'Savings goals, side hustles, budgeting', level: 1, xp: 0, userId: newUser._id }
        ];

        await require('../models/Quest').insertMany(defaultQuests);
        await require('../models/Skill').insertMany(defaultSkills);

        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.postForgotPassword = (req, res) => {
    res.render('forgot-password', { success: 'Password reset link sent (placeholder).' });
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
};
