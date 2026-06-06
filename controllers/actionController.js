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

        if (quest.status === 'requested' || quest.status === 'pending' || quest.status === 'approved') {
            quest.status = 'active';
            await quest.save();
            return res.json({
                success: true,
                message: 'Quest accepted',
                quest: {
                    title: quest.title,
                    xpReward: quest.xpReward,
                    coinsReward: quest.coinsReward
                }
            });
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

        if (quest.status === 'approved') {
          // Grant rewards (already granted on approval, but ensure user receives them)
          const user = await User.findById(req.session.userId);
          user.xp += quest.xpReward || 0;
          user.coins += quest.coinsReward || 0;
          await user.save();

          quest.status = 'completed';
          quest.completedAt = new Date();
          await quest.save();

          return res.json({ success: true, message: 'Quest completed', xpEarned: quest.xpReward, coinsEarned: quest.coinsReward });
        } else {
          return res.status(400).json({ error: 'Quest is not approved yet' });
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

        // Check if item is on cooldown (purchased within last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentPurchase = await Inventory.findOne({
            userId: req.session.userId,
            itemName: item.name,
            acquiredAt: { $gte: oneDayAgo }
        });

        if (recentPurchase) {
            const timeLeftMs = recentPurchase.acquiredAt.getTime() + (24 * 60 * 60 * 1000) - Date.now();
            const hoursLeft = Math.ceil(timeLeftMs / (1000 * 60 * 60));
            return res.status(400).json({ error: `This item is on cooldown. Try again in ${hoursLeft} hours.` });
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

            return res.json({ success: true, message: 'Item purchased successfully', newBalance: user.coins });
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
        return res.json({
            success: true,
            message: 'Quest request submitted successfully',
            quest: {
                title: newQuest.title,
                xpReward: newQuest.xpReward,
                coinsReward: newQuest.coinsReward
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
// Submit proof image for quest completion (admin review)
exports.submitProof = async (req, res) => {
  try {
    const questId = req.body.questId;
    const quest = await Quest.findOne({ _id: questId, userId: req.session.userId });
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    // Allow submission if quest is in requested or pending state
    if (!['requested', 'pending', 'active'].includes(quest.status)) {
      return res.status(400).json({ error: 'Cannot submit proof for this quest' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Proof image required' });
    }
    quest.proofImage = req.file.filename;
    quest.status = 'pending_review';
    await quest.save();
    return res.json({
        success: true,
        message: 'Proof submitted successfully',
        quest: {
            title: quest.title,
            xpReward: quest.xpReward,
            coinsReward: quest.coinsReward
        }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
