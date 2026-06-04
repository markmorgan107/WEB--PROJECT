const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/logout', adminController.logout);

router.get('/dashboard', adminController.requireAdmin, adminController.getDashboard);
router.post('/quests/add', adminController.requireAdmin, adminController.postAddQuest);
router.post('/quests/:id/approve', adminController.requireAdmin, adminController.postApproveQuest);
router.post('/quests/edit', adminController.requireAdmin, adminController.postEditQuest);
router.post('/quests/remove', adminController.requireAdmin, adminController.postRemoveQuest);
router.post('/shop/add', adminController.requireAdmin, adminController.postAddShopItem);
router.post('/shop/:id/remove', adminController.requireAdmin, adminController.postRemoveShopItem);
router.post('/quests/:id/review-proof', adminController.requireAdmin, adminController.postReviewProof);

module.exports = router;
