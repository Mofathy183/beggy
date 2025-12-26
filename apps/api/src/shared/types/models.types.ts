import {
	UserModel,
	AccountModel,
	UserTokenModel,
	SuitcasesModel,
	SuitcaseItemsModel,
	BagsModel,
	BagItemsModel,
	ItemsModel,
	PermissionModel,
	RoleOnPermissionModel,
} from '@prisma-generated/models';

export interface IItem extends ItemsModel {
	bagItems: IBagItem[];
	suitcaseItems: ISuitcaseItem[];
}

export interface IBagItem extends BagItemsModel {
	bag: BagsModel;
	item: IItem;
}

export interface ISuitcaseItem extends SuitcaseItemsModel {
	suitcase: SuitcasesModel;
	item: IItem;
}

export interface IBag extends BagsModel {
	bagItems?: IBagItem[];
}

export interface ISuitcase extends SuitcasesModel {
	suitcaseItems?: ISuitcaseItem[];
}

export interface IUser extends UserModel {
	userToken?: UserTokenModel[];
	account?: AccountModel;

	bags?: IBag[];
	suitcases?: ISuitcase[];
	items?: IItem[];
}

export interface IPermissions extends PermissionModel {
	rolePermissions: RoleOnPermissionModel[];
}