/*jslint nomen: true, vars: true */
/*global red,esprima,able,uid,console */

(function (red) {
	"use strict";
	var cjs = red.cjs,
		_ = red._;

	red.find_stateful_obj_and_context = function (context) {
		var popped_item, last;
		while (!context.is_empty()) {
			last = context.points_at();
			if (last instanceof red.StatefulObj) {
				return {
					stateful_obj: last,
					context: context
				};
			}
			popped_item = last;
			context = context.pop();
		}
		return undefined;
	};

	red.Pointer = function (options) {
		this._stack = (options && options.stack) || [];
		this._special_contexts = (options && options.special_contexts) || new Array(this._stack.length);

		if (this._stack.length !== this._special_contexts.length) {
			throw new Error("Different lengths for stack and special contexts");
		}
	};
	(function (my) {
		var proto = my.prototype;
		proto.points_at = function (index) {
			if (!_.isNumber(index)) {
				index = this._stack.length - 1;
			} else if (index < 0) {
				index += this._stack.length;
			}
			return this._stack[index];
		};
		proto.length = function () { return this._stack.length; };
		proto.special_contexts = function (index) {
			if (!_.isNumber(index)) {
				index = this._special_contexts.length - 1;
			} else if (index < 0) {
				index += this._special_contexts.length;
			}
			return this._special_contexts[index] || [];
		};
		proto.slice = function () {
			return new red.Pointer({
				stack: this._stack.slice.apply(this._stack, arguments),
				special_contexts: this._special_contexts.slice.apply(this._special_contexts, arguments)
			});
		};
		proto.splice = function () {
			var stack_copy = _.clone(this._stack);
			var special_contexts_copy = _.clone(this._special_contexts);
			stack_copy.splice.apply(stack_copy, arguments);
			special_contexts_copy.splice.apply(special_contexts_copy, arguments);
			return new red.Pointer({ stack: stack_copy, special_contexts: special_contexts_copy });
		};
		proto.push = function (onto_stack, onto_special_contexts) {
			var new_special_contexts;
			if (onto_special_contexts) {
				new_special_contexts = this._special_contexts.concat([[onto_special_contexts]]);
			} else {
				new_special_contexts = this._special_contexts.concat(undefined);
			}
			return new red.Pointer({
				stack: this._stack.concat(onto_stack),
				special_contexts: new_special_contexts
			});
		};
		proto.push_special_context = function (special_context) {
			var new_special_contexts_obj = _.clone(this._special_contexts);
			var len_m_1 = new_special_contexts_obj.length - 1;
			var nscolm1 = new_special_contexts_obj[len_m_1];
			if (nscolm1) {
				new_special_contexts_obj[len_m_1] = nscolm1.concat(special_context);
			} else {
				new_special_contexts_obj[len_m_1] = [special_context];
			}
			return new red.Pointer({
				stack: this._stack,
				special_contexts: new_special_contexts_obj
			});
		};
		proto.pop = function () {
			return new red.Pointer({
				stack: this._stack.slice(0, this._stack.length - 1),
				special_contexts: this._special_contexts.slice(0, this._stack.length - 1)
			});
		};
		proto.has = function (item) {
			return this.indexOf(item) >= 0;
		};
		proto.indexOf = function (item) {
			return this._stack.indexOf(item);
		};
		proto.lastIndexOf = function (item) {
			return this._stack.lastIndexOf(item);
		};
		proto.root = function () {
			return this._stack[0];
		};

		proto.is_empty = function () {
			return this._stack.length === 0;
		};

		proto.eq = function (other) {
			var my_stack = this._stack;
			var other_stack = other._stack;

			if (my_stack.length !== other_stack.length) {
				return false;
			}
			var i, j;
			for (i = my_stack.length - 1; i >= 0; i -= 1) {
				if (my_stack[i] !== other_stack[i]) {
					return false;
				}
				var my_special_contexts = this._special_contexts[i],
					other_special_contexts = other._special_contexts[i];
				if (my_special_contexts && other_special_contexts) {
					var my_len = my_special_contexts.length;
					if (my_len !== other_special_contexts.length) {
						return false;
					}
					for (j = 0; j < my_len; j += 1) {
						if (!my_special_contexts[j].eq(other_special_contexts[j])) {
							return false;
						}
					}
				} else if (my_special_contexts || other_special_contexts) { // One is an array and the other is not, assumes the previous IF FAILED
					return false;
				}
			}
			return true;
		};

		var num_to_hash = 3;
		proto.hash = function () {
			var hash = 0;

			var len = this._stack.length - 1;
			var mini = Math.max(0, len - num_to_hash);
			var sc;
			var i, j, lenj;

			for (i = len; i >= mini; i -= 1) {
				if (this._stack[i].hash) {
					hash += this._stack[i].hash();
				}
				sc = this._special_contexts[i];
				if (sc) {
					for (j = 0; j < lenj && j < num_to_hash; j += 1) {
						hash += sc[j].hash();
					}
				}
			}

			return hash;
		};

		proto.toString = function () {
			return "pointer (" + _.map(this._stack, function (x) { return x.id ? uid.strip_prefix(x.id()) : x.toString(); }).join(", ") + ")";
		};

		proto.summarize = function () {
			var stack_ids = _.map(this._stack, function (x) {
				return x.id();
			});
			var special_context_infos = _.map(this._special_contexts, function (sc) {
				if (_.isArray(sc)) {
					return _.map(sc, function (c) {
						if (c instanceof red.ManifestationContext) {
							return {
								type: "manifestation_context",
								index: c.get_basis_index()
							};
						} else if (c instanceof red.EventContext) {
							return {
								type: "event_context"
							};
						} else {
							console.error("Unknown special context type");
						}
					});
				} else {
					return undefined;
				}
			});
			return {
				stack_ids: stack_ids,
				special_context_info: special_context_infos
			};
		};

		my.desummarize = function (obj) {
			var stack = _.map(obj.stack_ids, function (stack_id) {
				return red.find_uid(stack_id);
			});
			var i;
			var special_contexts = [];
			var special_context_info = obj.special_context_info;
			var each_special_context_info_item = function (info) {
				if (info.type === "manifestation_context") {
					var pointer = red.create("pointer", {stack: stack.slice(0, i)});
					var dict = stack[i];
					var manifestations = dict.get_manifestations(pointer);
				} else {
					console.error("Unhandled special context type");
				}
			};
			
			for (i = 0; i < special_context_info.length; i += 1) {
				if (_.isArray(special_context_info[i])) {
					special_contexts[i] = _.map(special_context_info[i], each_special_context_info_item);
				} else {
					special_contexts[i] = undefined;
				}
			}
			var rv = red.create("pointer", {stack: stack, special_contexts: special_contexts});
			return rv;
		};
	}(red.Pointer));

	red.define("pointer", function (options) {
		var context = new red.Pointer(options);
		return context;
	});

	red.is_pointer = function (obj) {
		return obj instanceof red.Cell || obj instanceof red.StatefulProp;
	};


	red.check_pointer_equality =  red.check_pointer_equality_eqeqeq = function (itema, itemb) {
		if (itema instanceof red.Pointer && itemb instanceof red.Pointer) {
			return itema.eq(itemb);
		} else {
			return itema === itemb;
		}
	};
	/*
	red.check_pointer_equality_eqeq = function (itema, itemb) {
		if (itema instanceof red.Pointer && itemb instanceof red.Pointer) {
			return itema.eq(itemb);
		} else {
			return itema == itemb;
		}
	};
	*/
	red.pointer_hash = function(item) {
		if(item && item.hash) {
			return item.hash();
		} else {
			return item.toString();
		}
	};
	red.check_special_context_equality = function (sc1, sc2) {
		var sc1_len = sc1.length,
			sc2_len = sc2.length;
		var i;
		if (sc1_len === sc2_len) {
			for (i = sc1_len - 1; i >= 0; i -= 1) {
				if (!sc1[i].eq(sc2[i])) {
					return false;
				}
			}
			return true;
		} else {
			return false;
		}
	};
}(red));