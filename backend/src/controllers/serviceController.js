import { Service } from '../models/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getAllServices = asyncHandler(async (req, res) => {
  const { category, popular } = req.query;

  const query = { isActive: true };
  
  if (category && category !== 'all') {
    query.category = category.toLowerCase();
  }
  
  if (popular === 'true') {
    query.isPopular = true;
  }

  const services = await Service.find(query).sort({ order: 1, name: 1 });

  res.json({
    success: true,
    data: {
      services,
      count: services.length,
    },
  });
});

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    throw new AppError('Service not found', 404);
  }

  res.json({
    success: true,
    data: {
      service,
    },
  });
});

// @desc    Get services by category
// @route   GET /api/services/category/:category
// @access  Public
export const getServicesByCategory = asyncHandler(async (req, res) => {
  const services = await Service.getByCategory(req.params.category);

  res.json({
    success: true,
    data: {
      services,
      count: services.length,
    },
  });
});

// @desc    Get popular services
// @route   GET /api/services/popular
// @access  Public
export const getPopularServices = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  const services = await Service.getPopular(parseInt(limit));

  res.json({
    success: true,
    data: {
      services,
    },
  });
});

// @desc    Get service categories
// @route   GET /api/services/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Service.distinct('category', { isActive: true });
  
  // Add icons and format
  const categoryData = [
    { id: 'all', name: 'All', icon: 'ri-apps-line' },
    { id: 'hair', name: 'Hair', icon: 'ri-scissors-cut-line', color: '#e9d5ff' },
    { id: 'skin', name: 'Skin', icon: 'ri-sparkling-line', color: '#fce7f3' },
    { id: 'makeup', name: 'Makeup', icon: 'ri-brush-line', color: '#dbeafe' },
    { id: 'nails', name: 'Nails', icon: 'ri-hand-heart-line', color: '#fef3c7' },
    { id: 'spa', name: 'Spa', icon: 'ri-heart-pulse-line', color: '#d1fae5' },
  ].filter(cat => cat.id === 'all' || categories.includes(cat.id));

  res.json({
    success: true,
    data: {
      categories: categoryData,
    },
  });
});

// ============ Admin Routes ============

// @desc    Create service (Admin)
// @route   POST /api/services
// @access  Private/Admin
export const createService = asyncHandler(async (req, res) => {
  const { name, description, category, price, duration, durationMinutes, icon, isPopular, order } = req.body;

  const service = await Service.create({
    name,
    description,
    category,
    price,
    duration,
    durationMinutes,
    icon,
    isPopular,
    order,
  });

  res.status(201).json({
    success: true,
    message: 'Service created successfully',
    data: {
      service,
    },
  });
});

// @desc    Update service (Admin)
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = asyncHandler(async (req, res) => {
  const { name, description, category, price, duration, durationMinutes, icon, isPopular, isActive, order } = req.body;

  const service = await Service.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      category,
      price,
      duration,
      durationMinutes,
      icon,
      isPopular,
      isActive,
      order,
    },
    { new: true, runValidators: true }
  );

  if (!service) {
    throw new AppError('Service not found', 404);
  }

  res.json({
    success: true,
    message: 'Service updated successfully',
    data: {
      service,
    },
  });
});

// @desc    Delete service (Admin)
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    throw new AppError('Service not found', 404);
  }

  // Soft delete by setting isActive to false
  service.isActive = false;
  await service.save();

  res.json({
    success: true,
    message: 'Service deleted successfully',
  });
});

// @desc    Get all services including inactive (Admin)
// @route   GET /api/services/admin/all
// @access  Private/Admin
export const getAllServicesAdmin = asyncHandler(async (req, res) => {
  const services = await Service.find().sort({ order: 1, name: 1 });

  res.json({
    success: true,
    data: {
      services,
      count: services.length,
    },
  });
});
