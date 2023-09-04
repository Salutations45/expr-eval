export default function contains(array: unknown, obj: unknown) {
	if(!Array.isArray(array)) return false;
	for (let i = 0; i < array.length; i++) {
		if (array[i] === obj) {
			return true;
		}
	}
	return false;
}
