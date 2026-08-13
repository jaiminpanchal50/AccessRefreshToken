import { Router } from 'express';
import { getMe, loginController, newAccessToken, registerController } from '../controller/auth.controller.js';
import { loginValidator, registerValidator } from '../validator/auth.validator.js';
import { authUser } from '../middleware/auth.middleware.js';

const authRouter = Router()


authRouter.post('/register', registerValidator, registerController)
authRouter.post('/login', loginValidator, loginController)
authRouter.get('/refresh', newAccessToken)
authRouter.get('/me', authUser, getMe)





export default authRouter;