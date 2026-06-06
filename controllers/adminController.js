const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Quest = require('../models/Quest');
const ShopItem = require('../models/ShopItem');
const Skill = require('../models/Skill');

exports.requireAdmin = (req, res, next) => {
    if (!req.session || !req.session.userId || !req.session.isAdmin) {
        return res.redirect('/admin/login');
    }
    next();
};

exports.getLogin = (req, res) => {
    if (req.session && req.session.isAdmin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin-login');
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await User.findOne({ email, isAdmin: true });
        if (!admin) {
            return res.render('admin-login', { error: 'Invalid admin credentials.' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.render('admin-login', { error: 'Invalid admin credentials.' });
        }

        req.session.userId = admin._id;
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const users = await User.find({ isAdmin: { $ne: true } }).sort({ date: -1 });
        const shopItems = await ShopItem.find().sort({ createdAt: -1 });
        const requestedQuests = await Quest.find({ status: 'requested' }).populate('userId').sort({ createdAt: -1 });

        const quests = await Quest.aggregate([
            {
                $match: { status: { $ne: 'requested' } }
            },
            {
                $group: {
                    _id: "$title",
                    description: { $first: "$description" },
                    xpReward: { $first: "$xpReward" },
                    coinsReward: { $first: "$coinsReward" },
                    difficulty: { $first: "$difficulty" }
                }
            }
        ]);

        const pendingProofs = await Quest.find({ status: 'pending_review' }).populate('userId').sort({ createdAt: -1 });

        res.render('admin-dashboard', { users, shopItems, quests, requestedQuests, pendingProofs });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.postAddQuest = async (req, res) => {
    const { title, description, skill, xpReward, coinsReward, difficulty } = req.body;
    try {
        const users = await User.find({ isAdmin: { $ne: true } });
        const questsToInsert = users.map(user => ({
            title,
            description,
            skill,
            xpReward: parseInt(xpReward) || 0,
            coinsReward: parseInt(coinsReward) || 0,
            difficulty,
            status: 'pending',
            userId: user._id
        }));

        if (questsToInsert.length > 0) {
            await Quest.insertMany(questsToInsert);
        }
        res.redirect('/admin/dashboard?success=QuestAdded');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.postEditQuest = async (req, res) => {
    const { oldTitle, title, description, xpReward, coinsReward, difficulty, skill } = req.body;
    try {
        await Quest.updateMany(
            { title: oldTitle },
            { $set: { title, description, xpReward: parseInt(xpReward) || 0, coinsReward: parseInt(coinsReward) || 0, difficulty, skill: skill || 'mindfulness' } }
        );
        res.redirect('/admin/dashboard?success=QuestEdited');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.postRemoveQuest = async (req, res) => {
    const { title } = req.body;
    try {
        await Quest.deleteMany({ title });
        res.redirect('/admin/dashboard?success=QuestRemoved');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.postAddShopItem = async (req, res) => {
    const { name, description, cost, type, rarity } = req.body;
    try {
        const newItem = new ShopItem({
            name,
            description,
            cost: parseInt(cost) || 0,
            type,
            rarity
        });
        await newItem.save();
        res.redirect('/admin/dashboard?success=ItemAdded');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.postRemoveShopItem = async (req, res) => {
    try {
        await ShopItem.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard?success=ItemRemoved');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error(err);
        res.redirect('/admin/login');
    });
};

exports.postApproveQuest = async (req, res) => {
    const questId = req.params.id;
    const { xpReward, coinsReward, difficulty } = req.body;
    try {
        await Quest.findByIdAndUpdate(questId, {
            xpReward: parseInt(xpReward) || 0,
            coinsReward: parseInt(coinsReward) || 0,
            difficulty,
            status: 'approved'
        });
        res.redirect('/admin/dashboard?success=QuestApproved');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.postReviewProof = async (req, res) => {
    const questId = req.params.id;
    const { decision, xpReward, coinsReward, difficulty } = req.body;
    try {
        const quest = await Quest.findById(questId);
        if (!quest) return res.status(404).send('Quest not found');
        if (decision === 'approve') {

            const userId = quest.userId;

            let userSkill = await Skill.findOne({
                userId,
                name: { $regex: new RegExp(`^${quest.skill}$`, 'i') }
            });
            if (!userSkill) {
                const capitalizedName = quest.skill.charAt(0).toUpperCase() + quest.skill.slice(1);
                userSkill = new Skill({
                    userId,
                    name: capitalizedName,
                    level: 1,
                    xp: 0,
                    description: `${capitalizedName} skill`,
                    updatedAt: new Date()
                });
            }

            const { calculateLevelFromTotalXp } = require('../utils/xp');
            userSkill.xp += quest.xpReward;
            userSkill.level = calculateLevelFromTotalXp(userSkill.xp);
            await userSkill.save();

            const User = require('../models/User');
            const user = await User.findById(userId);
            if (user) {
                user.totalXp = (user.totalXp || 0) + quest.xpReward;
                user.level = calculateLevelFromTotalXp(user.totalXp);
                user.coins = (user.coins || 0) + (quest.coinsReward || 0);

                // Update streak: check if last completion was today or yesterday
                const today = new Date();
                today.setUTCHours(0, 0, 0, 0);
                const yesterday = new Date(today);
                yesterday.setUTCDate(today.getUTCDate() - 1);

                const last = user.lastCompletedDate ? new Date(user.lastCompletedDate) : null;
                if (last) last.setUTCHours(0, 0, 0, 0);

                if (last && last.getTime() === today.getTime()) {
                    // Already completed something today — don't change streak
                } else if (last && last.getTime() === yesterday.getTime()) {
                    // Completed yesterday — extend streak
                    user.streak = (user.streak || 0) + 1;
                } else {
                    // Missed a day or first ever — reset to 1
                    user.streak = 1;
                }
                user.lastCompletedDate = today;

                await user.save();
            }
            quest.status = 'completed';
            quest.completedAt = new Date();
            await quest.save();
            return res.redirect('/admin/dashboard?success=ProofApproved');
        } else if (decision === 'reject') {
            quest.status = 'rejected';
            quest.proofImage = undefined;
            await quest.save();
            return res.redirect('/admin/dashboard?success=ProofRejected');
        } else {
            return res.status(400).send('Invalid decision');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
