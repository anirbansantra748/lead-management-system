const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Lead = require('../models/Lead');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Helper function to build MongoDB query from filters
const buildFilterQuery = (filters, userId) => {
  const query = { user: userId }; // Always filter by current user

  if (!filters) return query;

  // String field filters (email, company, city)
  const stringFields = ['email', 'company', 'city'];
  stringFields.forEach(field => {
    if (filters[field]) {
      const filter = filters[field];
      if (filter.equals) {
        query[field] = { $regex: new RegExp(`^${escapeRegex(filter.equals)}$`, 'i') };
      } else if (filter.contains) {
        query[field] = { $regex: new RegExp(escapeRegex(filter.contains), 'i') };
      }
    }
  });

  // Enum filters (status, source) - exact match or in array
  const enumFields = ['status', 'source'];
  enumFields.forEach(field => {
    if (filters[field]) {
      const filter = filters[field];
      if (filter.equals) {
        query[field] = filter.equals;
      } else if (filter.in && Array.isArray(filter.in)) {
        query[field] = { $in: filter.in };
      }
    }
  });

  // Number field filters (score, lead_value)
  const numberFields = ['score', 'lead_value'];
  numberFields.forEach(field => {
    if (filters[field]) {
      const filter = filters[field];
      const conditions = {};
      
      if (typeof filter.equals === 'number') {
        query[field] = filter.equals;
      } else {
        if (typeof filter.gt === 'number') conditions.$gt = filter.gt;
        if (typeof filter.lt === 'number') conditions.$lt = filter.lt;
        if (typeof filter.gte === 'number') conditions.$gte = filter.gte;
        if (typeof filter.lte === 'number') conditions.$lte = filter.lte;
        
        if (filter.between && Array.isArray(filter.between) && filter.between.length === 2) {
          conditions.$gte = filter.between[0];
          conditions.$lte = filter.between[1];
        }
        
        if (Object.keys(conditions).length > 0) {
          query[field] = conditions;
        }
      }
    }
  });

  // Date field filters (created_at, last_activity_at)
  const dateFields = ['created_at', 'last_activity_at'];
  dateFields.forEach(field => {
    if (filters[field]) {
      const filter = filters[field];
      const conditions = {};
      
      if (filter.on) {
        const date = new Date(filter.on);
        const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        conditions.$gte = date;
        conditions.$lt = nextDay;
      } else {
        if (filter.before) conditions.$lt = new Date(filter.before);
        if (filter.after) conditions.$gt = new Date(filter.after);
        if (filter.from) conditions.$gte = new Date(filter.from);
        if (filter.to) conditions.$lte = new Date(filter.to);
        
        if (filter.between && Array.isArray(filter.between) && filter.between.length === 2) {
          conditions.$gte = new Date(filter.between[0]);
          conditions.$lte = new Date(filter.between[1]);
        }
      }
      
      if (Object.keys(conditions).length > 0) {
        query[field] = conditions;
      }
    }
  });

  // Boolean field filters (is_qualified)
  if (filters.is_qualified && typeof filters.is_qualified.equals === 'boolean') {
    query.is_qualified = filters.is_qualified.equals;
  }

  return query;
};

// Helper function to escape regex special characters
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Private
router.post('/', [
  body('first_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('company')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company is required and must be less than 100 characters'),
  body('city')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City is required and must be less than 50 characters'),
  body('state')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('State is required and must be less than 50 characters'),
  body('source')
    .isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'])
    .withMessage('Source must be one of: website, facebook_ads, google_ads, referral, events, other'),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'lost', 'won'])
    .withMessage('Status must be one of: new, contacted, qualified, lost, won'),
  body('score')
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be an integer between 0 and 100'),
  body('lead_value')
    .isNumeric({ min: 0 })
    .withMessage('Lead value must be a positive number'),
  body('is_qualified')
    .optional()
    .isBoolean()
    .withMessage('is_qualified must be a boolean')
], async (req, res) => {
  try {
    console.log('🚀 [POST /api/leads] Starting lead creation process');
    console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User ID:', req.user._id);
    console.log('📧 User email:', req.user.email);

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [POST /api/leads] Validation failed:', errors.array());
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    console.log('✅ [POST /api/leads] Validation passed');

    // Check if lead with this email already exists for this user
    console.log('🔍 [POST /api/leads] Checking for existing lead with email:', req.body.email);
    const existingLead = await Lead.findOne({ 
      email: req.body.email, 
      user: req.user._id 
    });
    
    if (existingLead) {
      console.log('⚠️ [POST /api/leads] Duplicate lead found:', existingLead._id);
      return res.status(409).json({
        message: 'Lead with this email already exists'
      });
    }

    console.log('✅ [POST /api/leads] No duplicate found, proceeding with creation');

    // Create new lead
    const leadData = {
      ...req.body,
      user: req.user._id
    };

    console.log('📋 [POST /api/leads] Lead data prepared:', JSON.stringify(leadData, null, 2));

    const lead = new Lead(leadData);
    const savedLead = await lead.save();

    console.log('💾 [POST /api/leads] Lead saved to database with ID:', savedLead._id);
    console.log('📊 [POST /api/leads] Saved lead data:', JSON.stringify(savedLead, null, 2));

    // Return the complete lead object
    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: savedLead,
      lead: savedLead // Include both 'data' and 'lead' for compatibility
    });

    console.log('✅ [POST /api/leads] Response sent successfully');
    console.log('🏁 [POST /api/leads] Lead creation process completed\n');

  } catch (error) {
    console.error('Create lead error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Lead with this email already exists'
      });
    }
    
    res.status(500).json({
      message: 'Server error during lead creation'
    });
  }
});

// @route   GET /api/leads
// @desc    Get leads with pagination and filtering
// @access  Private
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isString()
    .withMessage('Sort must be a string'),
  query('filters')
    .optional()
    .isString()
    .withMessage('Filters must be a valid JSON string')
], async (req, res) => {
  try {
    console.log('🗺 [GET /api/leads] Starting leads retrieval process');
    console.log('👤 [GET /api/leads] User ID:', req.user._id);
    console.log('💵 [GET /api/leads] Query params:', req.query);

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [GET /api/leads] Validation failed:', errors.array());
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    console.log('📖 [GET /api/leads] Pagination - Page:', page, 'Limit:', limit, 'Skip:', skip);

    // Parse sorting
    let sort = { created_at: -1 }; // Default sort by newest first
    if (req.query.sort) {
      try {
        const sortObj = JSON.parse(req.query.sort);
        sort = sortObj;
      } catch (error) {
        console.log('⚠️ [GET /api/leads] Sort parsing failed, using default');
      }
    }

    console.log('🔄 [GET /api/leads] Sort criteria:', JSON.stringify(sort));

    // Parse filters
    let filters = {};
    if (req.query.filters) {
      try {
        filters = JSON.parse(req.query.filters);
      } catch (error) {
        console.log('❌ [GET /api/leads] Invalid filters JSON format');
        return res.status(400).json({
          message: 'Invalid filters JSON format'
        });
      }
    }

    // Build query
    const query = buildFilterQuery(filters, req.user._id);
    console.log('🔍 [GET /api/leads] MongoDB query:', JSON.stringify(query, null, 2));

    // Execute queries
    console.log('📊 [GET /api/leads] Executing database queries...');
    const startTime = Date.now();
    
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean for better performance
      Lead.countDocuments(query)
    ]);

    const queryTime = Date.now() - startTime;
    console.log('✅ [GET /api/leads] Database queries completed in', queryTime + 'ms');
    console.log('📋 [GET /api/leads] Found', total, 'total leads,', leads.length, 'returned');

    // Log sample of leads for debugging
    if (leads.length > 0) {
      console.log('📋 [GET /api/leads] Sample leads (first 3):');
      leads.slice(0, 3).forEach((lead, index) => {
        console.log(`   ${index + 1}. ${lead.first_name} ${lead.last_name} - ${lead.email} (${lead.status}) - Created: ${new Date(lead.created_at).toISOString()}`);
      });
    }

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    const response = {
      data: leads,
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    console.log('📦 [GET /api/leads] Response summary:', {
      totalRecords: total,
      returnedRecords: leads.length,
      page,
      totalPages,
      hasNextPage: response.hasNextPage
    });

    res.status(200).json(response);
    console.log('🏁 [GET /api/leads] Response sent successfully\n');

  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      message: 'Server error during lead retrieval'
    });
  }
});

// @route   GET /api/leads/stats/summary
// @desc    Get lead statistics summary
// @access  Private
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Lead.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalValue: { $sum: '$lead_value' },
          averageScore: { $avg: '$score' },
          qualified: { $sum: { $cond: ['$is_qualified', 1, 0] } }
        }
      }
    ]);

    const statusStats = await Lead.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const sourceStats = await Lead.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      summary: stats[0] || {
        total: 0,
        totalValue: 0,
        averageScore: 0,
        qualified: 0
      },
      byStatus: statusStats,
      bySource: sourceStats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Server error during stats retrieval'
    });
  }
});

// @route   GET /api/leads/:id
// @desc    Get a single lead by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      lead
    });

  } catch (error) {
    console.error('Get lead error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid lead ID format'
      });
    }
    
    res.status(500).json({
      message: 'Server error during lead retrieval'
    });
  }
});

// @route   PUT /api/leads/:id
// @desc    Update a lead
// @access  Private
router.put('/:id', [
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('company')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company must be less than 100 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City must be less than 50 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('State must be less than 50 characters'),
  body('source')
    .optional()
    .isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'])
    .withMessage('Source must be one of: website, facebook_ads, google_ads, referral, events, other'),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'lost', 'won'])
    .withMessage('Status must be one of: new, contacted, qualified, lost, won'),
  body('score')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be an integer between 0 and 100'),
  body('lead_value')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Lead value must be a positive number'),
  body('is_qualified')
    .optional()
    .isBoolean()
    .withMessage('is_qualified must be a boolean'),
  body('last_activity_at')
    .optional()
    .isISO8601()
    .withMessage('last_activity_at must be a valid date')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find the lead
    const lead = await Lead.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found'
      });
    }

    // If email is being updated, check for conflicts
    if (req.body.email && req.body.email !== lead.email) {
      const existingLead = await Lead.findOne({ 
        email: req.body.email, 
        user: req.user._id,
        _id: { $ne: lead._id }
      });
      
      if (existingLead) {
        return res.status(409).json({
          message: 'Another lead with this email already exists'
        });
      }
    }

    // Update lead fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        lead[key] = req.body[key];
      }
    });

    await lead.save();

    res.status(200).json({
      message: 'Lead updated successfully',
      lead
    });

  } catch (error) {
    console.error('Update lead error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid lead ID format'
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Lead with this email already exists'
      });
    }
    
    res.status(500).json({
      message: 'Server error during lead update'
    });
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete a lead
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    console.error('Delete lead error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid lead ID format'
      });
    }
    
    res.status(500).json({
      message: 'Server error during lead deletion'
    });
  }
});

module.exports = router;
