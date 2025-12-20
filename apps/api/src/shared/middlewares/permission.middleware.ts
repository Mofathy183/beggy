import prisma from '../../prisma/prisma.js';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { statusCode } from '../config/status.js';
import { ErrorResponse } from '../utils/error.js';

/**
 * Middleware to check if the user has the required permission for the given action and subject.
 *
 * @async
 * @function checkPermissionMiddleware
 * @param {string} action - The action to check (e.g. 'read', 'create', 'update', 'delete').
 * @param {string} subject - The subject to check (e.g. 'user', 'bag', 'item').
 * @returns {Promise<void>} Returns nothing but passes control to the next middleware or throws an error.
 *
 * @throws {ErrorResponse} - If the user does not have the required permission.
 * @throws {ErrorResponse} - If an error occurs while checking user permissions.
 */
export const checkPermissionMiddleware =
	(action, subject) => async (req, res, next) => {
		try {
			// Get the user's role from the session
			const { userRole } = req.session;

			// Define the abilities for the user's role
			// Ability builder
			const { can, build } = new AbilityBuilder(createPrismaAbility);

			// Get the permissions for the role from the database
			const permissions = await prisma.roleOnPermission.findMany({
				where: { role: userRole },
				include: { permission: true },
			});

			// Add the permissions to the ability builder
			permissions.forEach((perm) => {
				let { action: permAction, subject: permSubject } =
					perm.permission;
				can(permAction, permSubject);
			});

			// Build the ability
			const ability = await defineAbilitiesFor(userRole);

			// Check if the user has the required permission
			const hasPermission = ability.can(action, subject);

			if (!hasPermission) {
				// Return an error response with a 403 status code
				return next(
					new ErrorResponse(
						`You do not have permission to ${action.split(':').join(' ')} on ${subject}`,
						'Forbidden permission',
						statusCode.forbiddenCode
					)
				);
			}

			// Call the next middleware in the stack
			next();
		} catch (error) {
			// Return an error response with a 500 status code
			return next(
				new ErrorResponse(
					error,
					'Failed to check user permissions',
					statusCode.internalServerErrorCode
				)
			);
		}
	};

/**
 * Checks if the user has the required role to do that action.
 *
 * @param {...string} roles - The roles to check.
 * @returns {Function} The middleware function.
 */
export const checkRoleMiddleware = (...roles) => {
	/**
	 * The middleware function.
	 *
	 * @param {Request} req - The request object.
	 * @param {Response} res - The response object.
	 * @param {NextFunction} next - The next middleware function.
	 * @returns {void}
	 */
	return (req, res, next) => {
		try {
			// Get the user's role from the session
			const { userRole } = req.session;

			// Check if the user has any of the roles
			const hasRole = roles.some(
				(role) => userRole === role.toUpperCase()
			);

			// If the user does not have the required role, return an error response with a 403 status code
			if (!hasRole)
				return next(
					new ErrorResponse(
						'User does not have the required role',
						'User does not have the required role',
						statusCode.forbiddenCode
					)
				);

			// Call the next middleware in the stack
			next();
		} catch (error) {
			// Return an error response with a 500 status code
			return next(
				new ErrorResponse(
					error,
					'Failed to check if user has the required role',
					'Failed to check user role'
				)
			);
		}
	};
};
