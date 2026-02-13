const express = require('express');
const router = express.Router();
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validate = require('../middleware/validation');
const {
  createProductSchema,
  updateProductSchema,
  searchProductSchema,
} = require('../validations/productValidation');
const { upload, uploadToCloudinary } = require('../middleware/upload');

// Public routes
router.get(
  '/',
  (req, res, next) => {
    const { error } = searchProductSchema.validate(req.query, { abortEarly: false });
    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json({ success: false, error: message });
    }
    next();
  },
  getAllProducts
);

router.get('/:id', getProductById);

// Protected routes - Admin only
router.post(
  '/',
  auth,
  roleAuth('admin'),
  upload.array('images', 5),
  uploadToCloudinary,
  validate(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  auth,
  roleAuth('admin'),
  upload.array('images', 5),
  uploadToCloudinary,
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  '/:id',
  auth,
  roleAuth('admin'),
  deleteProduct
);

module.exports = router;
