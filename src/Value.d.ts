
export type Value = number | string | boolean
	| ((...args: Value[]) => Value)
	| Value[]
	| { [propertyName: string]: Value };


