const User = require('../models/User');
const Quest = require('../models/Quest');
const Inventory = require('../models/Inventory');
const ShopItem = require('../models/ShopItem');
const Skill = require('../models/Skill');

async function getUserContext(req) {
    if (!req.session || !req.session.userId) {
        return null;
    }

    try {
        const user = await User.findById(req.session.userId).select('name level xp coins');
        if (!user) {
            return null;
        }

        return {
            username: user.name,
            level: user.level,
            xp: user.xp,
            coins: user.coins
        };
    } catch (err) {
        console.error('Error fetching user context:', err);
        return null;
    }
}

exports.requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

exports.getHomePage = (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('web project');
};

exports.getDashboard = async (req, res) => {
    const context = await getUserContext(req);
    if (!context) {
        return res.redirect('/login');
    }
    try {
        const quests = await Quest.find({ userId: req.session.userId }).sort({ createdAt: -1 }).limit(3);
        context.quests = quests;
        res.render('dashboard', context);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getInventory = async (req, res) => {
    const context = await getUserContext(req);
    if (!context) {
        return res.redirect('/login');
    }
    try {
        const inventory = await Inventory.find({ userId: req.session.userId }).sort({ acquiredAt: -1 });
        context.inventory = inventory;
        res.render('inventory', context);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getLeaderboard = async (req, res) => {
    const context = await getUserContext(req);
    if (!context) {
        return res.redirect('/login');
    }
    try {
        const leaderboard = await User.find().sort({ xp: -1 }).limit(10);
        context.leaderboard = leaderboard;
        res.render('leaderboard', context);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getProfile = async (req, res) => {
    const context = await getUserContext(req);
    if (!context) {
        return res.redirect('/login');
    }
    try {
        const skills = await Skill.find({ userId: req.session.userId });
        context.skills = skills;
        res.render('profile', context);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getQuests = async (req, res) => {
    const context = await getUserContext(req);
    if (!context) {
        return res.redirect('/login');
    }
    try {
        const quests = await Quest.find({ userId: req.session.userId }).sort({ createdAt: -1 });
        context.quests = quests;
        res.render('quests', context);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getShop = async (req, res) => {
    const context = await getUserContext(req);
    if (!context) {
        return res.redirect('/login');
    }
    try {
        const shopItems = await ShopItem.find({ available: true });
        context.shopItems = shopItems;
        res.render('shop', context);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getLogin = (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('login');
};

exports.getSignup = (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('signup');
};

exports.getForgotPassword = (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('forgot-password');
};
