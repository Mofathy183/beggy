const template = `/**
 * NAME — Resource Routes
 *
 * Middleware Order:
 * 1. requireAuth
 * 2. requirePermission
 * 3. validateQuery / validateBody
 * 4. validateUuidParam (when needed)
 * 5. Controller handler
 */
import { Router } from 'express';
import { Action, Subject } from '@beggy/shared/constants';
import { type NAMEPController } from '@modules/NAME';
import {
\trequireAuth,
\trequirePermission,
\tvalidateUuidParam,
\tvalidateBody,
\tvalidateQuery,
} from '@shared/middlewares';
import {
\tNAMEPCreateSchema,
\tNAMEPUpdateSchema,
\tNAMEPListQuerySchema,
} from '@beggy/shared/schemas';

export const createNAMEPRouter = (
\tNAMECController: NAMEPController
): Router => {
\tconst router = Router();

\t// ─── Read ─────────────────────────────────────────────────────────────

\trouter.get(
\t\t'/',
\t\trequireAuth,
\t\trequirePermission(Action.READ, Subject.NAMEU),
\t\tvalidateQuery(NAMEPListQuerySchema),
\t\tNAMECController.getAll
\t);

\trouter.get(
\t\t'/:id',
\t\trequireAuth,
\t\trequirePermission(Action.READ, Subject.NAMEU),
\t\tvalidateUuidParam,
\t\tNAMECController.getById
\t);

\t// ─── Write ────────────────────────────────────────────────────────────

\trouter.post(
\t\t'/',
\t\trequireAuth,
\t\trequirePermission(Action.CREATE, Subject.NAMEU),
\t\tvalidateBody(NAMEPCreateSchema),
\t\tNAMECController.create
\t);

\trouter.patch(
\t\t'/:id',
\t\trequireAuth,
\t\trequirePermission(Action.UPDATE, Subject.NAMEU),
\t\tvalidateUuidParam,
\t\tvalidateBody(NAMEPUpdateSchema),
\t\tNAMECController.update
\t);

\t// ─── Delete ───────────────────────────────────────────────────────────

\trouter.delete(
\t\t'/:id',
\t\trequireAuth,
\t\trequirePermission(Action.DELETE, Subject.NAMEU),
\t\tvalidateUuidParam,
\t\tNAMECController.deleteById
\t);

\trouter.delete(
\t\t'/',
\t\trequireAuth,
\t\trequirePermission(Action.DELETE, Subject.NAMEU),
\t\tvalidateQuery(NAMEPListQuerySchema),
\t\tNAMECController.deleteMany
\t);

\treturn router;
};
`;

export function renderRouteTemplate(
	name: string,
	namePascal: string,
	nameCamel: string,
	nameUpper: string
): string {
	return template
		.replaceAll('NAMEP', namePascal)
		.replaceAll('NAMEC', nameCamel)
		.replaceAll('NAMEU', nameUpper)
		.replaceAll('NAME', name);
}
