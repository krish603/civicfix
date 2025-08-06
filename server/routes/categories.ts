import { Router, Request, Response } from 'express';
import { Category } from '../models';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Get all categories (hierarchical)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { includeInactive = false } = req.query;
    
    const filter: any = includeInactive === 'true' ? {} : { isActive: true };
    
    const categories = await Category.find(filter)
      .populate('subcategories')
      .sort({ displayOrder: 1, name: 1 });

    // Organize into hierarchy (parent categories with their children)
    const parentCategories = categories.filter(cat => !cat.parentId);
    const hierarchicalCategories = parentCategories.map(parent => ({
      ...parent.toObject(),
      subcategories: categories.filter(cat => 
        cat.parentId && cat.parentId.toString() === parent._id.toString()
      )
    }));

    res.json({
      success: true,
      data: {
        categories: hierarchicalCategories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single category by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('subcategories')
      .populate('parent');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new category (admin only)
router.post('/', authenticate, authorize('admin', 'super_admin'), async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      parentId,
      iconName,
      colorHex,
      displayOrder = 0
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if parent category exists (if parentId provided)
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim(),
      parentId: parentId || null,
      iconName,
      colorHex,
      displayOrder,
      isActive: true
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category
      }
    });
  } catch (error: any) {
    console.error('Create category error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update category (admin only)
router.patch('/:id', authenticate, authorize('admin', 'super_admin'), async (req: Request, res: Response) => {
  try {
    const allowedUpdates = ['name', 'description', 'parentId', 'iconName', 'colorHex', 'displayOrder', 'isActive'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Validate parentId if being updated
    if (updates.parentId) {
      const parentCategory = await Category.findById(updates.parentId);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category
      }
    });
  } catch (error: any) {
    console.error('Update category error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Category name already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticate, authorize('admin', 'super_admin'), async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has subcategories
    const subcategories = await Category.find({ parentId: req.params.id });
    if (subcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories'
      });
    }

    // Soft delete by setting isActive to false
    category.isActive = false;
    await category.save();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
