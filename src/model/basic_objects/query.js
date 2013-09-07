/*jslint nomen: true, vars: true */
/*global interstate,esprima,able,uid,console,window,RedSet */

(function (ist) {
    "use strict";
    var cjs = ist.cjs,
        _ = ist._;
	
	ist.find_fn = function(find_root) {
		/*
		if (arguments.length === 0) {
			find_root = new ist.ContextualObject({pointer: root_pointer});
		}
		*/
		return new ist.Query({value: find_root});
	};
	ist.register_serializable_type("ist_find_fn_func",
		function (x) {
			return x === ist.find_fn;
		},
		function () {
			return {};
		},
		function (obj) {
			return ist.find_fn;
		});

    ist.Query = function (options) {
        this.options = _.extend({
            value: [],
            parent_query: null
        }, options);
        if (!_.isArray(this.options.value)) {
            this.options.value = [this.options.value];
        }
        this.options.value = _	.chain(this.options.value)
								.map(function (pointer_object) {
									if(pointer_object) {
										var pointer = pointer_object.get_pointer();
										var points_at = pointer.points_at();
										var cobj;
										if (points_at instanceof ist.Dict) {
											cobj = ist.find_or_put_contextual_obj(points_at, pointer);
											if (cobj.is_template()) {
												return cobj.instances();
											} else {
												return cobj;
											}
										} else {
											cobj = ist.find_or_put_contextual_obj(points_at, pointer);
											//new ist.ContextualObject({pointer: pointer});
											return cobj;
										}
									} else {
										return false;
									}
								})
								.flatten(true)
								.value();
    };

    (function (My) {
        var proto = My.prototype;
    
        var raw_filter_funcs = {
            "lt": function (a, b) { return a < b; },
            "gt": function (a, b) { return a > b; },
            "le": function (a, b) { return a <= b; },
            "ge": function (a, b) { return a >= b; },
            "eq": function (a, b) { return a === b; }
        };
    
        var filter_funcs = {
            "in_state": function (cobj, index, arr, state_name) {
                var statecharts, i, j;
                if (cobj instanceof ist.ContextualStatefulObj) {
                    statecharts = cobj.get_statecharts();
                } else {
                    statecharts = [];
                }
    
                for (i = 0; i < statecharts.length; i += 1) {
                    var statechart = statecharts[i];
                    var active_substates = statechart.get_active_states();
                    for (j = 0; j < active_substates.length; j += 1) {
                        var active_substate = active_substates[j];
                        if (active_substate.get_name() === state_name) {
                            return true;
                        }
                    }
                }
                return false;
            }
        };
    
        _.each(raw_filter_funcs, function (func, name) {
            filter_funcs[name] = function (pointer_val, index, arr, other_val) {
                var pointer = pointer_val.get_pointer();
                var p_val = pointer.val();
                return func(p_val, other_val);
            };
        });
    
        _.each(filter_funcs, function (func, name) {
            proto[name] = function () {
                var args = _.toArray(arguments);
                return this.filter(function () {
                    return func.apply(this, (_.toArray(arguments)).concat(args));
                });
            };
        });
    
        var map_funcs = {
            "prop": function (cobj, index, arr, name) {
                var prop_cobj = cobj.prop(name);
                return prop_cobj;
            },
            "parent": function (cobj) {
                var pointer = cobj.get_pointer();
                var new_ptr = pointer.pop();
                var new_ptr_obj = new_ptr.points_at();
    
                var rv = ist.find_or_put_contextual_obj(new_ptr_obj, new_ptr);
                return rv;
            }
        };
    
        _.each(map_funcs, function (func, name) {
            proto[name] = function () {
                var args = _.toArray(arguments);
                return this.map(function () {
                    return func.apply(this, (_.toArray(arguments)).concat(args));
                });
            };
        });
    
        proto.filter = function (filter_func, context) {
            return this.op(function (values) {
                return _.filter(values, filter_func, context);
            });
        };
		proto.eq = function(index) {
			var value = this.value();
			return value[index];
		};
        proto.map = function (map_func, context) {
            return this.op(function (values) {
                return _.map(values, map_func, context);
            });
        };
        proto.size = function () {
            return this.value().length;
        };
        proto.is_empty = function () {
            return this.size() === 0;
        };
    
        var extract_items = function () {
            var items = _.chain(arguments)
                     .map(function (other_query) {
                        var other_objects;
                        if (other_query instanceof ist.Query) {
                            other_objects = other_query.value();
                        } else if (_.isArray(other_query)) {
                            other_objects = other_query;
                        } else {
                            other_objects = [other_query];
                        }
                        return other_objects;
                    })
                    .flatten(true)
                    .value();
            return items;
        };
    
        proto.add = function () {
            var my_value_set = new RedSet({value: this.value(), equals: ist.check_contextual_object_equality, hash: "hash"});
            var items = extract_items.apply(this, arguments);
            
            var new_value_set = my_value_set.add.apply(my_value_set, items);
    
            var new_query = new ist.Query({
                value: new_value_set.toArray(),
                parent_query: this
            });
            return new_query;
        };
    
        proto.not = proto.remove = function () {
            var my_value_set = new RedSet({value: this.value(), equals: ist.check_contextual_object_equality, hash: "hash"});
            var items = extract_items.apply(this, arguments);
    
            my_value_set.remove.apply(my_value_set, items);
            var new_query = new ist.Query({
                value: my_value_set.toArray(),
                parent_query: this
            });
            return new_query;
        };
    
        proto.op = function (op_func, context) {
            var value = op_func.call(context || window, this.value());
            var new_query = new ist.Query({
                value: value,
                parent_query: this
            });
            return new_query;
        };
    
        proto.value = function () {
            return this.options.value;
        };
        proto.parent_query = function () {
            return this.options.parent_query;
        };
    }(ist.Query));

}(interstate));
