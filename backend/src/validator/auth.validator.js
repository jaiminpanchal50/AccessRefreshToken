import { body, validationResult } from "express-validator";

function validate(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}


export const registerValidator = [
    body("name").trim().isString().withMessage('Name must be string'),
    body('email').isEmail().withMessage("Email must be valid"),
    body('password').isString().withMessage("Password must be string"),
    validate
]


export const loginValidator = [
    body('email').isEmail().withMessage("Email must be valid"),
    body('password').isString().withMessage("Password must be string"),
    validate
]