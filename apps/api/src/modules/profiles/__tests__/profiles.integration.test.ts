import { prisma, truncateAllTables } from '@prisma';
import { ProfileService } from '@modules/profiles';
import { profileFactory } from '@modules/profiles/__tests__/factories/profile.factory';
import { userFactory } from '@modules/users/__tests__/factories/user.factory';

describe('ProfileService', () => {
	let service: ProfileService;

	beforeEach(async () => {
		await truncateAllTables(prisma);
		service = new ProfileService(prisma);
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	it('creates a profile for a user', async () => {
		// Arrange
		const user = await prisma.user.create({
			data: userFactory(),
		});

		// Act
		const profileInput = profileFactory(user.id);
		await prisma.profile.create({
			data: profileInput,
		});

		// Assert
		const persistedProfile = await prisma.profile.findUnique({
			where: { userId: user.id },
		});

		expect(persistedProfile).toBeTruthy();
		expect(persistedProfile!.firstName).toBe(profileInput.firstName);
		expect(persistedProfile!.lastName).toBe(profileInput.lastName);
		expect(persistedProfile!.avatarUrl).toBeNull();
	});

	it('removes the profile when the user is deleted', async () => {
		const user = await prisma.user.create({ data: userFactory() });
		await prisma.profile.create({ data: profileFactory(user.id) });

		// Act
		await prisma.user.delete({ where: { id: user.id } });

		// Assert
		const profile = await prisma.profile.findUnique({
			where: { userId: user.id },
		});

		expect(profile).toBeNull();
	});

	it('cascades profile deletion when the user is deleted', async () => {
		// Arrange
		const user = await prisma.user.create({
			data: userFactory(),
		});

		await prisma.profile.create({
			data: profileFactory(user.id),
		});

		// Act
		await prisma.user.delete({
			where: { id: user.id },
		});

		// Assert
		const profile = await prisma.profile.findUnique({
			where: { userId: user.id },
		});

		expect(profile).toBeNull();
	});
});
