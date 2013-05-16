/*jslint nomen: true, vars: true, white: true */
/*global red,esprima,able,uid,console,window,jQuery,Raphael */

(function (red, $) {
	"use strict";
	var cjs = red.cjs,
		_ = red._;

	var STATE = {
		IDLE: {},
		EDITING: {}
	};

	$.widget("red.editable_text", {
		options: {
			text: "",
			edit_event: "click"
		},

		_create: function() {
			this.set_state(STATE.IDLE);
			this.update_static_text();
			this.$edit = $.proxy(this.edit, this);
		},


		update_static_text: function() {
			this.element.text(this.option("text"));
		},

		edit: function(event) {
			if(event) {
				event.preventDefault();
				event.stopPropagation();
			}
			if(this.get_state() === STATE.IDLE) {
				this.element.html(""); // Clear the children
				this.textbox = $("<input />")	.attr({
													type: "text"
												})
												.val(this.option("text"))
												.appendTo(this.element)
												.focus()
												.select()
												.on("keydown", $.proxy(function(event) {
													var keyCode = event.keyCode;
													if(keyCode === 27) { // ESC
														this.cancel();
													} else if(keyCode === 13) { // Enter
														this.confirm();
													}
												}, this))
												.on("blur", $.proxy(function(event) {
													if(this.get_state() === STATE.EDITING) {
														this.confirm();
													}
												}, this));
				this.set_state(STATE.EDITING);

				this.element.trigger("begin_edit");
			}
		},

		confirm: function() {
			var value = this.textbox.val();
			if(value !== this.option("text")) {
				var event = new $.Event("text_change");
				event.str = this.textbox.val();
				this.option("text", value);

				this.element.trigger(event);
			}

			this.textbox.remove();
			this.set_state(STATE.IDLE);
			this.update_static_text();
			this.element.trigger("done_editing");
		},

		cancel: function() {
			this.textbox.remove();
			this.set_state(STATE.IDLE);
			this.update_static_text();
			this.element.trigger("done_editing");
		},

		get_state: function() {
			return this.state;
		},

		set_state: function(state) {
			this.state = state;
		},

		_destroy: function() {
		}
	});

}(red, jQuery));