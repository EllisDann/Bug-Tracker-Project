/**
 * Validation Middleware
 * Uses Joi to validate request bodies
 */

const Joi = require('joi');

const schemas = {
  // Bug schemas
  createBug: Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().min(10).required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
    severity: Joi.string().valid('minor', 'major', 'critical')
  }),

  updateBug: Joi.object({
    title: Joi.string().min(3).max(255),
    description: Joi.string().min(10),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
    severity: Joi.string().valid('minor', 'major', 'critical'),
    status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed', 'reopened'),
    assigned_to: Joi.number().integer().allow(null)
  }),

  addComment: Joi.object({
    comment: Joi.string().min(1).required()
  }),

  // User schemas
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'developer', 'reporter')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return res.status(500).json({ error: 'Validation schema not found' });
    }

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    next();
  };
}

module.exports = { validate };
