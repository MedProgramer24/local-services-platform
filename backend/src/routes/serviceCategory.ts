import express from 'express';
import { body } from 'express-validator';
import { ServiceCategory } from '../models/ServiceCategory';
import { auth, checkRole } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const categoryValidation = [
  body('name').notEmpty().withMessage('Category name is required'),
  body('description').notEmpty().withMessage('Category description is required'),
  body('icon').optional().isString().withMessage('Icon must be a string'),
  body('parent').optional().isMongoId().withMessage('Invalid parent category ID')
];

// Create a new category (admin only)
router.post('/', auth, checkRole(['admin']), categoryValidation, async (req, res) => {
  try {
    const { name, description, icon, parent } = req.body;

    // Check if parent category exists if provided
    if (parent) {
      const parentCategory = await ServiceCategory.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    const category = new ServiceCategory({
      name,
      description,
      icon,
      parent
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
});

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true })
      .populate('parent', 'name')
      .sort('name');

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
});

export default router; 