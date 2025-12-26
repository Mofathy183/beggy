// ============================================================================
// MATERIAL ENUM
// ============================================================================
export enum Material {
	LEATHER = 'LEATHER',
	SYNTHETIC = 'SYNTHETIC',
	FABRIC = 'FABRIC',
	POLYESTER = 'POLYESTER',
	NYLON = 'NYLON',
	CANVAS = 'CANVAS',
	HARD_SHELL = 'HARD_SHELL',
	METAL = 'METAL',
}

// ============================================================================
// ITEM CATEGORY
// ============================================================================
export enum ItemCategory {
	ELECTRONICS = 'ELECTRONICS',
	ACCESSORIES = 'ACCESSORIES',
	FURNITURE = 'FURNITURE',
	MEDICINE = 'MEDICINE',
	CLOTHING = 'CLOTHING',
	BOOKS = 'BOOKS',
	FOOD = 'FOOD',
	TOILETRIES = 'TOILETRIES',
	DOCUMENTS = 'DOCUMENTS',
	SPORTS = 'SPORTS',
}

// ============================================================================
// BAG TYPE
// ============================================================================
export enum BagType {
	BACKPACK = 'BACKPACK',
	DUFFEL = 'DUFFEL',
	TOTE = 'TOTE',
	MESSENGER = 'MESSENGER',
	LAPTOP_BAG = 'LAPTOP_BAG',
	TRAVEL_BAG = 'TRAVEL_BAG',
	HANDBAG = 'HANDBAG',
	CROSSBODY = 'CROSSBODY',
	SHOULDER_BAG = 'SHOULDER_BAG',
}

// ============================================================================
// SUITCASE TYPE
// ============================================================================
export enum SuitcaseType {
	CARRY_ON = 'CARRY_ON',
	CHECKED_LUGGAGE = 'CHECKED_LUGGAGE',
	HARD_SHELL = 'HARD_SHELL',
	SOFT_SHELL = 'SOFT_SHELL',
	BUSINESS = 'BUSINESS',
	KIDS = 'KIDS',
	EXPANDABLE = 'EXPANDABLE',
}

// ============================================================================
// SUITCASE FEATURES
// ============================================================================
export enum SuitcaseFeature {
	TSA_LOCK = 'TSA_LOCK',
	WATERPROOF = 'WATERPROOF',
	EXPANDABLE = 'EXPANDABLE',
	USB_PORT = 'USB_PORT',
	LIGHTWEIGHT = 'LIGHTWEIGHT',
	ANTI_THEFT = 'ANTI_THEFT',
	SCRATCH_RESISTANT = 'SCRATCH_RESISTANT',
	COMPRESSION_STRAPS = 'COMPRESSION_STRAPS',
	TELESCOPIC_HANDLE = 'TELESCOPIC_HANDLE',
	SPINNER_WHEELS = 'SPINNER_WHEELS',
}

// ============================================================================
// BAG FEATURES
// ============================================================================
export enum BagFeature {
	WATERPROOF = 'WATERPROOF',
	PADDED_LAPTOP_COMPARTMENT = 'PADDED_LAPTOP_COMPARTMENT',
	USB_PORT = 'USB_PORT',
	ANTI_THEFT = 'ANTI_THEFT',
	MULTIPLE_POCKETS = 'MULTIPLE_POCKETS',
	LIGHTWEIGHT = 'LIGHTWEIGHT',
	EXPANDABLE = 'EXPANDABLE',
	REINFORCED_STRAPS = 'REINFORCED_STRAPS',
	TROLLEY_SLEEVE = 'TROLLEY_SLEEVE',
	HIDDEN_POCKET = 'HIDDEN_POCKET',
	RFID_BLOCKING = 'RFID_BLOCKING',
}

// ============================================================================
// SIZE
// ============================================================================
export enum Size {
	SMALL = 'SMALL',
	MEDIUM = 'MEDIUM',
	LARGE = 'LARGE',
	EXTRA_LARGE = 'EXTRA_LARGE',
}

// ============================================================================
// WHEEL TYPE
// ============================================================================
export enum WheelType {
	NONE = 'NONE',
	TWO_WHEEL = 'TWO_WHEEL',
	FOUR_WHEEL = 'FOUR_WHEEL',
	SPINNER = 'SPINNER',
}

// ============================================================================
// GENDER
// ============================================================================
export enum Gender {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
	OTHER = 'OTHER',
}

//   // ============================================================================
//   // AUTH PROVIDER
//   // ============================================================================
//   export enum AuthProvider {
//     GOOGLE = "GOOGLE",
//     FACEBOOK = "FACEBOOK",
//   }

// ============================================================================
// RBAC: ACTION
// ============================================================================
export enum Action {
	CREATE = 'CREATE',
	READ = 'READ',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	MANAGE = 'MANAGE',
}

// ============================================================================
// RBAC: SCOPE
// ============================================================================
export enum Scope {
	OWN = 'OWN',
	ANY = 'ANY',
}

// ============================================================================
// RBAC: SUBJECT
// ============================================================================
export enum Subject {
	BAG = 'BAG',
	ITEM = 'ITEM',
	SUITCASE = 'SUITCASE',
	USER = 'USER',
	ROLE = 'ROLE',
	PERMISSION = 'PERMISSION',
}

// ============================================================================
// RBAC: ROLE
// ============================================================================
export enum Role {
	ADMIN = 'ADMIN',
	MODERATOR = 'MODERATOR',
	MEMBER = 'MEMBER',
	USER = 'USER',
}

//   // ============================================================================
//   // TOKEN TYPE
//   // ============================================================================
//   export enum TokenType {
//     EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
//     PASSWORD_RESET = "PASSWORD_RESET",
//     CHANGE_EMAIL = "CHANGE_EMAIL",
//     // TWO_FACTOR = "TWO_FACTOR",
//   }
