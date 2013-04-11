/*jslint nomen: true, vars: true */
/*global red,esprima,able,uid,console */

(function (red) {
	"use strict";
	var cjs = red.cjs,
		_ = red._,
		PROP_NAME_WIDTH = 30,
		PROP_ID_WIDTH = 5,
		PROP_VALUE_WIDTH = 40,
		STATE_NAME_WIDTH = 40,
		STATE_ID_WIDTH = 8,
		TRANSITION_NAME_WIDTH = 60,
		TRANSITION_VALUE_WIDTH = 40,
		STATE_VALUE_WIDTH = 100;

	function pad(str, len) {
		if (str.length > len) {
			return str.substring(0, len - 3) + "...";
		} else if (str.length < len) {
			var rv = str;
			while (rv.length < len) {
				rv += " ";
			}
			return rv;
		} else {
			return str;
		}
	}
	function print_statechart() {
		var last_arg = _.last(arguments),
			statecharts,
			logging_mechanism = console,
			stringified_statecharts,
			include_start;

		
		if (last_arg && !(last_arg instanceof red.Statechart)) {
			include_start = last_arg;
			statecharts = _.first(arguments, arguments.length - 1);
		} else {
			include_start = false;
			statecharts = _.toArray(arguments);
		}
		stringified_statecharts = _.map(statecharts, function (sc) {
			var id_printed = uid.strip_prefix(sc.id());
			var basis = sc.basis();
			if (basis) {
				id_printed +=  ":" + uid.strip_prefix(sc.basis().id());
			}
			return id_printed;
		}).join(" ");
		logging_mechanism.group("  Statechart " + stringified_statecharts);
		_.each(statecharts, function (statechart) {
			var flattened_statechart = _.without(statechart.flatten_substates(include_start), statechart);

			var flattened_state_and_transitions = _.flatten(_.map(flattened_statechart, function (statechart) {
				return ([statechart]).concat(statechart.get_outgoing_transitions());
			}), true);

			_.each(flattened_state_and_transitions, function (state) {
				var state_name;

				if (state instanceof red.State) {
					state_name = pad(state.get_name(), STATE_NAME_WIDTH - 2);
				} else if (state instanceof red.StatechartTransition) { //transition
					var from = state.from(),
						to = state.to();
					state_name = pad(from.get_name() + "->" + to.get_name(), TRANSITION_NAME_WIDTH - 2);
					state_name = state_name + pad(state.stringify(), TRANSITION_VALUE_WIDTH);
				}

				if (state.is_active()) {
					state_name = "* " + state_name;
				} else {
					state_name = "  " + state_name;
				}

				state_name = pad(uid.strip_prefix(state.id()) + (state.basis() ? ":" + uid.strip_prefix(state.basis().id()) : ""), STATE_ID_WIDTH) + state_name;
				logging_mechanism.log(state_name);
			});
		});
		logging_mechanism.groupEnd();
	}

	function print(current_pointer, logging_mechanism) {
		logging_mechanism = logging_mechanism || console;
		var value_to_value_str = function (val) {
			var points_at, special_contexts, str, special_contexts_str;
			if (_.isUndefined(val)) {
				return "(undefined)";
			} else if (_.isNull(val)) {
				return "(null)";
			} else if (_.isNumber(val) || _.isBoolean(val)) {
				return val.toString();
			} else if (_.isString(val)) {
				return '"' + val + '"';
			} else if (_.isFunction(val)) {
				return '(func)';
			} else if (_.isElement(val)) {
				return "(dom)";
			} else if (val instanceof red.StatefulObj) {
				return "(stateful:" + uid.strip_prefix(val.id()) + ")";
			} else if (val instanceof red.Dict) {
				return "(dict:" + uid.strip_prefix(val.id()) + ")";
			} else if (val instanceof red.Cell) {
				return "(cell:" + uid.strip_prefix(val.id()) + ")";
			} else if (val instanceof red.StatefulProp) {
				return "(prop:" + uid.strip_prefix(val.id()) + ")";
			} else if (val instanceof red.ParsedFunction) {
				return "(parsed fn)";
			} else if (val instanceof red.WrapperClient) {
				return "(" + val.type() + " client wrapper " + val.cobj_id + ")";
			} else if (val instanceof red.Query) {
				return value_to_value_str(val.value());
			} else if (val instanceof red.Pointer) {
				points_at = val.points_at();
				special_contexts = val.special_contexts();
				str = value_to_value_str(points_at);
				special_contexts_str = _.map(special_contexts, function (sc) { return sc.id().toString(); }).join(",");

				if (special_contexts.length > 0) {
					str = str + " " + special_contexts_str;
				}

				return str;
			} else if (val instanceof red.ContextualObject) {
				var ptr = val.get_pointer();
				points_at = ptr.points_at();
				special_contexts = ptr.special_contexts();
				str = value_to_value_str(points_at);
				special_contexts_str = _.map(special_contexts, function (sc) { return sc.id().toString(); }).join(",");

				if (special_contexts.length > 0) {
					str = str + " " + special_contexts_str;
				}

				return str;
			} else if (val instanceof red.CopyContext) {
				return val.id();
			} else if (_.isArray(val)) {
				return ("[" + _.map(val, function (v) { return value_to_value_str(v); }).join(", ") + "]");
			} else if (val instanceof cjs.ArrayConstraint) {
				var array_got = val.toArray();
				return "$" + value_to_value_str(array_got);
			} else {
				return ("{ " + _.map(val, function (v, k) {
					return k + ": " + v;
				}).join(", ") + " }");
			}
		};

		var value_to_source_str = function (val) {
			if (_.isUndefined(val)) {
				return "(undefined)";
			} else if (_.isNull(val)) {
				return "(null)";
			} else if (_.isString(val)) {
				return '"' + val + '"';
			} else if (_.isNumber(val) || _.isBoolean(val)) {
				return val.toString();
			} else if (_.isFunction(val)) {
				return 'function () {...}';
			} else if (val instanceof red.Dict) {
				return "";
			} else if (val instanceof red.Cell) {
				return "=(" + uid.strip_prefix(val.id()) + ")= " + val.get_str();
			} else {
				return val.toString();
			}
		};


		var tablify = function (contextual_object) {
			if (contextual_object instanceof red.ContextualDict) {
				if (contextual_object instanceof red.ContextualStatefulObj) {
					var statecharts = contextual_object.get_statecharts();
					print_statechart.apply(this, (statecharts).concat(logging_mechanism));
				}
				var children = contextual_object.children();
				_.each(children, function (child_info) {
					var c_arr;
					var value = child_info.value;

					var is_manifestations;
					if (value instanceof red.ContextualDict) {
						is_manifestations = value.is_template();
					} else {
						is_manifestations = false;
					}

					if (is_manifestations) {
						c_arr = value.instances();
						console.group("(" + c_arr.length + " manifestations)");
					} else {
						c_arr = [value];
					}

					var prop_name = child_info.name;
					var is_inherited = child_info.inherited;
					_.each(c_arr, function (child) {
						var prop_pointer = child instanceof red.ContextualObject ? child.get_pointer() : false;
						var prop_points_at = prop_pointer ? prop_pointer.points_at() : child;
						var is_expanded = prop_points_at && current_pointer.has(prop_points_at);
						var is_pointed_at = prop_pointer && current_pointer.eq(prop_pointer);
						var prop_text = prop_name;

						if (is_inherited) {
							prop_text = prop_text + " (i)";
						}

						if (is_pointed_at) {
							prop_text = "> " + prop_text;
						} else {
							prop_text = "  " + prop_text;
						}

						if (prop_points_at instanceof red.StatefulProp) {
							prop_text = pad(prop_text, PROP_NAME_WIDTH);
							prop_text = prop_text + pad("(" + uid.strip_prefix(prop_points_at.id()) + ")", PROP_ID_WIDTH);
						} else {
							prop_text = pad(prop_text, PROP_NAME_WIDTH + PROP_ID_WIDTH);
						}

						var pp_val = child instanceof red.ContextualObject ? child.val() : child;
						prop_text = pad(prop_text + value_to_value_str(pp_val), PROP_NAME_WIDTH + PROP_ID_WIDTH + PROP_VALUE_WIDTH);

						if ((prop_points_at instanceof red.Dict) || (prop_points_at instanceof red.StatefulProp)) {
							logging_mechanism[is_expanded ? "group" : "groupCollapsed"](prop_text);
							tablify(child);
							logging_mechanism.groupEnd();
						} else {
							logging_mechanism.log(prop_text + value_to_source_str(prop_points_at));
						}

						if (prop_name === "protos") {
							var actual_val = contextual_object.get_all_protos();
							var actual_text = pad("  inherits from", PROP_NAME_WIDTH + PROP_ID_WIDTH) + "[" +
								_.map(actual_val, function (av) {
									return value_to_value_str(av);
								}).join(", ") + "]";
							logging_mechanism.log(actual_text);
						}
					});
					if (is_manifestations) {
						console.groupEnd();
					}
				});
			} else if (contextual_object instanceof red.ContextualStatefulProp) {
				var value_specs = contextual_object.get_values();
				_.each(value_specs, function (value_spec) {
					var value = value_spec.value;
					var source_str = value_to_source_str(value);

					var state = value_spec.state;
					var state_name;
					if (state) {
						if (state instanceof red.State) {
							state_name = pad(state.get_name(), STATE_NAME_WIDTH - 2);
						} else if (state instanceof red.StatechartTransition) { //transition
							var from = state.from(),
								to = state.to();
							state_name = pad(from.get_name() + "->" + to.get_name(), STATE_NAME_WIDTH - 2);
						}

						if (value_spec.active) {
							state_name = "*" + state_name;
						} else {
							state_name = " " + state_name;
						}

						if (value_spec.using) {
							state_name = "*" + state_name;
						} else {
							state_name = " " + state_name;
						}

						state_name = pad(uid.strip_prefix(state.id()), STATE_ID_WIDTH) + state_name;
					} else {
						state_name = pad("", STATE_ID_WIDTH + STATE_NAME_WIDTH);
					}
					var value_for_state = value_spec.value;
					var row = state_name + value_to_source_str(value_for_state);
					logging_mechanism.log(row);
				});
			}
		};

		var root = current_pointer.points_at(0);
		var root_str;
		if (current_pointer.points_at() === root) {
			root_str = ">root";
		} else {
			root_str = "root";
		}
		logging_mechanism.log(pad(root_str, PROP_NAME_WIDTH)  + value_to_value_str(root));
		var contextual_root = red.find_or_put_contextual_obj(root);
		tablify(contextual_root);

		return "ok...";
	}

	red.print = print;
	red.print_statechart = print_statechart;
}(red));
