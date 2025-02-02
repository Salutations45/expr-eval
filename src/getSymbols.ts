import { I, Instr } from './Instruction';
import contains from './contains';

interface getSymbolsOption {
	withMembers?: boolean
}

export default function getSymbols(tokens: Instr[], symbols: string[], options: getSymbolsOption = {}) {
	const withMembers = !!options.withMembers;
	let prevVar: string | null = null;

	for (const item of tokens) {
		if (item.type === I.IVAR || item.type === I.IVARNAME) {
			if (!withMembers && !contains(symbols, item.value)) {
				symbols.push(item.value);
			} else if (prevVar !== null) {
				if (!contains(symbols, prevVar)) {
					symbols.push(prevVar);
				}
				prevVar = item.value;
			} else {
				prevVar = item.value;
			}
		} else if (item.type === I.IMEMBER && withMembers && prevVar !== null) {
			prevVar += '.' + item.value;
		} else if (item.type === I.IEXPR) {
			getSymbols(item.value, symbols, options);
		} else if (prevVar !== null) {
			if (!contains(symbols, prevVar)) {
				symbols.push(prevVar);
			}
			prevVar = null;
		}
	}

	if (prevVar !== null && !contains(symbols, prevVar)) {
		symbols.push(prevVar);
	}
}
