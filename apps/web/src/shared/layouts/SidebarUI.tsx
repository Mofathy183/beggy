import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/utils';

import {
	DashboardSquare01Icon,
	Luggage02Icon,
	ShoppingBag01Icon,
	Package01Icon,
	CloudSun,
	AiMagicIcon,
	UserGroupIcon,
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';
import type { Permission } from '@beggy/shared/types';
import { Action, Scope, Subject } from '@beggy/shared/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single navigation item in the sidebar.
 *
 * This is plain data — no JSX, no hooks.
 * It is defined once here and consumed by both
 * SidebarUI (rendering) and Sidebar.tsx (permission filtering).
 */
export interface NavItem {
	/** Unique key — used as React key and for active state matching */
	key: string;
	/** Display label shown next to the icon */
	label: string;
	/** Route path — compared against usePathname() for active detection */
	href: string;
	/** Hugeicons icon component reference */
	icon: IconSvgElement;
	/**
	 * Optional CASL permission gate.
	 * If absent → item is always shown.
	 * If present → shown only when ability.can(action, subject) is true.
	 */
	permission?: Permission;
}

// ─── Nav config ───────────────────────────────────────────────────────────────

/**
 * The full sidebar navigation definition for Beggy.
 *
 * Order here is the render order. Grouped logically:
 *  1. Overview
 *  2. Core packing entities (Suitcases → Bags → Items)
 *  3. Smart features (Weather, AI)
 *  4. Admin-only (Users)
 *
 * To add a new nav item: add an entry here.
 * To restrict it: add a `permission` field.
 * Everything else (rendering, filtering, active state) is handled elsewhere.
 */
export const NAV_ITEMS: NavItem[] = [
	{
		key: 'dashboard',
		label: 'Dashboard',
		href: '/dashboard',
		icon: DashboardSquare01Icon,
	},
	{
		key: 'suitcases',
		label: 'Suitcases',
		href: '/dashboard/suitcases',
		icon: Luggage02Icon,
		permission: {
			action: Action.READ,
			subject: Subject.SUITCASE,
			scope: Scope.OWN,
		},
	},
	{
		key: 'bags',
		label: 'Bags',
		href: '/dashboard/bags',
		icon: ShoppingBag01Icon,
		permission: {
			action: Action.READ,
			subject: Subject.BAG,
			scope: Scope.OWN,
		},
	},
	{
		key: 'items',
		label: 'Items',
		href: '/dashboard/items',
		icon: Package01Icon,
		permission: {
			action: Action.READ,
			subject: Subject.ITEM,
			scope: Scope.OWN,
		},
	},
	{
		key: 'weather',
		label: 'Weather',
		href: '/dashboard/weather',
		icon: CloudSun,
	},
	{
		key: 'ai-assistant',
		label: 'AI Assistant',
		href: '/dashboard/ai',
		icon: AiMagicIcon,
	},
	{
		key: 'users',
		label: 'Users',
		href: '/dashboard/users',
		icon: UserGroupIcon,
		// Only ADMIN and MODERATOR can READ USER — enforced by CASL
		permission: {
			action: Action.READ,
			subject: Subject.USER,
			scope: Scope.OWN,
		},
	},
];

/**
 * Groups for visual separation in the sidebar.
 *
 * 'main'  → Dashboard + core packing entities + smart features
 * 'admin' → Role-restricted items (Users, Roles, Permissions in the future)
 *
 * Items without a group are implicitly 'main'.
 */
export const NAV_GROUPS: Record<string, NavItem['key'][]> = {
	main: [
		'dashboard',
		'suitcases',
		'bags',
		'items',
		'weather',
		'ai-assistant',
	],
	admin: ['users'],
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SidebarUIProps {
	/**
	 * The filtered, permission-checked list of nav items to render.
	 *
	 * The smart Sidebar container is responsible for filtering by CASL ability.
	 * SidebarUI receives only items the current user is allowed to see.
	 * It has zero awareness of permissions, roles, or CASL.
	 */
	navItems: NavItem[];

	/**
	 * The current route pathname (from usePathname in the container).
	 * Used to derive the active state of each nav item.
	 */
	currentPath: string;

	/**
	 * Whether the sidebar is in its collapsed (icon-only) state.
	 * Controlled externally by Sidebar.tsx.
	 */
	isCollapsed: boolean;

	/** Fires when the collapse/expand toggle button is clicked. */
	onToggleCollapse: () => void;

	/** Optional className forwarded to the root <aside> element. */
	className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determines whether a nav item is active given the current path.
 *
 * Dashboard uses exact match to avoid matching everything that starts with '/dashboard'.
 * All other routes use startsWith so child routes (e.g. /dashboard/bags/123) stay active.
 */
const isNavItemActive = (href: string, currentPath: string): boolean => {
	if (href === '/dashboard') return currentPath === '/dashboard';
	return currentPath.startsWith(href);
};

// ─── NavLink ──────────────────────────────────────────────────────────────────

interface NavLinkProps {
	item: NavItem;
	isActive: boolean;
	isCollapsed: boolean;
}

/**
 * A single sidebar navigation link.
 *
 * Active state    → bg-sidebar-primary text-sidebar-primary-foreground
 * Hover state     → bg-sidebar-accent  text-sidebar-accent-foreground
 * Default state   → text-sidebar-foreground
 *
 * Sidebar tokens are always used here — never bg-primary or bg-accent
 * (those are for the main content area per design system §12.6).
 */
const NavLink = ({ item, isActive, isCollapsed }: NavLinkProps) => (
	<li>
		<a
			href={item.href}
			aria-label={isCollapsed ? item.label : undefined}
			aria-current={isActive ? 'page' : undefined}
			className={cn(
				// Base layout
				'flex items-center gap-3 rounded-lg px-3 py-2.5',
				'text-sm font-medium',
				'transition-colors duration-150',
				// Focus ring — uses sidebar-ring token
				'focus-visible:outline-2 focus-visible:outline-sidebar-ring focus-visible:outline-offset-2',
				// Collapsed: center icon, no gap needed
				isCollapsed && 'justify-center px-2',
				// State: active
				isActive
					? 'bg-sidebar-primary text-sidebar-primary-foreground'
					: [
							// State: default + hover
							'text-sidebar-foreground',
							'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
						]
			)}
		>
			{/* Icon — always visible */}
			<HugeiconsIcon
				icon={item.icon}
				size={18}
				strokeWidth={1.8}
				className="shrink-0"
				aria-hidden="true"
			/>

			{/* Label — hidden when collapsed */}
			{!isCollapsed && <span className="truncate">{item.label}</span>}
		</a>
	</li>
);

// ─── NavGroup ─────────────────────────────────────────────────────────────────

interface NavGroupProps {
	label: string;
	items: NavItem[];
	currentPath: string;
	isCollapsed: boolean;
}

/**
 * A labelled group of nav items with an optional separator.
 *
 * The group label is hidden when the sidebar is collapsed
 * (there's no space to show it) but the divider line stays
 * to preserve visual grouping.
 */
const NavGroup = ({
	label,
	items,
	currentPath,
	isCollapsed,
}: NavGroupProps) => {
	if (items.length === 0) return null;

	return (
		<div className="flex flex-col gap-0.5">
			{/* Group label */}
			{!isCollapsed && (
				<p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
					{label}
				</p>
			)}
			{isCollapsed && (
				<hr className="mx-2 border-sidebar-border" aria-hidden="true" />
			)}

			<ul role="list" className="flex flex-col gap-0.5">
				{items.map((item) => (
					<NavLink
						key={item.key}
						item={item}
						isActive={isNavItemActive(item.href, currentPath)}
						isCollapsed={isCollapsed}
					/>
				))}
			</ul>
		</div>
	);
};

// ─── SidebarUI ────────────────────────────────────────────────────────────────

/**
 * Pure presentational sidebar for the Beggy dashboard shell.
 *
 * ── Zero hooks · Zero Redux · Zero CASL · Zero side effects ──
 *
 * Layout (when expanded):
 * ┌─────────────────┐
 * │ 🧳 Beggy        │  ← Logo + wordmark
 * ├─────────────────┤
 * │ MAIN            │
 * │ ⊞ Dashboard     │  ← Nav items (main group)
 * │ 🧳 Suitcases    │
 * │ 👜 Bags         │
 * │ 📦 Items        │
 * │ ☁  Weather      │
 * │ ✨ AI Assistant  │
 * ├─────────────────┤
 * │ ADMIN           │
 * │ 👥 Users        │  ← Admin-only (already filtered by container)
 * └─────────────────┘
 *   [◀ Collapse]
 *
 * When collapsed: icon-only, 64px wide, labels hidden, groups show a divider line.
 */
const SidebarUI = ({
	navItems,
	currentPath,
	isCollapsed,
	onToggleCollapse,
	className,
}: SidebarUIProps) => {
	// Split nav items into groups using their key
	const mainItems = navItems.filter((i) =>
		[
			'dashboard',
			'suitcases',
			'bags',
			'items',
			'weather',
			'ai-assistant',
		].includes(i.key)
	);
	const adminItems = navItems.filter((i) => ['users'].includes(i.key));

	return (
		<aside
			aria-label="Main navigation"
			data-collapsed={isCollapsed}
			className={cn(
				// Sidebar-specific tokens — NEVER bg-background or bg-card here
				'bg-sidebar text-sidebar-foreground',
				'border-r border-sidebar-border',
				// Height: full viewport
				'flex h-full flex-col',
				// Width transitions between expanded and collapsed
				'transition-[width] duration-200 ease-in-out',
				isCollapsed ? 'w-16' : 'w-60',
				// No text overflow during collapse animation
				'overflow-hidden',
				className
			)}
		>
			{/* ── Navigation ────────────────────────────────────────── */}
			<nav
				aria-label="Dashboard navigation"
				className="flex flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden p-3"
			>
				{/* Main group — always present */}
				<NavGroup
					label="Main"
					items={mainItems}
					currentPath={currentPath}
					isCollapsed={isCollapsed}
				/>

				{/* Admin group — only renders when adminItems is non-empty */}
				{adminItems.length > 0 && (
					<>
						{/* Separator between groups */}
						{!isCollapsed && (
							<hr
								className="border-sidebar-border"
								aria-hidden="true"
							/>
						)}
						<NavGroup
							label="Admin"
							items={adminItems}
							currentPath={currentPath}
							isCollapsed={isCollapsed}
						/>
					</>
				)}
			</nav>

			{/* ── Collapse toggle ───────────────────────────────────── */}
			<div className="border-t border-sidebar-border p-3">
				<button
					type="button"
					onClick={onToggleCollapse}
					aria-label={
						isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
					}
					aria-expanded={!isCollapsed}
					className={cn(
						'flex w-full items-center gap-2.5 rounded-lg px-3 py-2',
						'text-sm font-medium text-sidebar-foreground',
						'transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
						'focus-visible:outline-2 focus-visible:outline-sidebar-ring focus-visible:outline-offset-2',
						isCollapsed && 'justify-center px-2'
					)}
				>
					<HugeiconsIcon
						icon={isCollapsed ? ArrowRight01Icon : ArrowLeft01Icon}
						size={16}
						strokeWidth={1.8}
						className="shrink-0"
						aria-hidden="true"
					/>
					{!isCollapsed && <span>Collapse</span>}
				</button>
			</div>
		</aside>
	);
};

export default SidebarUI;
