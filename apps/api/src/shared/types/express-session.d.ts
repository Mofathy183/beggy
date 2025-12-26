import { Role } from '@prisma/generated/prisma/enums';

//* Extend Express Session interface locally
declare module 'express-session' {
	interface SessionData {
		userId: string;
		userRole: Role;
	}
}
