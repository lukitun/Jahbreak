const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({ error: errorMessage });
    }
    next();
  };
};

const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const taskSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().allow(''),
  status: Joi.string().valid('todo', 'in_progress', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  dueDate: Joi.date().iso().allow(null),
  assignedTo: Joi.string().uuid().allow(null),
  taskListId: Joi.string().uuid().required(),
  parentTaskId: Joi.string().uuid().allow(null),
  tags: Joi.array().items(Joi.string()),
});

const taskUpdateSchema = Joi.object({
  title: Joi.string().min(1),
  description: Joi.string().allow(''),
  status: Joi.string().valid('todo', 'in_progress', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  dueDate: Joi.date().iso().allow(null),
  assignedTo: Joi.string().uuid().allow(null),
  tags: Joi.array().items(Joi.string()),
  position: Joi.number().integer().min(0),
});

const taskListSchema = Joi.object({
  name: Joi.string().min(1).required(),
  description: Joi.string().allow(''),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
});

const taskListUpdateSchema = Joi.object({
  name: Joi.string().min(1),
  description: Joi.string().allow(''),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
});

module.exports = {
  validate,
  userRegistrationSchema,
  userLoginSchema,
  taskSchema,
  taskUpdateSchema,
  taskListSchema,
  taskListUpdateSchema,
};