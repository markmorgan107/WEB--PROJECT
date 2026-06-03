const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const actionController = require('../controllers/actionController');

router.get('/', pageController.getHomePage);
router.get('/dashboard', pageController.requireAuth, pageController.getDashboard);
router.get('/inventory', pageController.requireAuth, pageController.getInventory);
router.get('/leaderboard', pageController.requireAuth, pageController.getLeaderboard);
router.get('/profile', pageController.requireAuth, pageController.getProfile);
router.get('/quests', pageController.requireAuth, pageController.getQuests);
router.get('/shop', pageController.requireAuth, pageController.getShop);
router.get('/login', pageController.getLogin);
router.get('/signup', pageController.getSignup);
router.get('/forgot-password', pageController.getForgotPassword);


router.post('/api/quests/request', pageController.requireAuth, actionController.requestQuest);
router.post('/api/quests/:id/accept', pageController.requireAuth, actionController.acceptQuest);
router.post('/api/quests/:id/complete', pageController.requireAuth, actionController.completeQuest);
router.post('/api/shop/buy/:id', pageController.requireAuth, actionController.buyItem);

module.exports = router;
