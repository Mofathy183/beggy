'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@shadcn-ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn-ui/card';
import { Badge } from '@shadcn-ui/badge';
import { Separator } from '@shadcn-ui/separator';
import { Skeleton } from '@shadcn-ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@shadcn-ui/alert';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@shadcn-ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@shadcn-ui/tooltip';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import {
	ArrowLeft02Icon,
	AlertCircleIcon,
	PencilEdit02Icon,
	Delete02Icon,
	WeightScale01Icon,
	CubeIcon,
	Calendar01Icon,
	Edit01Icon,
} from '@hugeicons/core-free-icons';

import { UpdateItemForm } from '@features/items/components/forms';
import ItemCategoryBadge from '@features/items/components/badges/ItemCategoryBadge';
import ItemFragileBadge from '@features/items/components/badges/ItemFragileBadge';

import { useItemDetails, useItemsActions } from '@features/items/hooks';
import { WEIGHT_UNIT_META, VOLUME_UNIT_META } from '@shared-ui/mappers';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (value: number): string => parseFloat(value.toFixed(2)).toString();

const formatDate = (iso: string): string =>
	new Date(iso).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

// ─── Skeleton ──────────────────────────────────────────────────────────────────

/**
 * Mirrors the final card structure so layout shift is minimal.
 */
const ItemDetailsSkeleton = () => (
	<div className="flex flex-col gap-6 p-6">
		{/* Back button */}
		<Skeleton className="h-8 w-24 rounded-md" />

		{/* Header */}
		<div className="flex items-start justify-between">
			<div className="flex flex-col gap-2">
				<Skeleton className="h-7 w-48 rounded" />
				<Skeleton className="h-4 w-24 rounded-full" />
			</div>
			<div className="flex gap-2">
				<Skeleton className="h-9 w-20 rounded-md" />
				<Skeleton className="h-9 w-20 rounded-md" />
			</div>
		</div>

		{/* Card */}
		<Card>
			<CardHeader>
				<Skeleton className="h-5 w-32 rounded" />
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex gap-2">
					<Skeleton className="h-6 w-24 rounded-full" />
					<Skeleton className="h-6 w-16 rounded-full" />
				</div>
				<Skeleton className="h-px w-full" />
				<div className="flex gap-3">
					<Skeleton className="h-14 w-32 rounded-lg" />
					<Skeleton className="h-14 w-32 rounded-lg" />
				</div>
				<Skeleton className="h-px w-full" />
				<div className="flex flex-col gap-1.5">
					<Skeleton className="h-4 w-40 rounded" />
					<Skeleton className="h-4 w-36 rounded" />
				</div>
			</CardContent>
		</Card>
	</div>
);

// ─── Measurement badge ─────────────────────────────────────────────────────────

/**
 * A structured measurement display using shadcn Badge + Tooltip.
 * Icon identifies the type; value + symbol give the reading.
 */
const MeasurementBadge = ({
	icon,
	value,
	symbol,
	label,
}: {
	icon: IconSvgElement;
	value: string;
	symbol: string;
	label: string;
}) => (
	<Tooltip>
		<TooltipTrigger>
			<div
				className="bg-muted border-border flex cursor-default items-center gap-2.5 rounded-lg border px-3 py-2.5"
				aria-label={`${label}: ${value} ${symbol}`}
			>
				<HugeiconsIcon
					icon={icon}
					className="text-muted-foreground size-4 flex-shrink-0"
					aria-hidden="true"
				/>
				<div className="flex flex-col gap-0.5">
					<span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
						{label}
					</span>
					<span className="text-foreground text-sm font-semibold tabular-nums">
						{value}{' '}
						<span className="text-muted-foreground font-normal">
							{symbol}
						</span>
					</span>
				</div>
			</div>
		</TooltipTrigger>
		<TooltipContent side="bottom">
			<p>
				{label}: {value} {symbol}
			</p>
		</TooltipContent>
	</Tooltip>
);

// ─── Component ─────────────────────────────────────────────────────────────────

type ItemDetailsPageProps = {
	id: string;
};

/**
 * ItemDetailsPage
 *
 * @description
 * Detail page for a single item. Composes shadcn primitives throughout:
 * - `Card` / `CardHeader` / `CardContent` — detail surface
 * - `Badge`             — color indicator pill
 * - `Separator`         — section dividers
 * - `Dialog`            — edit form overlay
 * - `Tooltip`           — measurement labels on hover
 * - `Skeleton`          — loading state
 * - `Alert`             — error state (soft destructive pattern §12.7)
 *
 * @remarks
 * Three explicit visual states:
 * 1. Loading    → `ItemDetailsSkeleton`
 * 2. Error/404  → soft destructive `Alert` with optional retry
 * 3. Loaded     → full detail card with badges, measurements, timestamps
 */
const ItemDetailsPage = ({ id }: ItemDetailsPageProps) => {
	const router = useRouter();

	const { item, isLoading, notFound, error, refetch } = useItemDetails(id);
	const { remove, isDeleting, isUpdating } = useItemsActions();

	const [editOpen, setEditOpen] = useState(false);

	// ── Unit meta ─────────────────────────────────────────────────────────────
	const weightMeta = item
		? WEIGHT_UNIT_META.find((m) => m.value === item.weightUnit)
		: null;
	const volumeMeta = item
		? VOLUME_UNIT_META.find((m) => m.value === item.volumeUnit)
		: null;

	const handleDelete = async () => {
		if (!item) return;
		await remove(item.id, {
			onSuccess: () => router.push('/items'),
		});
	};

	// ── Loading ───────────────────────────────────────────────────────────────
	if (isLoading) {
		return <ItemDetailsSkeleton />;
	}

	// ── Error / not found ────────────────────────────────────────────────────
	if (notFound || error || !item) {
		return (
			<div className="flex flex-col gap-4 p-6">
				<Button
					variant="ghost"
					size="sm"
					className="w-fit"
					onClick={() => router.push('/items')}
				>
					<HugeiconsIcon
						icon={ArrowLeft02Icon}
						className="mr-2 size-4"
					/>
					Back to items
				</Button>

				<Alert className="border-destructive/30 bg-destructive/8 text-foreground">
					<HugeiconsIcon
						icon={AlertCircleIcon}
						size={16}
						className="text-destructive"
					/>
					<AlertTitle className="text-destructive font-semibold">
						{notFound ? 'Item not found' : 'Something went wrong'}
					</AlertTitle>
					<AlertDescription className="text-muted-foreground text-sm">
						{notFound
							? "This item doesn't exist or may have been deleted."
							: "We couldn't load this item. Try again."}
					</AlertDescription>
					{!notFound && (
						<Button
							variant="outline"
							size="sm"
							className="mt-3"
							onClick={() => refetch()}
						>
							Try again
						</Button>
					)}
				</Alert>
			</div>
		);
	}

	// ── Loaded ────────────────────────────────────────────────────────────────
	const wasEdited = item.updatedAt !== item.createdAt;

	return (
		<div className="flex flex-col gap-6 p-6">
			{/* ── Back navigation ──────────────────────────────────────────── */}
			<Button
				variant="ghost"
				size="sm"
				className="text-muted-foreground hover:text-foreground -ml-2 w-fit"
				onClick={() => router.push('/items')}
			>
				<HugeiconsIcon
					icon={ArrowLeft02Icon}
					className="mr-1.5 size-4"
				/>
				Items
			</Button>

			{/* ── Page header: name + action buttons ───────────────────────── */}
			<div className="flex items-start justify-between gap-4">
				<h1 className="text-foreground text-2xl font-semibold tracking-tight">
					{item.name}
				</h1>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setEditOpen(true)}
						disabled={isUpdating || isDeleting}
					>
						<HugeiconsIcon
							icon={PencilEdit02Icon}
							className="mr-2 size-4"
						/>
						Edit
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={handleDelete}
						disabled={isUpdating || isDeleting}
					>
						<HugeiconsIcon
							icon={Delete02Icon}
							className="mr-2 size-4"
						/>
						{isDeleting ? 'Deleting…' : 'Delete'}
					</Button>
				</div>
			</div>

			{/* ── Detail card ──────────────────────────────────────────────── */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base font-semibold">
						Item details
					</CardTitle>
				</CardHeader>

				<CardContent className="flex flex-col gap-5">
					{/* ── Badges: category + fragile ───────────────────────── */}
					<div className="flex flex-wrap items-center gap-2">
						<ItemCategoryBadge category={item.category} size="md" />
						<ItemFragileBadge
							isFragile={item.isFragile}
							size="md"
						/>
					</div>

					{/* ── Color badge ──────────────────────────────────────── */}
					{item.color && (
						<>
							<Separator />
							<div className="flex flex-col gap-1.5">
								<span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
									Color
								</span>
								{/*
								 * Badge used as a color pill.
								 * Inline style for backgroundColor is intentional —
								 * item.color is user-defined data, not a semantic state.
								 * No token exists for arbitrary color strings.
								 */}
								<Badge
									className="w-fit gap-1.5 capitalize"
									style={{ backgroundColor: item.color }}
									aria-label={`Color: ${item.color}`}
								>
									{item.color}
								</Badge>
							</div>
						</>
					)}

					<Separator />

					{/* ── Measurements ─────────────────────────────────────── */}
					<div className="flex flex-col gap-1.5">
						<span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
							Measurements
						</span>
						<div className="flex flex-wrap gap-3">
							<MeasurementBadge
								icon={WeightScale01Icon}
								value={fmt(item.weight)}
								symbol={weightMeta?.symbol ?? item.weightUnit}
								label="Weight"
							/>
							<MeasurementBadge
								icon={CubeIcon}
								value={fmt(item.volume)}
								symbol={volumeMeta?.symbol ?? item.volumeUnit}
								label="Volume"
							/>
						</div>
					</div>

					<Separator />

					{/* ── Timestamps ───────────────────────────────────────── */}
					<div className="flex flex-col gap-2">
						<span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
							History
						</span>

						{/* Added row */}
						<div className="flex items-center gap-2">
							<Badge
								variant="secondary"
								className="gap-1.5 font-normal"
							>
								<HugeiconsIcon
									icon={Calendar01Icon}
									className="size-3"
									aria-hidden="true"
								/>
								Added
							</Badge>
							<span className="text-foreground text-sm">
								{formatDate(item.createdAt)}
							</span>
						</div>

						{/* Last updated row — only when different from createdAt */}
						{wasEdited && (
							<div className="flex items-center gap-2">
								<Badge
									variant="secondary"
									className="gap-1.5 font-normal"
								>
									<HugeiconsIcon
										icon={Edit01Icon}
										className="size-3"
										aria-hidden="true"
									/>
									Updated
								</Badge>
								<span className="text-foreground text-sm">
									{formatDate(item.updatedAt)}
								</span>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* ── Edit dialog ──────────────────────────────────────────────── */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className="sm:max-w-lg overflow-hidden p-0">
					<DialogHeader className="sr-only">
						<DialogTitle>Edit {item.name}</DialogTitle>
					</DialogHeader>
					<UpdateItemForm
						item={item}
						onSuccess={() => {
							setEditOpen(false);
							refetch();
						}}
						onCancel={() => setEditOpen(false)}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ItemDetailsPage;
