'use client';

import { useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAbility } from '@shared/store/ability';
import SidebarUI, { type NavItem, NAV_ITEMS } from './SidebarUI';

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Smart container for the Beggy sidebar.
 *
 * What this component owns:
 *  ✅ Collapse/expand state (local — nothing else needs it)
 *  ✅ Active route detection via usePathname()
 *  ✅ Permission filtering via CASL ability
 *  ✅ Passes filtered, clean data to SidebarUI
 *
 * What this component deliberately does NOT own:
 *  ✗ Any JSX layout or styling — that lives entirely in SidebarUI
 *  ✗ Nav item definitions — those live in SidebarNav.ts
 *  ✗ Knowledge of auth, profiles, or themes
 *
 * Permission filtering:
 *  Items with no `permission` field are always shown.
 *  Items with a `permission` field are shown only when
 *  `ability.can(action, subject)` returns true.
 *
 *  This means:
 *  - Regular USER → sees Dashboard, Suitcases, Bags, Items, Weather, AI
 *  - ADMIN/MODERATOR → also sees Users (READ USER permission granted)
 *
 * The ability object comes from the CASL Redux slice, which is populated
 * after login by your auth flow (via `ability.slice.ts`).
 */
const Sidebar = () => {
	const pathname = usePathname();
	const ability = useAbility();

	// ── Collapse state — local, no Redux needed ──────────────────────────
	const [isCollapsed, setIsCollapsed] = useState(false);

	const handleToggleCollapse = useCallback(() => {
		setIsCollapsed((prev) => !prev);
	}, []);

	// ── Permission filtering ─────────────────────────────────────────────
	//
	// Filter NAV_ITEMS to only those the current user can access.
	//
	// Rules:
	//  - No `permission` field → always include (public nav item)
	//  - Has `permission` field → include only if ability.can(action, subject)
	//
	// This produces a clean list that SidebarUI renders without any
	// awareness of CASL, roles, or permissions.
	const visibleNavItems: NavItem[] = NAV_ITEMS.filter((item) => {
		if (!item.permission) return true;
		return ability.can(item.permission.action, item.permission.subject);
	});

	// ── Render ──────────────────────────────────────────────────────────

	return (
		<SidebarUI
			navItems={visibleNavItems}
			currentPath={pathname}
			isCollapsed={isCollapsed}
			onToggleCollapse={handleToggleCollapse}
		/>
	);
};

export default Sidebar;
