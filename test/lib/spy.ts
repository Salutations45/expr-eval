'use strict';

export default function (fn: (args: unknown[])=>unknown) {
	function spy(...a: unknown[]) {
		spy.called = true;
		return fn.apply(this, ...a);
	}
	spy.called = false;
	return spy;
}
