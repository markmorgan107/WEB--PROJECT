const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        sameSite: 'lax'
    }
}));


app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});


app.use(express.static(path.join(__dirname, 'public')));


const User = require('./models/User');
const ShopItem = require('./models/ShopItem');
const Quest = require('./models/Quest');
const bcrypt = require('bcryptjs');


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('MongoDB Connected...');


        try {
            // Run Schema Migrations for existing database records

            await Quest.updateMany(
                { skill: { $exists: false } },
                { $set: { skill: 'mindfulness' } }
            );
            await User.updateMany(
                { level: { $exists: false } },
                { $set: { level: 1 } }
            );
            await User.updateMany(
                { totalXp: { $exists: false } },
                { $set: { totalXp: 0 } }
            );

            const adminCount = await User.countDocuments({ isAdmin: true });
            let defaultAdmin;
            if (adminCount === 0) {
                const hash = await bcrypt.hash('admin123', 10);
                defaultAdmin = await User.create({ name: 'Admin', email: 'admin@example.com', password: hash, isAdmin: true });
                console.log('Default admin created: admin@example.com / admin123');
            } else {
                defaultAdmin = await User.findOne({ isAdmin: true });
            }


            const questCount = await Quest.countDocuments();
            if (questCount === 0 && defaultAdmin) {
                await Quest.insertMany([
                    { title: 'Drink 2 Liters of Water', description: 'Stay hydrated', skill: 'mindfulness', xpReward: 10, coinsReward: 5, difficulty: 'easy', userId: defaultAdmin._id, status: 'pending' },
                    { title: 'Make the bed', description: 'Start the day right', skill: 'mindfulness', xpReward: 10, coinsReward: 5, difficulty: 'easy', userId: defaultAdmin._id, status: 'pending' },
                    { title: 'No phone for 30 mins after waking', description: 'Mindful morning', skill: 'mindfulness', xpReward: 15, coinsReward: 5, difficulty: 'easy', userId: defaultAdmin._id, status: 'pending' },
                    { title: 'Read 15 pages', description: 'Read a non-fiction book', skill: 'intellect', xpReward: 25, coinsReward: 10, difficulty: 'medium', userId: defaultAdmin._id, status: 'pending' },
                    { title: 'Clean workspace', description: 'Organize your desk', skill: 'mindfulness', xpReward: 25, coinsReward: 10, difficulty: 'medium', userId: defaultAdmin._id, status: 'pending' },
                    { title: '20-minute walk', description: 'Get some fresh air', skill: 'strength', xpReward: 30, coinsReward: 15, difficulty: 'medium', userId: defaultAdmin._id, status: 'pending' },
                    { title: '45-minute strict workout', description: 'Push your limits', skill: 'strength', xpReward: 50, coinsReward: 25, difficulty: 'hard', userId: defaultAdmin._id, status: 'pending' },
                    { title: 'Deep work block (2 Hours)', description: 'Uninterrupted focus', skill: 'intellect', xpReward: 75, coinsReward: 35, difficulty: 'hard', userId: defaultAdmin._id, status: 'pending' }
                ]);
                console.log('Default platform quests seeded.');
            }


            const shopCount = await ShopItem.countDocuments();
            if (shopCount === 0) {
                await ShopItem.insertMany([
                    { name: '1 Hour of Gaming', description: 'Treat yourself to some guilt-free video game time.', cost: 50, type: 'theme', rarity: 'common' },
                    { name: 'Movie Night', description: 'Watch a movie or your favorite show without interruptions.', cost: 100, type: 'theme', rarity: 'rare' },
                    { name: 'Cheat Meal', description: 'Enjoy a meal of your choice off your diet plan.', cost: 150, type: 'theme', rarity: 'epic' },
                    { name: 'Neon Theme', description: 'Unlock the Cyberpunk-inspired dashboard color palette.', cost: 200, type: 'theme', rarity: 'legendary' },
                    { name: 'Knight Avatar Frame', description: 'Wrap your profile picture in a golden knight\'s frame.', cost: 75, type: 'badge', rarity: 'rare' }
                ]);
                console.log('Default shop items seeded.');
            }
        } catch (err) {
            console.error('Initialization error:', err);
        }
    })
    .catch(err => console.log('Error connecting to MongoDB:', err));


const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
