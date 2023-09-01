'use strict';

export default function (fn: (args: any)=>any) {
  function spy() {
    spy.called = true;
    return fn.apply(this, arguments);
  }
  spy.called = false;
  return spy;
}
