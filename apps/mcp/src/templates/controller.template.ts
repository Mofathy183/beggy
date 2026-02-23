const template = `import type { Request, Response } from 'express';
import { type NAMEPService, NAMEPMapper } from '@modules/NAME';
import type {
\tNAMEPCreateDTO,
\tNAMEPUpdateDTO,
\tNAMEPListQueryDTO,
} from '@beggy/shared/types';
import {
\tNAMEPCreateSchema,
\tNAMEPUpdateSchema,
\tNAMEPListQuerySchema,
} from '@beggy/shared/schemas';
import { apiResponseMap } from '@shared/utils';
import { STATUS_CODE } from '@shared/constants';

/**
 * NAMEPController
 * ----------------
 * HTTP boundary for the NAME domain.
 *
 * Responsibilities:
 * - Extract validated request data
 * - Delegate business logic to NAMEPService
 * - Map domain models to DTOs
 * - Return standardized API responses
 */
export class NAMEPController {
\tconstructor(private readonly NAMECService: NAMEPService) {}

\t// ─── Read ─────────────────────────────────────────────────────────────

\tgetAll = async (req: Request, res: Response): Promise<void> => {
\t\tconst query = req.query as NAMEPListQueryDTO;

\t\tconst result = await this.NAMECService.getAll({
\t\t\tpage: Number(query.page ?? 1),
\t\t\tlimit: Number(query.limit ?? 20),
\t\t\torderBy: query.orderBy,
\t\t\torder: query.order,
\t\t});

\t\tres.status(STATUS_CODE.OK).json(
\t\t\tapiResponseMap.ok(
\t\t\t\t{
\t\t\t\t\tdata: result.data.map(NAMEPMapper.toDTO),
\t\t\t\t\tmeta: result.meta,
\t\t\t\t},
\t\t\t\t'NAMEU_LIST_RETRIEVED'
\t\t\t)
\t\t);
\t};

\tgetById = async (req: Request, res: Response): Promise<void> => {
\t\tconst { id } = req.params;

\t\tconst NAMEC = await this.NAMECService.getById(id as string);

\t\tres.status(STATUS_CODE.OK).json(
\t\t\tapiResponseMap.ok(NAMEPMapper.toDTO(NAMEC), 'NAMEU_RETRIEVED')
\t\t);
\t};

\t// ─── Write ────────────────────────────────────────────────────────────

\tcreate = async (req: Request, res: Response): Promise<void> => {
\t\tconst body = req.body as NAMEPCreateDTO;

\t\tconst NAMEC = await this.NAMECService.create(body);

\t\tres.status(STATUS_CODE.CREATED).json(
\t\t\tapiResponseMap.created(NAMEPMapper.toDTO(NAMEC), 'NAMEU_CREATED')
\t\t);
\t};

\tupdate = async (req: Request, res: Response): Promise<void> => {
\t\tconst { id } = req.params;
\t\tconst body = req.body as NAMEPUpdateDTO;

\t\tconst NAMEC = await this.NAMECService.update(id as string, body);

\t\tres.status(STATUS_CODE.OK).json(
\t\t\tapiResponseMap.ok(NAMEPMapper.toDTO(NAMEC), 'NAMEU_UPDATED')
\t\t);
\t};

\t// ─── Delete ───────────────────────────────────────────────────────────

\tdeleteById = async (req: Request, res: Response): Promise<void> => {
\t\tconst { id } = req.params;

\t\tawait this.NAMECService.deleteById(id as string);

\t\tres.status(STATUS_CODE.NO_CONTENT).send();
\t};

\tdeleteMany = async (req: Request, res: Response): Promise<void> => {
\t\tconst count = await this.NAMECService.deleteMany(req.query);

\t\tres.status(STATUS_CODE.OK).json(
\t\t\tapiResponseMap.ok({ count }, 'NAMEU_BULK_DELETED')
\t\t);
\t};
}
`;

export function renderControllerTemplate(
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
