/**
 * RBAC (Role-Based Access Control) middleware.
 * Usage: router.get('/admin-only', verifyToken, authorize('admin'), handler);
 *        router.get('/managers', verifyToken, authorize('admin', 'asset_manager'), handler);
 *
 * Permissions are centralized here — never hardcode role checks inside controllers.
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }

    return next();
  };
}
