const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Middleware to check admin role
router.use(auth(['admin', 'superadmin']));

// Dashboard Analytics
router.get('/dashboard/stats', adminController.getDashboardStats);

// Pooja Management Routes
router.get('/poojas', adminController.getAllPoojas);
router.get('/poojas/:id', adminController.getPoojaById);
router.post('/poojas', adminController.createPooja);
router.put('/poojas/:id', adminController.updatePooja);
router.delete('/poojas/:id', adminController.deletePooja);
router.patch('/poojas/:id/toggle-status', adminController.togglePoojaStatus);

// Product Management Routes
router.get('/products', adminController.getAllProducts);
router.get('/products/:id', adminController.getProductById);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.patch('/products/:id/toggle-featured', adminController.toggleProductFeatured);

// Pandit Management Routes
router.get('/pandits', adminController.getAllPandits);
router.get('/pandits/:id', adminController.getPanditById);
router.put('/pandits/:id', adminController.updatePandit);
router.delete('/pandits/:id', adminController.deletePandit);

// Waste Collection Management Routes
router.get('/waste-requests', adminController.getAllWasteRequests);
router.get('/waste-requests/:id', adminController.getWasteRequestById);
router.put('/waste-requests/:id', adminController.updateWasteRequest);
router.patch('/waste-requests/:id/assign', adminController.assignWasteProcessor);
router.patch('/waste-requests/:id/status', adminController.updateWasteStatus);

// File Upload Route
router.post('/upload', adminController.uploadMiddleware, adminController.handleFileUpload);

module.exports = router;
