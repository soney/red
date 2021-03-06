/*jslint nomen: true */
/*global cjs,esprima,_,able,uid */

var interstate = (function (root) {
    "use strict";
	var ist = {
		cjs: cjs.noConflict(),
		_: _.noConflict(),
		esprima: esprima,
		version: "<%= version %>",
		build_time: "<%= build_time %>",
		__log_errors: true,
		__debug: true,
		__empty_files: false,
		__garbage_collect: true,
		root_name: "sketch"
	};

	ist.cjs.__debug = ist.__debug;
	ist.__debug_statecharts = ist.__debug;

	able.make_this_listenable(ist);
	able.make_proto_listenable(ist);

	var uid_objs = {};
	ist.register_uid = function (id, obj) {
		uid_objs[id] = obj;
		ist._emit("uid_registered", id, obj);
	};
	ist.unregister_uid = function (id) {
		delete uid_objs[id];
		ist._emit("uid_unregistered", id);
	};
	ist.find_uid = function (uid) { return uid_objs[uid]; };


	var valid_prop_name_regex = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;
	ist.is_valid_prop_name = function(name) {
		return name.match(valid_prop_name_regex);
	};

	ist.async_js = function(url, cback) {
		var doc = root.document,
		type = 'script',
		node = doc.createElement(type),
		head = doc.getElementsByTagName('head')[0];

		node.type = 'text/javascript';
		node.src = url;
		if (cback) { node.addEventListener('load', function (e) { cback(e); }, false); }
		head.appendChild(node);
	};

	return ist;
}(this));
