const User = require('../models/User');
const Quest = require('../models/Quest');
const Inventory = require('../models/Inventory');
const ShopItem = require('../models/ShopItem');
const Skill = require('../models/Skill');
const { requiredXpForLevel, calculateLevelFromTotalXp } = require('../utils/xp');

async function getUserContext(req) {
    if (!req.session || !req.session.userId) {
        return null;
    }

    try {
        const user = await User.findById(req.session.userId).select('name level totalXp coins');
        if (!user) {
            return null;
        }

        return {
            username: user.name,
            level: user.level,
            totalXp: user.totalXp,
            coins: user.coins
        };
    } catch (err) {
        console.error('Error fetching user context:', err);
        return null;
    }
}

async function ensureUserQuests(userId) {
    const quests = await Quest.find({ userId }).sort({ createdAt: -1 });
    if (quests.length === 0) {
        const distinctQuests = await Quest.aggregate([
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
        if (distinctQuests.length > 0) {
            const defaultQuests = distinctQuests.map(q => ({
                title: q._id,
                description: q.description,
                xpReward: q.xpReward || 0,
                coinsReward: q.coinsReward || 0,
                difficulty: q.difficulty || 'easy',
                skill: q.skill || 'mindfulness',
                status: 'pending',
                userId: userId
            }));
            await Quest.insertMany(defaultQuests);
            return await Quest.find({ userId }).sort({ createdAt: -1 });
        }
    }
    return quests;
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
        const quests = await ensureUserQuests(req.session.userId);
        context.quests = quests.slice(0, 3);
        // XP needed for next level
        const nextLevelXp = requiredXpForLevel(context.level + 1);
        context.requiredXp = nextLevelXp;
        // Calculate XP within the current level (subtract cost of all previous levels)
        let xpSpentOnPreviousLevels = 0;
        for (let l = 2; l <= context.level; l++) {
            xpSpentOnPreviousLevels += requiredXpForLevel(l);
        }
        context.xpInCurrentLevel = Math.max(0, (context.totalXp || 0) - xpSpentOnPreviousLevels);
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
        const leaderboard = await User.find().sort({ totalXp: -1 }).limit(10);
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
        context.requiredXpForLevel = requiredXpForLevel;
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
        const quests = await ensureUserQuests(req.session.userId);
        context.quests = quests;
        context.userId = req.session.userId;
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
