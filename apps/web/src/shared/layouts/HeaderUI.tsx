import Link from 'next/link';
import {
	Luggage01Icon,
	UserCircle02Icon,
	Settings02Icon,
	Logout05Icon,
	DashboardSquare01Icon,
	ArrowRight01Icon,
	Menu01Icon,
	Cancel01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import type { AuthMeProfileDTO } from '@beggy/shared/types';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface HeaderUIProps {
	/**
	 * The authenticated user's public profile.
	 *
	 * `null`  → guest mode: renders "Log in" + "Sign up" CTAs.
	 * non-null → authenticated mode: renders user avatar dropdown.
	 */
	profile: AuthMeProfileDTO | null;

	onDashboardClick?: () => void;

	/** Fires when "My Profile" in the user dropdown is clicked. */
	onProfileClick?: () => void;

	/** Fires when "Settings" in the user dropdown is clicked. */
	onSettingsClick?: () => void;

	/** Fires when "Log out" in the user dropdown is clicked. */
	onLogout?: () => void;

	/** Fires when the "Log in" CTA (guest mode only) is clicked. */
	onLoginClick?: () => void;

	/** Fires when the "Sign up" CTA (guest mode only) is clicked. */
	onSignUpClick?: () => void;

	onMobileMenuToggle?: () => void;
	isMobileMenuOpen?: boolean;

	/**
	 * ThemeToggle injected as a render slot.
	 *
	 * HeaderUI has zero theme awareness. The existing `<ThemeToggle />`
	 * already owns next-themes state internally — we inject it here so
	 * HeaderUI stays a pure, side-effect-free presentational component.
	 */
	themeToggle: React.ReactNode;

	/** Optional className forwarded to the root <header> element. */
	className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derives 1–2 character initials for the avatar fallback.
 *
 * Priority:
 *  1. displayName   → "Mohamed Fathy" → "MF"
 *  2. firstName + lastName            → "MF"
 *  3. firstName only                  → "M"
 */
const getAvatarFallback = (profile: AuthMeProfileDTO): string => {
	const source =
		profile.displayName?.trim() ||
		`${profile.firstName} ${profile.lastName}`.trim();

	return source
		.split(' ')
		.map((w) => w[0])
		.filter(Boolean)
		.slice(0, 2)
		.join('')
		.toUpperCase();
};

/**
 * Returns the best single label for the header's user trigger button.
 *
 * Priority:
 *  1. displayName (if trimmed and non-empty)
 *  2. firstName
 */
const getShortName = (profile: AuthMeProfileDTO): string =>
	profile.displayName?.trim() || profile.firstName;

// ─── UserMenu ─────────────────────────────────────────────────────────────────

interface UserMenuProps extends Pick<
	HeaderUIProps,
	'onDashboardClick' | 'onProfileClick' | 'onSettingsClick' | 'onLogout'
> {
	profile: AuthMeProfileDTO;
}

/**
 * Avatar trigger button + dropdown panel for authenticated users.
 *
 * FIX: `DropdownMenuLabel` is a Base UI Menu.GroupLabel part — it MUST
 * live inside a `DropdownMenuGroup` (which renders `<Menu.Group>`).
 * Placing it directly in `DropdownMenuContent` caused:
 *   "Base UI: MenuGroupRootContext is missing."
 *
 * Solution: every `DropdownMenuLabel` is now wrapped in its own
 * `DropdownMenuGroup` with `asChild` semantics intact.
 */
const UserMenu = ({
	profile,
	onDashboardClick,
	onProfileClick,
	onSettingsClick,
	onLogout,
}: UserMenuProps) => {
	const fallback = getAvatarFallback(profile);
	const shortName = getShortName(profile);
	const fullName = `${profile.firstName} ${profile.lastName}`.trim();

	return (
		<DropdownMenu>
			{/* ── Trigger ──────────────────────────────────────────── */}
			<DropdownMenuTrigger
				render={
					<button
						type="button"
						aria-label="Open user menu"
						className={cn(
							'flex items-center gap-2 rounded-lg px-2 py-1.5',
							'cursor-pointer select-none',
							'text-sm text-foreground',
							'transition-colors',
							'hover:bg-accent hover:text-accent-foreground',
							'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2'
						)}
					>
						<Avatar className="h-7 w-7 shrink-0 ring-2 ring-border">
							{profile.avatarUrl && (
								<AvatarImage
									src={profile.avatarUrl}
									alt={fullName}
								/>
							)}
							<AvatarFallback
								aria-hidden="true"
								className="bg-primary/12 text-xs font-semibold text-primary"
							>
								{fallback}
							</AvatarFallback>
						</Avatar>

						{/* Name label — visible on md+ only */}
						<span className="hidden max-w-[120px] truncate font-medium md:block">
							{shortName}
						</span>
					</button>
				}
			/>

			{/* ── Dropdown panel ───────────────────────────────────── */}
			<DropdownMenuContent
				align="end"
				sideOffset={8}
				className="w-60 rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-md"
			>
				{/* ── Identity block ───────────────────────────────────
				    FIX: DropdownMenuLabel MUST be inside DropdownMenuGroup.
				    Base UI's MenuLabel part requires the MenuGroup context
				    provided by DropdownMenuGroup. Without it you get:
				    "MenuGroupRootContext is missing."
				─────────────────────────────────────────────────────── */}
				<DropdownMenuGroup>
					<DropdownMenuLabel className="flex items-center gap-3 p-3">
						<Avatar className="h-10 w-10 shrink-0 ring-2 ring-border">
							{profile.avatarUrl && (
								<AvatarImage
									src={profile.avatarUrl}
									alt={fullName}
								/>
							)}
							<AvatarFallback className="bg-primary/12 text-sm font-semibold text-primary">
								{fallback}
							</AvatarFallback>
						</Avatar>

						<div className="flex min-w-0 flex-col">
							<span className="truncate text-sm font-semibold leading-tight text-foreground">
								{fullName}
							</span>

							{/* City + country — only when both are present */}
							{profile.city && profile.country && (
								<span className="mt-0.5 truncate text-xs text-muted-foreground">
									{profile.city}, {profile.country}
								</span>
							)}
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>

				<DropdownMenuSeparator className="bg-border" />

				{/* ── Nav items ────────────────────────────────────────── */}
				<DropdownMenuGroup className="p-1">
					<DropdownMenuItem
						onClick={onDashboardClick}
						className={cn(
							'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm',
							'text-foreground transition-colors',
							'hover:bg-accent hover:text-accent-foreground',
							'focus:bg-accent focus:text-accent-foreground'
						)}
					>
						<HugeiconsIcon
							icon={DashboardSquare01Icon}
							className="h-4 w-4 shrink-0 text-muted-foreground"
						/>
						<span>Dashboard</span>
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							className="ms-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
						/>
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={onProfileClick}
						className={cn(
							'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm',
							'text-foreground transition-colors',
							'hover:bg-accent hover:text-accent-foreground',
							'focus:bg-accent focus:text-accent-foreground'
						)}
					>
						<HugeiconsIcon
							icon={UserCircle02Icon}
							className="h-4 w-4 shrink-0 text-muted-foreground"
						/>
						<span>My Profile</span>
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							className="ms-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
						/>
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={onSettingsClick}
						className={cn(
							'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm',
							'text-foreground transition-colors',
							'hover:bg-accent hover:text-accent-foreground',
							'focus:bg-accent focus:text-accent-foreground'
						)}
					>
						<HugeiconsIcon
							icon={Settings02Icon}
							className="h-4 w-4 shrink-0 text-muted-foreground"
						/>
						<span>Settings</span>
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							className="ms-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
						/>
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator className="bg-border" />

				{/* ── Logout — soft destructive (§12.7) ────────────────── */}
				<div className="p-1">
					<DropdownMenuItem
						onClick={onLogout}
						className={cn(
							'flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm',
							'text-destructive transition-colors',
							'hover:bg-destructive/8 hover:text-destructive',
							'focus:bg-destructive/8 focus:text-destructive'
						)}
					>
						<HugeiconsIcon
							icon={Logout05Icon}
							className="h-4 w-4 shrink-0"
						/>
						<span>Log out</span>
					</DropdownMenuItem>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

// ─── GuestActions ─────────────────────────────────────────────────────────────

type GuestActionsProps = Pick<HeaderUIProps, 'onLoginClick' | 'onSignUpClick'>;

/**
 * "Log in" + "Sign up" rendered when profile is null.
 *
 * Visual hierarchy:
 *  - "Log in"  → ghost   (low weight — returning users know where it is)
 *  - "Sign up" → primary (highest weight — the conversion CTA)
 */
const GuestActions = ({ onLoginClick, onSignUpClick }: GuestActionsProps) => (
	<div className="flex items-center gap-2">
		<Button
			variant="ghost"
			size="sm"
			onClick={onLoginClick}
			className="h-8 px-3 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
		>
			Log in
		</Button>
		<Button
			variant="default"
			size="sm"
			onClick={onSignUpClick}
			className="h-8 px-3 text-sm"
		>
			Sign up
		</Button>
	</div>
);

// ─── HeaderUI ─────────────────────────────────────────────────────────────────

/**
 * Pure presentational header for the Beggy app shell.
 *
 * ── Zero hooks · Zero Redux · Zero side effects ──
 *
 * All data flows in as props. All interactions flow out as callbacks.
 *
 * Authenticated layout:
 *   [Logo]  ·····  [ThemeToggle]  │  [Avatar  Name ▾]
 *                                       ├─ My Profile
 *                                       ├─ Settings
 *                                       └─ Log out
 *
 * Guest layout:
 *   [Logo]  ·····  [ThemeToggle]  │  [Log in]  [Sign up]
 */
const HeaderUI = ({
	profile,
	onDashboardClick,
	onProfileClick,
	onSettingsClick,
	onLogout,
	onLoginClick,
	onSignUpClick,
	onMobileMenuToggle,
	isMobileMenuOpen,
	themeToggle,
	className,
}: HeaderUIProps) => {
	const isAuthenticated = profile !== null;

	return (
		<header
			role="banner"
			className={cn(
				// Frosted glass — content scrolls underneath
				'bg-background/80 backdrop-blur-md',
				// Separator from page body
				'border-b border-border',
				// Always visible, above all page layers
				'sticky top-0 z-50',
				// Layout
				'flex h-16 items-center px-4 md:px-6',
				className
			)}
		>
			{/* ── Logo ──────────────────────────────────────────────── */}
			<Link
				href="/"
				aria-label="Beggy – go to Home"
				className={cn(
					'flex shrink-0 items-center gap-2.5',
					'text-foreground no-underline',
					'transition-opacity hover:opacity-75',
					'focus-visible:rounded-sm focus-visible:outline-2',
					'focus-visible:outline-ring focus-visible:outline-offset-2'
				)}
			>
				{/* Brand mark */}
				<span
					aria-hidden="true"
					className={cn(
						'flex h-8 w-8 shrink-0 items-center justify-center',
						'rounded-lg bg-primary text-primary-foreground shadow-sm'
					)}
				>
					<HugeiconsIcon
						icon={Luggage01Icon}
						className="h-[18px] w-[18px]"
					/>
				</span>

				{/* Wordmark — hidden below sm breakpoint */}
				<span className="hidden text-lg font-semibold tracking-tight sm:block">
					Beggy
				</span>
			</Link>

			{onMobileMenuToggle && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={onMobileMenuToggle}
					aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={isMobileMenuOpen}
					aria-controls="mobile-sidebar"
					className="md:hidden h-9 w-9 text-foreground"
				>
					<HugeiconsIcon
						icon={isMobileMenuOpen ? Cancel01Icon : Menu01Icon}
						className="h-5 w-5"
					/>
				</Button>
			)}

			{/* Spacer */}
			<div className="flex-1" aria-hidden="true" />

			{/* ── Right-side actions ────────────────────────────────── */}
			<div className="flex items-center gap-1">
				{themeToggle}

				<span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />

				{isAuthenticated ? (
					<UserMenu
						profile={profile}
						onDashboardClick={onDashboardClick}
						onProfileClick={onProfileClick}
						onSettingsClick={onSettingsClick}
						onLogout={onLogout}
					/>
				) : (
					<GuestActions
						onLoginClick={onLoginClick}
						onSignUpClick={onSignUpClick}
					/>
				)}
			</div>
		</header>
	);
};

export default HeaderUI;
