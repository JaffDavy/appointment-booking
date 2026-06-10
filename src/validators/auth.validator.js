import joi from 'joi'

const registerValidator = joi.object({
    email: joi.string().email({ maxDomainSegments: 2 }).required(),
    name: joi.string().min(3).max(30).required(),
    password: joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .required(),
    role: joi.string().valid('client', 'provider').required()
})

export const validate = (req, res,next) => {
    const { error } = registerValidator.validate(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message})
    }
    next()
}

const loginSchema = joi.object({
  email: joi.string().email({ maxDomainSegments: 2 }).required(),
  password: joi.string().required(),
})

export const loginValidator = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
}