/**
 * The author of this library is Philippe CHARRIERE. See details on https://github.com/k33g
 * Modifications were added by DeadbraiN
 */
var root = this;

if (typeof exports === 'undefined') {
    root.speculoos = root.speculoos || {};
}

(function(speculoos) {

	var Class = (function() {
		function Class(definition) {
			/* from CoffeeScript */
			var __hasProp = Object.prototype.hasOwnProperty
			, m, F;

            //
            // DeadbraiN:
            // extends updated to extend (without 's' at the end)
            //
			this["extend"] = function(child, parent) {
				for (m in parent) {
					if (__hasProp.call(parent, m)) child[m] = parent[m];
				}
				function ctor() { this.constructor = child; }
				ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                //
                // DeadbraiN:
                // super is a reserved word in JS and validators doesn't pass it. Original string was:
                // child.__super__ = child["super"] = parent.prototype;
                //
                child.__base__ = child["base"] = parent.prototype;
				return child;
			};

            if(definition.constructor.name === "Object") {
                F = function(){};
            } else {
                F = definition.constructor;
            }


			/* inheritance */
            //
            // DeadbraiN:
            // extends updated to extend (without 's' at the end)
            //
			if(definition["extend"]) {
                //
                // DeadbraiN:
                // extends updated to extend (without 's' at the end)
                //
				this["extend"](F, definition["extend"])
			}
			for(m in definition) {
                //
                // DeadbraiN:
                // extends updated to extend (without 's' at the end)
                //
				if(m != 'constructor' && m != 'extend') {
					if(m[0] != '$') {
						F.prototype[m] = definition[m];
					} else { /* static members */
						F[m.split('$')[1]] = definition[m];
					}
				}
			}

			return F;
		}
		return Class;
	})();

    speculoos.Class = Class;

})(root.speculoos || exports);