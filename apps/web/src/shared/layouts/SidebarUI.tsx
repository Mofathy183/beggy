import { HugeiconsIcon } from '@hugeicons/react';
import {
	ArrowLeft01Icon,
	ArrowRight01Icon,
	Luggage01Icon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { Separator } from '@/shared/components/ui/separator';

import {
	DashboardSquare01Icon,
	Package01Icon,
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

	/**
	 * When true, renders a dot indicator on this nav item.
	 * Set on the onboarding item while profile is incomplete.
	 */
	showDot?: boolean;
}

// ─── Nav config ───────────────────────────────────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
	{
		key: 'dashboard',
		label: 'Dashboard',
		href: '/dashboard',
		icon: DashboardSquare01Icon,
	},
	{
		key: 'items',
		label: 'Items',
		href: '/items',
		icon: Package01Icon,
		permission: {
			action: Action.READ,
			subject: Subject.ITEM,
			scope: Scope.OWN,
		},
	},
	{
		key: 'users',
		label: 'Users',
		href: '/users',
		icon: UserGroupIcon,
		permission: {
			action: Action.READ,
			subject: Subject.USER,
			scope: Scope.OWN,
		},
	},
];

export const NAV_GROUPS: Record<string, NavItem['key'][]> = {
	main: ['dashboard', 'items'],
	admin: ['users'],
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SidebarUIProps {
	navItems: NavItem[];
	currentPath: string;
	isCollapsed: boolean;
	onToggleCollapse: () => void;
	/** When true, renders a dot on the onboarding nav item */
	showOnboardingDot: boolean;
	className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
 * When collapsed: wraps in a Tooltip so the label is still accessible.
 * Active state    → bg-sidebar-primary text-sidebar-primary-foreground
 * Hover state     → bg-sidebar-accent  text-sidebar-accent-foreground
 * Default state   → text-sidebar-foreground
 */
const NavLink = ({ item, isActive, isCollapsed }: NavLinkProps) => {
	const linkContent = (
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
				// Collapsed: center icon
				isCollapsed && 'justify-center px-2',
				// Active state
				isActive
					? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
					: [
							'text-sidebar-foreground',
							'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
						]
			)}
		>
			{/* Icon — relative so the dot can anchor to it when collapsed */}
			<span className="relative shrink-0">
				<HugeiconsIcon
					icon={item.icon}
					size={18}
					strokeWidth={isActive ? 2 : 1.6}
					aria-hidden="true"
				/>
				{/* Dot when collapsed — anchors to top-right of icon */}
				{item.showDot && isCollapsed && (
					<span
						className="bg-primary border-sidebar absolute -end-1 -top-1 h-2 w-2 rounded-full border"
						aria-label="Action required"
					/>
				)}
			</span>

			{/* Label + dot when expanded */}
			{!isCollapsed && (
				<>
					<span className="flex-1 truncate">{item.label}</span>
					{item.showDot && (
						<span
							className="bg-primary ms-auto h-2 w-2 shrink-0 rounded-full"
							aria-label="Action required"
						/>
					)}
				</>
			)}
		</a>
	);

	if (isCollapsed) {
		return (
			<li>
				<Tooltip>
					<TooltipTrigger render={linkContent} />
					<TooltipContent side="right" sideOffset={8}>
						{item.label}
						{item.showDot && (
							<span className="text-muted-foreground ms-1 text-xs">
								· action required
							</span>
						)}
					</TooltipContent>
				</Tooltip>
			</li>
		);
	}

	return <li>{linkContent}</li>;
};

// ─── NavGroup ─────────────────────────────────────────────────────────────────

interface NavGroupProps {
	label: string;
	items: NavItem[];
	currentPath: string;
	isCollapsed: boolean;
}

const NavGroup = ({
	label,
	items,
	currentPath,
	isCollapsed,
}: NavGroupProps) => {
	if (items.length === 0) return null;

	return (
		<div className="flex flex-col gap-0.5">
			{/* Group label — hidden when collapsed, replaced by a divider */}
			{!isCollapsed ? (
				<p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 select-none">
					{label}
				</p>
			) : (
				<div className="px-2 py-1" aria-hidden="true">
					<Separator className="bg-sidebar-border" />
				</div>
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

// ─── Logo ─────────────────────────────────────────────────────────────────────

interface LogoProps {
	isCollapsed: boolean;
}

/**
 * Sidebar logo / wordmark.
 * Collapses to icon-only when sidebar is collapsed.
 */
const Logo = ({ isCollapsed }: LogoProps) => (
	<div
		className={cn(
			'flex items-center gap-2.5 px-3 py-3',
			isCollapsed && 'justify-center px-2'
		)}
	>
		{/* Icon mark — always visible */}
		<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
			<HugeiconsIcon
				icon={Luggage01Icon}
				size={15}
				strokeWidth={2}
				className="text-sidebar-primary-foreground"
				aria-hidden="true"
			/>
		</div>

		{/* Wordmark — hidden when collapsed */}
		{!isCollapsed && (
			<span className="text-base font-semibold tracking-tight text-sidebar-foreground">
				Beggy
			</span>
		)}
	</div>
);

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
 * │ ⊞ Dashboard     │
 * │ 📦 Items        │
 * ├─────────────────┤
 * │ ADMIN           │
 * │ 👥 Users        │
 * └─────────────────┘
 *   [◀ Collapse]
 *
 * When collapsed: 64 px wide, icon-only, group labels replaced by Separator,
 * nav items wrapped in Tooltip for label accessibility.
 */
const SidebarUI = ({
	navItems,
	currentPath,
	isCollapsed,
	onToggleCollapse,
	showOnboardingDot,
	className,
}: SidebarUIProps) => {
	// Inject showDot onto the dashboard item (the entry point to onboarding)
	// This keeps NavItem config clean — dot state is not hardcoded in config
	const itemsWithDot: NavItem[] = navItems.map((item) =>
		item.key === 'dashboard' && showOnboardingDot
			? { ...item, showDot: true }
			: item
	);

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
	const adminItems = itemsWithDot.filter((i) => ['users'].includes(i.key));

	return (
		<TooltipProvider delay={200}>
			<aside
				aria-label="Main navigation"
				data-collapsed={isCollapsed}
				className={cn(
					// Sidebar-scoped tokens — never bg-background or bg-card here
					'bg-sidebar text-sidebar-foreground',
					'border-e border-sidebar-border',
					// Full height, flex column
					'flex h-full flex-col',
					// Smooth width transition
					'transition-[width] duration-200 ease-in-out',
					isCollapsed ? 'w-16' : 'w-60',
					'overflow-hidden',
					className
				)}
			>
				{/* ── Logo ──────────────────────────────────────────────── */}
				<div className="border-b border-sidebar-border">
					<Logo isCollapsed={isCollapsed} />
				</div>

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
							{!isCollapsed && (
								<Separator
									className="bg-sidebar-border"
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
					{isCollapsed ? (
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={onToggleCollapse}
										aria-label="Expand sidebar"
										aria-expanded={false}
										className={cn(
											'w-full text-sidebar-foreground',
											'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
											'focus-visible:outline-sidebar-ring'
										)}
									>
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											size={16}
											strokeWidth={1.8}
											aria-hidden="true"
										/>
									</Button>
								}
							/>
							<TooltipContent side="right" sideOffset={8}>
								Expand sidebar
							</TooltipContent>
						</Tooltip>
					) : (
						<Button
							type="button"
							variant="ghost"
							onClick={onToggleCollapse}
							aria-label="Collapse sidebar"
							aria-expanded={true}
							className={cn(
								'w-full justify-start gap-2.5',
								'text-sm font-medium text-sidebar-foreground',
								'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
								'focus-visible:outline-sidebar-ring'
							)}
						>
							<HugeiconsIcon
								icon={ArrowLeft01Icon}
								size={16}
								strokeWidth={1.8}
								className="shrink-0"
								aria-hidden="true"
							/>
							<span>Collapse</span>
						</Button>
					)}
				</div>
			</aside>
		</TooltipProvider>
	);
};

export default SidebarUI;
