/**
 * Beggy - Your Seasoned Travel Buddy
 *
 * Tone Guide:
 * - Confident but humble: "From my travels, I've found..."
 * - Encouraging, not pushy: "You might want to try..."
 * - Solution-focused: "Let's figure this out together"
 * - Playful but not distracting: Just enough personality
 * - Practical wisdom: Explain the "why"
 */

import { ErrorCode } from '@/constants';

/**
 * Beggy - Your Seasoned Travel Buddy
 *
 * SUCCESS MESSAGES (Beggy-style)
 * Confident but humble • Encouraging • Practical wisdom • Playful edge
 */
export const SuccessMessages = {
	// ============================================================================
	// AUTHENTICATION & ACCOUNT
	// ============================================================================
	SIGNUP_SUCCESS:
		'Welcome aboard, traveler! Go ahead and check your email — we’ll get your account verified and your next adventure packed right.',
	LOGIN_SUCCESS:
		'Hey there, good to see you again! Let’s pick up where we left off and get you packing like a pro.',
	LOGOUT_SUCCESS:
		'All logged out! I’ve kept your bags safe for when wanderlust calls again.',
	EMAIL_VERIFIED:
		'Email confirmed! From here on, it’s smooth sailing — or flying, depending on your next trip.',
	EMAIL_VERIFICATION_SENT:
		'Verification sent! Give your inbox a quick peek in the next 5 minutes.',
	PASSWORD_RESET_SENT:
		'A reset link is on its way — check your inbox soon so we can get you back on track.',
	PASSWORD_RESET_SUCCESS:
		'All set! Password updated. You’re secure and ready for takeoff.',
	PASSWORD_CHANGED:
		'Your password’s been updated — smart move, traveler. Always good to keep your digital luggage locked tight.',

	// OAuth
	GOOGLE_LOGIN_SUCCESS:
		'Signed in with Google! You’re ready to start planning that next getaway.',
	FACEBOOK_LOGIN_SUCCESS:
		'Signed in with Facebook — nice and easy! Your packing lists await.',
	OAUTH_ACCOUNT_LINKED:
		'Accounts successfully linked! One less thing to remember on your next journey.',

	// Profile & Preferences
	PROFILE_UPDATED:
		'Profile updated! I’ve saved your preferences so packing gets easier each time.',
	PREFERENCES_SAVED:
		'Got it! I’ll remember these packing preferences next time wanderlust strikes.',

	// ============================================================================
	// BAGS
	// ============================================================================
	BAG_CREATED:
		'New bag added — exciting! From experience, start with heavier items at the bottom to keep things balanced.',
	BAG_UPDATED: 'Bag updated! Smart tweaks always make travel smoother.',
	BAG_DELETED:
		'Bag archived. Sometimes even seasoned travelers like to declutter before their next trip!',
	BAGS_FETCHED:
		'Here we go — all your bags, neatly organized and ready for review.',
	BAG_DUPLICATED:
		'Bag duplicated! Handy trick for similar trips — saves you time and second-guessing.',
	BAG_CAPACITY_OPTIMIZED:
		'I ran the numbers — your bag’s packed efficiently! You’re traveling light and smart.',

	// ============================================================================
	// SUITCASES
	// ============================================================================
	SUITCASE_CREATED:
		'Suitcase ready! Quick tip from the road — pack outfits together, it makes mornings simpler.',
	SUITCASE_UPDATED:
		'Suitcase details updated! Every little tweak adds up to a smoother journey.',
	SUITCASE_DELETED:
		'Suitcase removed from your collection. Clean slates make room for new adventures!',
	SUITCASES_FETCHED:
		'Here are your suitcases, all organized and standing by for your next itinerary.',
	SUITCASE_WEIGHT_CHECKED:
		'Weight check complete — looks like you’re well within airline limits. Nicely balanced!',

	// ============================================================================
	// ITEMS
	// ============================================================================
	ITEM_CREATED:
		'Item added! Smart travelers always keep track of what they pack — saves surprises later.',
	ITEM_UPDATED:
		'Item updated successfully. Little adjustments now mean smoother travel later.',
	ITEM_DELETED:
		'Item removed — sometimes traveling lighter really *is* the best way.',
	ITEMS_FETCHED:
		'Here’s your full collection. Everything’s ready to pack, no socks left behind!',
	ITEM_MOVED:
		'Item moved! Reorganizing as you go — classic pro-traveler move.',

	// ============================================================================
	// BAG-ITEMS (Items packed in bags)
	// ============================================================================
	ITEM_ADDED_TO_BAG:
		'Item packed! Quick pro tip — rolling your clothes can save up to 30% space.',
	ITEM_REMOVED_FROM_BAG:
		'Item unpacked! Always good to keep things flexible.',
	BAG_ITEMS_REORDERED:
		'Items rearranged! Keep the essentials near the top — it saves digging later.',
	BAG_ITEMS_FETCHED: 'Here’s everything in your bag — all accounted for.',
	ITEM_QUANTITY_UPDATED: 'Quantity updated! Smart of you to track multiples.',
	BAG_EMPTIED:
		'Bag emptied — fresh start, fresh trip. Let’s get it ready for your next plan.',

	// ============================================================================
	// SUITCASE-ITEMS (Items packed in suitcases)
	// ============================================================================
	ITEM_ADDED_TO_SUITCASE:
		'Item packed into your suitcase! Heavy items near the wheels — trust me, your arms will thank you.',
	ITEM_REMOVED_FROM_SUITCASE:
		'Item removed. Adjusting on the go — just how seasoned travelers do it.',
	SUITCASE_ITEMS_REORDERED:
		'Suitcase reorganized! Future-you will love how easy unpacking is now.',
	SUITCASE_ITEMS_FETCHED:
		'All your suitcase items are listed and ready for review.',
	SUITCASE_EMPTIED:
		'Suitcase emptied! Feels like the end of a great trip — or the start of a new one.',

	// ============================================================================
	// GENERAL OPERATIONS
	// ============================================================================
	DATA_EXPORTED:
		'Packing list exported! A smart move — backups are every traveler’s best friend.',
	DATA_IMPORTED:
		'Data imported successfully! Your packing history is now up-to-date and travel-ready.',
	CHANGES_SAVED:
		'All changes saved! You’re all set for smoother packing next time.',
	OPERATION_SUCCESSFUL:
		'Done and dusted! That went off without a hitch — nice work.',
} as const;

/**
 * Beggy - Your Seasoned Travel Buddy
 *
 * ERROR MESSAGES (Beggy-style)
 * Calm under pressure • Encouraging • Lightly playful • Solution-minded
 */
export const ErrorMessages: Record<ErrorCode, string> = {
	// ============================================================================
	// CLIENT ERRORS (4xx)
	// ============================================================================

	// 400 Bad Request
	[ErrorCode.BAD_REQUEST]:
		'Hmm, that request looks a little off. Let’s give it another look together.',
	[ErrorCode.VALIDATION_ERROR]:
		'A couple of details need tweaking before we move forward — no worries, happens to the best of us.',
	[ErrorCode.INVALID_INPUT]:
		'That info doesn’t look quite right. Let’s double-check it.',
	[ErrorCode.MISSING_REQUIRED_FIELDS]:
		'Looks like we’re missing a few essentials — like forgetting socks before a trip!',
	[ErrorCode.INVALID_FORMAT]:
		'That format’s a bit off. Happens when we rush — let’s fix it up.',

	// 401 Unauthorized
	[ErrorCode.UNAUTHORIZED]:
		'Hold up, traveler — you’ll need to sign in before I can show your packing lists.',
	[ErrorCode.INVALID_CREDENTIALS]:
		'Hmm, those login details don’t seem to match my notes. Let’s give it another shot.',
	[ErrorCode.TOKEN_EXPIRED]:
		'Looks like your session took a long layover. Time to sign in again!',
	[ErrorCode.TOKEN_INVALID]:
		'That login token’s acting suspicious. Let’s refresh and try again.',
	[ErrorCode.TOKEN_MISSING]:
		'Before we go further, I just need to confirm who you are.',
	[ErrorCode.ACCOUNT_NOT_VERIFIED]:
		'Almost there! Verify your email and we’ll get you packing in no time.',
	[ErrorCode.SESSION_EXPIRED]:
		'Your session took a quick nap — log back in and we’ll pick up where we left off.',

	// 403 Forbidden
	[ErrorCode.FORBIDDEN]: 'Ah, this part’s reserved for another traveler.',
	[ErrorCode.INSUFFICIENT_PERMISSIONS]:
		'Looks like you don’t have permission for that one. No biggie — we can adjust your access.',
	[ErrorCode.ROLE_RESTRICTED]:
		'That feature’s for a different membership level — think of it like business class access.',
	[ErrorCode.ACCESS_DENIED]:
		'Access denied. Some areas are off-limits — safety first!',

	// 404 Not Found
	[ErrorCode.NOT_FOUND]:
		'Hmm, can’t seem to find what you’re looking for. Maybe it’s hidden in the bottom of the bag?',
	[ErrorCode.RESOURCE_NOT_FOUND]:
		'That item seems to have wandered off. Happens during long trips!',
	[ErrorCode.USER_NOT_FOUND]:
		'Couldn’t find a traveler with those details. Maybe try a different email?',
	[ErrorCode.BAG_NOT_FOUND]:
		'That bag’s not in your collection — maybe it was archived?',
	[ErrorCode.SUITCASE_NOT_FOUND]:
		'Can’t spot that suitcase anywhere. Let’s double-check your list.',
	[ErrorCode.ITEM_NOT_FOUND]:
		'That item’s gone missing. Maybe it didn’t make it into the list yet?',
	[ErrorCode.BAG_ITEM_NOT_FOUND]:
		'That item isn’t currently in this bag. Easy fix!',
	[ErrorCode.SUITCASE_ITEM_NOT_FOUND]:
		'That item isn’t packed in this suitcase. We can move it over easily.',

	[ErrorCode.PAGE_NOT_FOUND]:
		'Looks like we’ve wandered off the map — this page doesn’t seem to exist.',
	[ErrorCode.ROUTE_NOT_FOUND]:
		'Hmm, that route isn’t on my itinerary. Maybe it’s been moved or renamed?',

	// 409 Conflict
	[ErrorCode.CONFLICT]:
		'Something here’s overlapping — like two trips on the same day. Let’s sort that out.',
	[ErrorCode.EMAIL_ALREADY_EXISTS]:
		'Someone’s already traveling with this email. Try logging in instead.',
	[ErrorCode.BAG_NAME_CONFLICT]:
		'You already have a bag with that name — maybe give it a twist like ‘Summer Carry-On 2’?',
	[ErrorCode.SUITCASE_NAME_CONFLICT]:
		'You’ve got another suitcase with that name. Let’s rename one for clarity.',
	[ErrorCode.DUPLICATE_ITEM]:
		'That item’s already on your list — no need to pack it twice!',
	[ErrorCode.ITEM_ALREADY_PACKED]:
		'Looks like that item’s already in the bag. Good instincts though.',

	// 422 Unprocessable Entity
	[ErrorCode.UNPROCESSABLE_ENTITY]:
		'Something about this setup doesn’t quite add up. Let’s adjust a few details.',
	[ErrorCode.BAG_OVERWEIGHT]:
		'Your bag’s feeling heavy! Airlines might have opinions on that one.',
	[ErrorCode.BAG_OVER_CAPACITY]:
		'This bag’s absolutely stuffed — I’d be worried about the zipper too.',
	[ErrorCode.SUITCASE_OVERWEIGHT]:
		'That suitcase is tipping the scales! Might be time to redistribute a bit.',
	[ErrorCode.SUITCASE_OVER_CAPACITY]:
		'Completely full — not even room for a souvenir!',
	[ErrorCode.INVALID_BAG_CONFIGURATION]:
		'Those bag settings don’t look quite right. Let’s re-measure and try again.',
	[ErrorCode.INVALID_SUITCASE_CONFIGURATION]:
		'That suitcase setup might need a small adjustment.',
	[ErrorCode.INVALID_BAG_DIMENSIONS]:
		'Hmm, those bag dimensions seem unusual — maybe double-check them.',
	[ErrorCode.INVALID_SUITCASE_DIMENSIONS]:
		'Those suitcase dimensions don’t seem to match typical travel sizes.',
	[ErrorCode.INVALID_WEIGHT_VALUE]:
		'That weight value seems off. Let’s make sure it’s in pounds or kilos.',
	[ErrorCode.INVALID_CAPACITY_VALUE]:
		'That capacity entry doesn’t look right — let’s double-check your units.',
	[ErrorCode.CANNOT_PACK_ITEM]:
		'That item won’t fit with the current setup. Happens to the best packers!',

	// 429 Rate Limiting
	[ErrorCode.RATE_LIMITED]:
		'Whoa there, speedy packer! Let’s take a short breather before trying again.',
	[ErrorCode.TOO_MANY_REQUESTS]:
		'You’re moving fast! Give it a second — even seasoned travelers pause for water.',

	// ============================================================================
	// SERVER ERRORS (5xx)
	// ============================================================================

	[ErrorCode.INTERNAL_ERROR]:
		'Something unexpected happened on my end. Don’t worry — your data’s safe.',
	[ErrorCode.DATABASE_ERROR]:
		'My packing database is taking a quick nap. We’ll get it back up soon.',
	[ErrorCode.UNKNOWN_ERROR]:
		'That one’s a mystery — even for me. Let’s try refreshing the page.',
	[ErrorCode.OPERATION_FAILED]:
		'That didn’t go through quite as planned. We’ll get it sorted out soon.',

	// 502/503/504
	[ErrorCode.SERVICE_UNAVAILABLE]:
		'Looks like one of my tools is offline for a moment. Let’s try again soon.',
	[ErrorCode.EXTERNAL_API_ERROR]:
		'One of my travel partners isn’t responding. We’ll give it another go shortly.',

	// ============================================================================
	// AUTHENTICATION SPECIFIC
	// ============================================================================
	[ErrorCode.INVALID_EMAIL]:
		'That email doesn’t look quite right — maybe a small typo?',
	[ErrorCode.INVALID_PASSWORD]:
		'That password format isn’t valid. Let’s try one that’s a bit stronger.',
	[ErrorCode.PASSWORD_TOO_WEAK]:
		'That password’s a bit light — let’s beef it up for safe travels.',
	[ErrorCode.PASSWORDS_DO_NOT_MATCH]:
		'Those passwords don’t quite match — let’s sync them up.',
	[ErrorCode.CURRENT_PASSWORD_INCORRECT]:
		'That current password doesn’t match what I have on file.',
	[ErrorCode.SAME_AS_OLD_PASSWORD]:
		'Try something new — reusing old passwords is like wearing yesterday’s socks.',

	// Email & tokens
	[ErrorCode.EMAIL_SEND_FAILED]:
		'Hmm, that email didn’t make it out. Let’s try resending.',
	[ErrorCode.VERIFICATION_TOKEN_INVALID]:
		'That verification link seems off. Let’s grab a new one.',
	[ErrorCode.VERIFICATION_TOKEN_EXPIRED]:
		'That verification link expired — they only last so long, like flight check-ins!',
	[ErrorCode.RESET_TOKEN_INVALID]:
		'That password reset link doesn’t seem valid anymore. Let’s request a fresh one.',
	[ErrorCode.RESET_TOKEN_EXPIRED]:
		'That reset link’s past its prime. Let’s get you a new one.',
	[ErrorCode.ALREADY_VERIFIED]:
		'You’re already verified! No need to do it twice — you’re good to go.',

	// OAuth
	[ErrorCode.OAUTH_FAILED]:
		'That sign-in attempt hit a snag. Happens sometimes with social logins.',
	[ErrorCode.GOOGLE_AUTH_FAILED]:
		'Google sign-in stumbled a bit — let’s try again.',
	[ErrorCode.FACEBOOK_AUTH_FAILED]:
		'Facebook sign-in had a hiccup. Happens even to seasoned travelers.',
	[ErrorCode.OAUTH_ACCOUNT_NOT_FOUND]:
		'Couldn’t find an account linked to that service. Let’s connect it first.',
	[ErrorCode.OAUTH_EMAIL_CONFLICT]:
		'That email’s already registered another way — let’s stick with your usual login.',

	// ============================================================================
	// DOMAIN-SPECIFIC (Packing Logic)
	// ============================================================================
	[ErrorCode.MAX_BAGS_REACHED]:
		'You’ve reached your current bag limit. Happens to all of us at check-in!',
	[ErrorCode.MAX_SUITCASES_REACHED]:
		'That’s the max for now. We’ll need to free up space before adding more.',
	[ErrorCode.BAG_ALREADY_FULL]:
		'That bag’s stuffed to the brim — even I wouldn’t try closing it!',
	[ErrorCode.SUITCASE_ALREADY_FULL]:
		'This suitcase is maxed out. Maybe it’s time for a new one?',
	[ErrorCode.CANNOT_DELETE_NON_EMPTY_BAG]:
		'We’ll need to unpack it first before deleting — think of it as clearing customs.',
	[ErrorCode.CANNOT_DELETE_NON_EMPTY_SUITCASE]:
		'Unpack everything before removing this suitcase — no item left behind!',

	// Item constraints
	[ErrorCode.ITEM_TOO_HEAVY]:
		'That item’s too heavy for the remaining capacity — your back will thank you later!',
	[ErrorCode.ITEM_TOO_LARGE]:
		'That item won’t quite fit — we might need a bigger bag for that one.',
	[ErrorCode.INVALID_ITEM_QUANTITY]:
		'That quantity doesn’t make sense. Let’s keep it realistic — no 0.5 jackets!',
	[ErrorCode.ITEM_NOT_IN_BAG]:
		'That item’s not in this bag — might’ve been moved elsewhere.',
	[ErrorCode.ITEM_NOT_IN_SUITCASE]:
		'That item isn’t in this suitcase. Let’s double-check your list.',

	// Packing logic
	[ErrorCode.INSUFFICIENT_SPACE]:
		'We’re out of room here! Time to rethink or redistribute.',
	[ErrorCode.INSUFFICIENT_WEIGHT_CAPACITY]:
		'That’ll tip the scales! Let’s shift some weight around.',
	[ErrorCode.PACKING_VALIDATION_ERROR]:
		'Something about this setup doesn’t align. Let’s fine-tune it together.',
	[ErrorCode.INVALID_PACKING_ORDER]:
		'From experience, heavier items work best at the bottom — try moving those shoes down a bit.',
};

/**
 * Beggy - Your Seasoned Travel Buddy
 *
 * ERROR SUGGESTIONS (Beggy-style)
 * Encouraging • Practical • Traveler-wise • Lightly playful
 */
export const ErrorSuggestions: Record<ErrorCode, string> = {
	// ============================================================================
	// CLIENT ERRORS (4xx)
	// ============================================================================

	// 400 Bad Request
	[ErrorCode.BAD_REQUEST]:
		'Give your info another glance — sometimes a small detail can make all the difference.',
	[ErrorCode.VALIDATION_ERROR]:
		'Take a moment to review the highlighted fields. Little tweaks can get us moving again.',
	[ErrorCode.INVALID_INPUT]:
		'Double-check your input format — I’ve seen typos sneak in before takeoff!',
	[ErrorCode.MISSING_REQUIRED_FIELDS]:
		'Let’s fill in those missing essentials before continuing.',
	[ErrorCode.INVALID_FORMAT]:
		'Try adjusting the format — something like traveler@example.com usually does the trick.',

	// 401 Unauthorized
	[ErrorCode.UNAUTHORIZED]:
		'Log in first, traveler — your bags are right where you left them.',
	[ErrorCode.INVALID_CREDENTIALS]:
		'Give your email and password another check, or reset your password if needed.',
	[ErrorCode.TOKEN_EXPIRED]:
		'Log back in and we’ll pick up exactly where we paused.',
	[ErrorCode.TOKEN_INVALID]:
		'Try signing in again for a fresh session — happens to everyone now and then.',
	[ErrorCode.TOKEN_MISSING]:
		'Make sure cookies are enabled so I can recognize you next time.',
	[ErrorCode.ACCOUNT_NOT_VERIFIED]:
		'Peek at your inbox for the verification email — it should arrive within a few minutes.',
	[ErrorCode.SESSION_EXPIRED]: 'Log back in — I’ve saved everything for you.',

	// 403 Forbidden
	[ErrorCode.FORBIDDEN]:
		'Check that you’re accessing your own lists — travelers’ privacy is sacred!',
	[ErrorCode.INSUFFICIENT_PERMISSIONS]:
		'If you believe you should have access, send support a quick note. We’ll sort it out.',
	[ErrorCode.ROLE_RESTRICTED]:
		'Upgrade your account or reach out to support if you’d like access to this feature.',
	[ErrorCode.ACCESS_DENIED]:
		'If you think this is an error, drop support a message and we’ll get it cleared up.',

	// 404 Not Found
	[ErrorCode.NOT_FOUND]:
		'Let’s double-check your details or refresh the page — it might just be hiding.',
	[ErrorCode.RESOURCE_NOT_FOUND]:
		'Make sure the info’s correct, then give it another try.',
	[ErrorCode.USER_NOT_FOUND]:
		'Try a different email — or if you’re new here, go ahead and sign up!',
	[ErrorCode.BAG_NOT_FOUND]:
		'Check if it was archived or create a fresh bag for your next adventure.',
	[ErrorCode.SUITCASE_NOT_FOUND]:
		'Make sure you’ve got the right suitcase selected. Happens after long trips!',
	[ErrorCode.ITEM_NOT_FOUND]:
		'Refresh your item list — sometimes things shift around mid-pack.',
	[ErrorCode.BAG_ITEM_NOT_FOUND]:
		'Refresh your bag — the item may have been moved or removed.',
	[ErrorCode.SUITCASE_ITEM_NOT_FOUND]:
		'Open your suitcase list again — the item might’ve changed spots.',

	[ErrorCode.PAGE_NOT_FOUND]:
		'Head back to the homepage — I’ll help you find your way again.',
	[ErrorCode.ROUTE_NOT_FOUND]:
		'Double-check the link or try refreshing. If it’s still missing, we’ll chart a new path together.',

	// 409 Conflict
	[ErrorCode.CONFLICT]:
		'Try using different details or update what’s already there — smooth packing is all about balance.',
	[ErrorCode.EMAIL_ALREADY_EXISTS]:
		'That email’s already on file — log in instead or try a different one.',
	[ErrorCode.BAG_NAME_CONFLICT]:
		'Give your bag a fresh name, like ‘Beach Trip Carry-On.’',
	[ErrorCode.SUITCASE_NAME_CONFLICT]:
		'Try a new suitcase name — maybe something that matches your destination.',
	[ErrorCode.DUPLICATE_ITEM]:
		'Update the quantity instead of adding a duplicate — less clutter, more clarity!',
	[ErrorCode.ITEM_ALREADY_PACKED]:
		'No worries — it’s already in your bag. You’re ahead of the game.',

	// 422 Unprocessable Entity
	[ErrorCode.UNPROCESSABLE_ENTITY]:
		'Let’s review the data and make a few quick adjustments.',
	[ErrorCode.BAG_OVERWEIGHT]:
		'Lighten the load — maybe wear your heaviest shoes or shift items around.',
	[ErrorCode.BAG_OVER_CAPACITY]:
		'Try rolling clothes or skipping what you can buy when you arrive.',
	[ErrorCode.SUITCASE_OVERWEIGHT]:
		'Move a few things to another bag — your shoulders will thank you later.',
	[ErrorCode.SUITCASE_OVER_CAPACITY]:
		'Time to edit down or swap for a bigger suitcase.',
	[ErrorCode.INVALID_BAG_CONFIGURATION]:
		'Double-check your bag’s dimensions and weight limits.',
	[ErrorCode.INVALID_SUITCASE_CONFIGURATION]:
		'Review your suitcase settings and make sure they’re within travel norms.',
	[ErrorCode.INVALID_BAG_DIMENSIONS]:
		'Most carry-ons are around 22x14x9 inches — measure and compare.',
	[ErrorCode.INVALID_SUITCASE_DIMENSIONS]:
		'Recheck those suitcase measurements — we want smooth check-ins!',
	[ErrorCode.INVALID_WEIGHT_VALUE]:
		'Use a positive number — I’d suggest sticking to pounds or kilograms.',
	[ErrorCode.INVALID_CAPACITY_VALUE]:
		'Enter a realistic capacity value — think liters or cubic inches.',
	[ErrorCode.CANNOT_PACK_ITEM]:
		'Adjust your item’s size or free up space — we’ll make it fit like Tetris.',

	// 429 Rate Limiting
	[ErrorCode.RATE_LIMITED]:
		'Take a quick breather — packing’s smoother when you go at a steady pace.',
	[ErrorCode.TOO_MANY_REQUESTS]:
		'Slow it down a touch. Even the best travelers pause for coffee.',

	// ============================================================================
	// SERVER ERRORS (5xx)
	// ============================================================================

	[ErrorCode.INTERNAL_ERROR]:
		'Try again in a bit — these things happen, even on the smoothest journeys.',
	[ErrorCode.DATABASE_ERROR]:
		'Give it a moment — your packing data’s safe and sound.',
	[ErrorCode.UNKNOWN_ERROR]:
		'Refresh and try again. If it keeps happening, I’ll help you report it.',
	[ErrorCode.OPERATION_FAILED]:
		'Try again — and if it still won’t budge, I’ll help troubleshoot.',
	[ErrorCode.SERVICE_UNAVAILABLE]:
		'Looks like my tools are stretching their legs. Try again shortly.',
	[ErrorCode.EXTERNAL_API_ERROR]:
		'One of my travel helpers is snoozing — give it a few minutes and we’ll retry.',

	// ============================================================================
	// AUTHENTICATION SPECIFIC
	// ============================================================================
	[ErrorCode.INVALID_EMAIL]:
		'Use a valid email format — something like globe.trotter@example.com.',
	[ErrorCode.INVALID_PASSWORD]:
		'Check your password format and try again — security first!',
	[ErrorCode.PASSWORD_TOO_WEAK]:
		'Add some strength: a mix of letters, numbers, and symbols does wonders.',
	[ErrorCode.PASSWORDS_DO_NOT_MATCH]:
		'Make sure both password fields match perfectly — like matching luggage.',
	[ErrorCode.CURRENT_PASSWORD_INCORRECT]:
		'Give your current password another try, or reset it if unsure.',
	[ErrorCode.SAME_AS_OLD_PASSWORD]:
		'Choose a new password — fresh starts are good for security and travel!',

	[ErrorCode.EMAIL_SEND_FAILED]:
		'Double-check your email and try again — sometimes signals get crossed.',
	[ErrorCode.VERIFICATION_TOKEN_INVALID]:
		'Request a new verification email from your settings — quick and easy.',
	[ErrorCode.VERIFICATION_TOKEN_EXPIRED]:
		'Request a new link — they only last 24 hours, kind of like flight check-ins.',
	[ErrorCode.RESET_TOKEN_INVALID]:
		'Request a new reset link — I’ll send a fresh one right away.',
	[ErrorCode.RESET_TOKEN_EXPIRED]:
		'Reset links expire after an hour — let’s get you a new one.',
	[ErrorCode.ALREADY_VERIFIED]:
		'You’re already set — no need to verify again!',

	[ErrorCode.OAUTH_FAILED]:
		'Try again or use email login instead — both roads lead to smooth packing.',
	[ErrorCode.GOOGLE_AUTH_FAILED]:
		'Try Google sign-in again or reach out if the hiccup continues.',
	[ErrorCode.FACEBOOK_AUTH_FAILED]:
		'Try again or switch to another login method — options are good!',
	[ErrorCode.OAUTH_ACCOUNT_NOT_FOUND]:
		'Sign up first, then link your social account — easy setup.',
	[ErrorCode.OAUTH_EMAIL_CONFLICT]:
		'Log in with your usual method or use a different email.',

	// ============================================================================
	// DOMAIN-SPECIFIC
	// ============================================================================
	[ErrorCode.MAX_BAGS_REACHED]:
		'Archive a few old bags or upgrade for more space — happens to us all.',
	[ErrorCode.MAX_SUITCASES_REACHED]:
		'Free up some space by archiving unused suitcases — or upgrade your account.',
	[ErrorCode.BAG_ALREADY_FULL]:
		'Start a new bag for overflow — I call it the ‘just in case’ bag.',
	[ErrorCode.SUITCASE_ALREADY_FULL]:
		'Shift a few items to another suitcase — a classic traveler’s move.',
	[ErrorCode.CANNOT_DELETE_NON_EMPTY_BAG]:
		'Unpack your items first, then delete — tidy traveler habits!',
	[ErrorCode.CANNOT_DELETE_NON_EMPTY_SUITCASE]:
		'Empty the suitcase before deleting — one step at a time.',

	[ErrorCode.ITEM_TOO_HEAVY]:
		'Split that load between bags or reduce the quantity — your back will thank you.',
	[ErrorCode.ITEM_TOO_LARGE]:
		'Try a larger bag or fold the item differently — creative packing saves the day.',
	[ErrorCode.INVALID_ITEM_QUANTITY]:
		'Enter a whole number — I’d recommend 1 or more, depending on your needs.',
	[ErrorCode.ITEM_NOT_IN_BAG]: 'Check which bag it’s in — easy mix-up.',
	[ErrorCode.ITEM_NOT_IN_SUITCASE]:
		'Open your suitcase list to see where that item might’ve gone.',

	[ErrorCode.INSUFFICIENT_SPACE]:
		'Remove an item or two, or use a bigger bag — space management 101!',
	[ErrorCode.INSUFFICIENT_WEIGHT_CAPACITY]:
		'Redistribute some weight or use a sturdier suitcase — balance is key.',
	[ErrorCode.PACKING_VALIDATION_ERROR]:
		'Review your setup — a quick tweak can make everything fit beautifully.',
	[ErrorCode.INVALID_PACKING_ORDER]:
		'From experience, heavier items work best at the bottom — let’s repack smart.',
};
