import { Router } from 'express';
import { addToPlaylist, forgotPassword, loginUser, myProfile, registerUser, resetPassword, searchPerson, updateSearchHistory, verifyEmail } from './controller.js';
import { isAuth } from './middleware.js';
const router = Router();
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/user/me', isAuth, myProfile);
router.post('/song/:id', isAuth, addToPlaylist);
router.post("/verify-email", verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/user/:userId/search-history1', isAuth, searchPerson);
router.patch('/user/:userId/search-history', isAuth, updateSearchHistory);
// Export the router
export default router;
