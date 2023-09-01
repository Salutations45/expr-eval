
export type Value = number
    | string
    | ((...args: Value[]) => Value)
    | boolean
    | ValueFunction
    | Value[]
    | { [propertyName: string]: Value };

export type ValueFunction = ((...args: any[]) => Value);

