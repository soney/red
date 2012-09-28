(function(red) {
var cjs = red.cjs, _ = red._;

var RedGroup = function(options) {
	options = options || {};

	this.type = "red_group";
	this.id = _.uniqueId();

	this._default_context = cjs(options.default_context, true);
	this._template = cjs.$();
	this._basis = cjs.$();
};
(function(my) {
	var proto = my.prototype;
	//
	//
	// === DEFAULT CONTEXT ===
	//
	proto.get_default_context = function() { return this._default_context.get(); }
	proto.set_default_context = function(context) { this._default_context.set(context, true); }
	
	//
	// === PROTOS ===
	//
	proto.set_template = function(protos) {
		this._template.set(protos);
	};
	proto.get_template = function() {
		return this._template.get();
	};

	//
	// === BASIS ===
	//
	proto.set_basis = function(basis) {
		this._basis.set(basis);
	};
	proto.get_basis = function() {
		return this._basis.get();
	};


	//
	// === GETTER ===
	//
	
	proto.get = function(context) {
		var basis = this.get_basis();
		basis = red.get_contextualizable(basis, context);
		var template = this.get_template();

		if(this._last_basis === basis && this._last_template === template) { return this._last_rv; }

		var rv;
		if(_.isNumber(basis)) {
			rv = [];
			_.times(basis, function(index) {
				var dict = red.create("stateful_obj", {defer_statechart_invalidation: true, direct_protos: template});
				dict.set_prop("basis", index);
				rv.push(dict);
			});
		} else if(_.isArray(basis)) {
			rv = _.map(basis, function(basis_obj) {
				var dict = red.create("stateful_obj", {defer_statechart_invalidation: true, direct_protos: template});
				dict.set_prop("basis", basis_obj);
				return dict;
			});
		} else {
			rv = [];
		}
		this._last_basis = basis;
		this._last_template  = template;
		this._last_rv = rv;
		return rv;
	};

	proto.is_inherited = function() { return false; };

}(RedGroup));

red.RedGroup = RedGroup;

red.define("group", function(options) {
	var group = new RedGroup(options);
	return group;
});

}(red));
