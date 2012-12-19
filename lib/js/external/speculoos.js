/**
 * The author of this library is Philippe CHARRIERE. See details on https://github.com/k33g
 * Modifications were added by DeadbraiN
 */
var root = this;

if (typeof exports === 'undefined') {
    window.speculoos = root.speculoos = root.speculoos || {};
}

(function (speculoos) {

	var Class = (function () {
		function Class(definition) {
			/* from CoffeeScript */
			var __hasProp  = Object.prototype.hasOwnProperty;
            var __toString = Object.prototype.toString;
			var m;
            var F;

            /**
             * DeadbraiN
             * This function prepares prototype of child class. It adds names of the methods to it's
             * functions as name property.
             * @param {Object} proto Reference to the prototype we should to prepare
             * @param {Function} cl Current class reference
             * @return {Object} New object
             */
            function preparePrototype(proto, cl) {
                var p;
                var prop;

                for (p in proto) {
                    if (proto.hasOwnProperty(p)) {
                        prop = proto[p];
                        if (__toString.call(proto[p]) === '[object Function]') {
                            prop.fnName = p;
                            prop.cl     = cl;
                        }
                    }
                }

                return proto;
            }

            //
            // DeadbraiN:
            // extends updated to extend (without 's' at the end)
            //
			this["extend"] = function (child, parent) {
				for (m in parent) {
					if (__hasProp.call(parent, m)) {
                        child[m] = parent[m];
                    }
				}
				function Ctor() {
                    this.constructor = child;
                    this.constructor.fnName = 'constructor';
                }
				Ctor.prototype = parent.prototype;
                child.prototype = new Ctor();
                //
                // DeadbraiN:
                // super is a reserved word in JS and validators doesn't pass it. Original string was:
                // child.__super__ = child["super"] = parent.prototype;
                //
                child.__base__ = child["base"] = parent.prototype;
				return child;
			};

            if (definition.constructor.name === "Object") {
                F = function () {};
            } else {
                F = definition.constructor;
            }


			/* inheritance */
            //
            // DeadbraiN:
            // extends updated to extend (without 's' at the end)
            //
			if (definition["extend"]) {
                //
                // DeadbraiN:
                // extends updated to extend (without 's' at the end)
                //
				this["extend"](F, definition["extend"]);
			}

            definition = preparePrototype(definition, F);
			for (m in definition) {
                //
                // DeadbraiN:
                // extends updated to extend (without 's' at the end)
                //
				if (m !== 'constructor' && m !== 'extend') {
					if (m[0] !== '$') {
						F.prototype[m] = definition[m];
					} else { /* static members */
						F[m.split('$')[1]] = definition[m];
					}
				}
			}

			return F;
		}

		return Class;
	}());

    speculoos.Class = Class;

})(root.speculoos || exports);