const template = `import type { NAMEP } from '@prisma/generated/prisma/client';
import type { NAMEDTO } from '@beggy/shared/types';
import { toISO } from '@shared/utils';

/**
 * NAMEPMapper
 *
 * Transforms Prisma models into API-safe DTOs.
 * - Explicit field mapping only
 * - Never spread the entire model
 */
export const NAMEPMapper = {
\ttoDTO(NAMEC: NAMEP): NAMEDTO {
\t\treturn {
\t\t\tid: NAMEC.id,
\t\t\tcreatedAt: toISO(NAMEC.createdAt),
\t\t\tupdatedAt: toISO(NAMEC.updatedAt),
\t\t};
\t},
};
`;

export function renderMapperTemplate(
	name: string,
	namePascal: string,
	nameCamel: string,
	_nameUpper: string
): string {
	return template
		.replaceAll('NAMEDTO', `${namePascal}DTO`)
		.replaceAll('NAMEP', namePascal)
		.replaceAll('NAMEC', nameCamel)
		.replaceAll('NAME', name);
}
