
export type Value = number | string | boolean
	| ((...args: Value[]) => Value)
	| ValueFunction
	| Value[]
	| { [propertyName: string]: Value };

export type ValueFunction = ((...args: unknown[]) => Value);

