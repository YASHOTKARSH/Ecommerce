const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { deleteFromCloudinary } = require('../middleware/upload');

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, discount, stock, category } = req.body;

  // Get image URLs from upload middleware
  const images = req.imageUrls || [];

  // Create product
  const product = await Product.create({
    title,
    description,
    price,
    discount: discount || 0,
    stock,
    category,
    images,
  });

  res.status(201).json({
    success: true,
    data: product,
  });
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Handle new image uploads
  if (req.imageUrls && req.imageUrls.length > 0) {
    // Delete old images from Cloudinary
    if (product.images && product.images.length > 0) {
      await deleteFromCloudinary(product.images);
    }
    req.body.images = req.imageUrls;
  }

  // Update product
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: product,
  });
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    await deleteFromCloudinary(product.images);
  }

  // Delete product from database
  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

/**
 * @desc    Get all products with search, filter, and pagination
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, page = 1, limit = 10, sort = '-createdAt' } = req.query;

  // Build query
  const query = {};

  // Search in title and description
  if (search) {
    query.$text = { $search: search };
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Calculate pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Get total count for pagination metadata
  const total = await Product.countDocuments(query);

  // Parse sort parameter
  let sortOption = {};
  if (sort === 'price') sortOption.price = 1;
  else if (sort === '-price') sortOption.price = -1;
  else if (sort === 'createdAt') sortOption.createdAt = 1;
  else if (sort === '-createdAt') sortOption.createdAt = -1;
  else if (sort === 'ratings') sortOption['ratings.average'] = 1;
  else if (sort === '-ratings') sortOption['ratings.average'] = -1;
  else sortOption.createdAt = -1;

  // Get products
  const products = await Product.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: products,
  });
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
};
