export type NameFieldType = 'person' | 'product' | 'brand' | 'place';

export type NameFieldMessages = {
	minLength: (firstName: string) => string;
	maxLength: (firstName: string) => string;
	regex: (firstName: string) => string;
};

export type NameFieldConfig = {
	regex: RegExp;
	defaultMaxLength: number;
	defaultMinLength: number;
	messages: NameFieldMessages;
};

type NumericDomains = {
	bag: 'weight' | 'capacity';
	suitcase: 'weight' | 'capacity';
	item: 'weight' | 'volume' | 'quantity';
};

export type NumericEntity = keyof NumericDomains;

export type NumericMetric<E extends keyof NumericDomains> = NumericDomains[E];

export type NumberFieldConfig = {
	gte: number; // alias for z.min()
	lte: number; // alias for z.max()
	decimals: number;
	messages: {
		gte: string; // alias for z.min()
		lte: string; // alias for z.max()
		positive: string;
	};
};

export type NumberConfigMap = {
	[E in NumericEntity]: {
		[M in NumericMetric<E>]: NumberFieldConfig;
	};
};
