const template = `/**
 * NAME module — public API
 *
 * @remarks
 * - Only export what other modules are allowed to import
 * - Never export internal utilities or Prisma types directly
 */
export { NAMEPService } from './NAME.service';
export type { NAMEPListQuery, NAMEPListResult } from './NAME.service';
export { NAMEPController } from './NAME.controller';
export { createNAMEPRouter } from './NAME.route';
export { NAMEPMapper } from './NAME.mapper';
`;

export function renderIndexTemplate(name: string, namePascal: string): string {
	return template.replaceAll('NAMEP', namePascal).replaceAll('NAME', name);
}
