const User = require('../models/User');
const Quest = require('../models/Quest');
const ShopItem = require('../models/ShopItem');
const Inventory = require('../models/Inventory');

exports.acceptQuest = async (req, res) => {
    try {
        const questId = req.params.id;
        const quest = await Quest.findOne({ _id: questId, userId: req.session.userId });
        if (!quest) {
            return res.status(404).json({ error: 'Quest not found' });
        }

        if (quest.status === 'pending') {
            quest.status = 'active';
            await quest.save();
            return res.json({ success: true, message: 'Quest accepted' });
        } else {
            return res.status(400).json({ error: 'Quest already active or completed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.completeQuest = async (req, res) => {
    try {
        const questId = req.params.id;
        const quest = await Quest.findOne({ _id: questId, userId: req.session.userId });

        if (!quest) {
            return res.status(404).json({ error: 'Quest not found' });
        }

        if (quest.status === 'active') {
            quest.status = 'completed';
            quest.completedAt = new Date();
            await quest.save();


            const user = await User.findById(req.session.userId);
            user.xp += quest.xpReward || 0;
            user.coins += quest.coinsReward || 0;


            const newLevel = Math.floor(user.xp / 1000) + 1;
            if (newLevel > user.level) {
                user.level = newLevel;
            }

            await user.save();
            return res.json({ success: true, message: 'Quest completed', xpEarned: quest.xpReward, coinsEarned: quest.coinsReward });
        } else {
            return res.status(400).json({ error: 'Quest is not active' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.buyItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await ShopItem.findById(itemId);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const user = await User.findById(req.session.userId);
        if (user.coins >= item.cost) {
            user.coins -= item.cost;
            await user.save();


            const inventoryItem = new Inventory({
                itemName: item.name,
                description: item.description,
                type: item.type,
                rarity: item.rarity,
                userId: req.session.userId
            });
            await inventoryItem.save();

            return res.json({ success: true, message: 'Item purchased successfully' });
        } else {
            return res.status(400).json({ error: 'Not enough coins' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.requestQuest = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const newQuest = new Quest({
            title,
            description,
            xpReward: 0,
            coinsReward: 0,
            status: 'requested',
            difficulty: 'easy',
            userId: req.session.userId
        });

        await newQuest.save();
        return res.json({ success: true, message: 'Quest request submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
