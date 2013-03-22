(function(red) {
var cjs = red.cjs, _ = red._;

var get_event = function(tree, options, live_event_creator) {
	var event_constraint = red.get_parsed_$(tree, options);
	var got_value = event_constraint.get();
	if(got_value instanceof red.Event) {
		return got_value;
	} else {
		cjs.removeDependency(event_constraint, live_event_creator);
		return red.create_event("constraint", event_constraint, got_value);
	}
};

red.ParsedEvent = red._create_event_type("parsed");
(function(my) {
	var proto = my.prototype;
	proto.set_transition = function(transition) {
		my.superclass.set_transition.apply(this, arguments);
		if(this._old_event) {
			this._old_event.set_transition(this.get_transition());
		}
	};

	proto.on_create = function(options) {
		this._id = uid();
		red.register_uid(this._id, this);

		this.options = options;
		this._str = cjs.is_constraint(options.str) ? options.str : cjs(options.str);
		if(options.inert !== true) {
			var SOandC = red.find_stateful_obj_and_context(options.context);
			var context = SOandC.context;
			var parent = SOandC.stateful_obj;

			var self = this;
			this._tree = cjs(function() {
				return esprima.parse(self.get_str());
			});

			this.$child_fired = _.bind(this.child_fired, this);

			this._old_event = null;
			//cjs.wait(); // ensure our live event creator isn't immediately run
			this._live_event_creator = cjs.liven(function() {
				if(this._old_event) {
					this._old_event.off_fire(this.$child_fired);
					this._old_event.destroy(true); //destroy silently (without nullifying)
				}

				var tree = this._tree.get();
				cjs.wait();
				var event = false;
				event = get_event(tree, {
						parent: parent,
						context: context
					}, this._live_event_creator);
				cjs.signal();

				if(event) {
					event.set_transition(this.get_transition());
					event.on_fire(this.$child_fired);
					if(this.is_enabled()) {
						event.enable();
					}
				}

				this._old_event = event;
			}, {
				context: this,
				run_on_create: false
			});
			//cjs.signal();
			_.delay(_.bind(function() { //Delay it because parsed events can run up the dictionary tree and create all sorts of contextual objects that they shouldn't
				this._live_event_creator.run();
			}, this));
		}
	};
	proto.id = function() { return this._id; };
	proto.child_fired = function() {
		this.fire.apply(this, arguments);
	};
	proto.get_str = function() { return this._str.get(); };
	proto.set_str = function(str) {
		this._str.set(str);
		this._emit("setString", {
			to: str
		});
	};
	proto.create_shadow = function(parent_statechart, context) {
		return red.create_event("parsed", {str: this._str, context: context, inert_shadows: this.options.inert_shadows, inert: this.options.inert_shadows});
	};
	proto.destroy = function() {
		if(this._old_event) {
			this._old_event.off_fire(this.$child_fired);
			this._old_event.destroy();
		}
		if(this._live_event_creator) {
			this._live_event_creator.destroy();
		}
	};
	proto.clone = function() {
	};
	proto.stringify = function() {
		return this._str.get();
	};
	red.register_serializable_type("parsed_event",
									function(x) { 
										return x instanceof my;
									},
									function() {
										return {
											str: this.get_str(),
											inert: this.options.inert
										};
									},
									function(obj) {
										return new my({
											str: obj.str,
											inert: obj.inert
										});
									});
	proto.enable = function() {
		my.superclass.enable.apply(this, arguments);
		if(this._old_event) {
			this._old_event.enable();
		}
	};
	proto.disable = function() {
		my.superclass.disable.apply(this, arguments);
		if(this._old_event) {
			this._old_event.disable();
		}
	};
}(red.ParsedEvent));
}(red));
