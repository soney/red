/*jslint nomen: true, vars: true */
/*global red,esprima,able,uid,window,console */

(function (red) {
	"use strict";
	var cjs = red.cjs,
		_ = red._;

	var requestAnimFrame = (function(){
		return	window.requestAnimationFrame		||
				window.webkitRequestAnimationFrame	||
				window.mozRequestAnimationFrame		||
		function(callback) {
			window.setTimeout(callback, 1000/60);
		};
	})();
	red.FrameEvent = function () {
		red.Event.apply(this, arguments);
		this._initialize();
		this._type = "frame_event";
	};
	(function (My) {
		_.proto_extend(My, red.Event);
		var proto = My.prototype;
		proto.on_create = function () {
			this.created_at = (new Date()).getTime();
		};
		proto.set_transition = function (transition) {
			this._transition = transition;
			if (transition) {
				var from = transition.from();
				var enter_listener = _.bind(function () {
					requestAnimFrame(_.bind(this.notify, this));
				}, this);

				from.on("active", enter_listener);

				_.defer(function () {
					if (from.is_active()) {
						enter_listener();
					}
				});
			}
		};
		proto.notify = function () {
			red.event_queue.wait();
			this.fire({
				type: "frame",
				current_time: (new Date()).getTime(),
				created_at: this.created_at
			});
			red.event_queue.signal();
		};

		proto.enable = function () {
			My.superclass.enable.apply(this, arguments);
		};
		proto.disable = function () {
			My.superclass.disable.apply(this, arguments);
		};
	}(red.FrameEvent));
}(red));
