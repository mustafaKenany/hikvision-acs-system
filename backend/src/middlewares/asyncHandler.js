/**
 * Async Handler Middleware
 * معالج للدوال غير المتزامنة (async/await)
 * 
 * يلتقط الأخطاء من async functions ويمررها لـ error handler
 * بدون الحاجة لكتابة try/catch في كل controller
 * 
 * Usage:
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.findAll();
 *   res.json(users);
 * }));
 */

/**
 * Wraps async route handlers to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
