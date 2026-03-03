'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shadcn-ui/tabs';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserIcon, Edit01Icon } from '@hugeicons/core-free-icons';
import ProfileTab from './ProfileTab';
import ProfileEditTab from './ProfileEditTab';

type TabValue = 'view' | 'edit';

/**
 * ProfileSettingsView
 *
 * Tabs orchestrator for the settings/profile page.
 *
 * Tab 1 — View Profile: ProfileCard (read-only, has an Edit shortcut button)
 * Tab 2 — Edit Profile: EditProfileForm (pre-filled from current profile)
 *
 * Switching from View → Edit is exposed via ProfileCard's onEdit prop.
 * After a successful save, the tab resets to View so the user can see
 * their updated profile immediately.
 *
 * State is intentionally local — no URL param needed for a two-tab
 * settings panel where deep-linking isn't a requirement.
 */
const ProfileSettings = () => {
	const [activeTab, setActiveTab] = useState<TabValue>('view');

	return (
		<Tabs
			value={activeTab}
			onValueChange={(v) => setActiveTab(v as TabValue)}
			className="w-full"
		>
			{/* ── Tab triggers ──────────────────────────────────────────── */}
			<TabsList className="mb-6 grid w-full grid-cols-2 sm:w-auto sm:inline-flex">
				<TabsTrigger value="view" className="gap-2">
					<HugeiconsIcon icon={UserIcon} size={14} />
					View Profile
				</TabsTrigger>
				<TabsTrigger value="edit" className="gap-2">
					<HugeiconsIcon icon={Edit01Icon} size={14} />
					Edit Profile
				</TabsTrigger>
			</TabsList>

			{/* ── View tab ──────────────────────────────────────────────── */}
			<TabsContent value="view" className="mt-0 animate-fade-in">
				<ProfileTab onEditClick={() => setActiveTab('edit')} />
			</TabsContent>

			{/* ── Edit tab ──────────────────────────────────────────────── */}
			<TabsContent value="edit" className="mt-0 animate-fade-in">
				<ProfileEditTab onSaveSuccess={() => setActiveTab('view')} />
			</TabsContent>
		</Tabs>
	);
};

export default ProfileSettings;
