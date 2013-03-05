var red = (function(root) {
	var red = function() { };
	red.cjs = cjs.noConflict();
	red.esprima = esprima;
	red._ = _.noConflict();
	red.__debug = true;

	var factories = {};
	red.define = function(type, factory) {
		factories[type] = factory;
	};
	red.create = function(type) {
		if(factories.hasOwnProperty(type)) {
			var factory = factories[type];
			var args = [].slice.call(arguments, 1);
			return factory.apply(root, args);
		} else {
			return undefined;
		}
	};
	var uid_objs = {};
	red.register_uid = function(uid, obj) {
		uid_objs[uid] = obj;
	};
	red.unregister_uid = function(uid) {
		delete uid_objs[uid];
	};
	red.find_uid = function(uid) {
		return uid_objs[uid];
	};
	return red;
}(this));
