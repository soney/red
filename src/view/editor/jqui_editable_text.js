/*jslint nomen: true, vars: true, white: true */
/*global interstate,esprima,able,uid,console,window,jQuery,Raphael */

(function (ist, $) {
	"use strict";
	var cjs = ist.cjs,
		_ = ist._;
	
	var editing_text_template = cjs.createTemplate("<textarea cjs-on-blur=on_edit_blur cjs-on-keydown=on_edit_keydown />");

	cjs.registerCustomPartial("editing_text", {
		createNode: function(init_val) {
			var node = editing_text_template({
				on_edit_blur: function(event) {
					$(node).editing_text("on_edit_blur", event);
				},
				on_edit_keydown: function(event) {
					$(node).editing_text("on_edit_keydown", event);
				}
			});
			$(node).editing_text({
				init_val: init_val
			});

			return node;
		},
		onAdd: function(node, init_val) {
			_.defer(function() { $(node).val(init_val).select().focus(); });
		},
		onRemove: function(node) {
			$(node).editing_text("option", "helper", false);
		},
		destroyNode: function(node) {
			$(node).editing_text("destroy");
		}
	});
	$.widget("interstate.editing_text", {
		options: {
			init_val: "",
			helper: false
		},
		_create: function () {
			this._helper_focused = false;
			this.element.val(this.option("init_val"));
			$("#cancel_button").on("click", _.bind(function() {
			}, this);
			$("#confirm_button").on("click", _.bind(function() {
			}, this);
		},
		_destroy: function () {
			this.option("helper", false);
			this._super();
		},
		_setOption: function(key, value) {
			if(key === "helper") {
				var editor = value,
					old_editor = this.option("helper");

				if(old_editor) {
					old_editor.setValue("");
					old_editor.clearSelection();
				}

				if(editor) {
					editor.setValue(this.element.val());
					editor.clearSelection();
					this.$textarea_binding = cjs(this.element[0]);
					this.$textarea_binding.onChange(function() {
						editor.setValue(this.$textarea_binding.get());
						editor.clearSelection();
					}, this);
				}
			}
			this._super(key, value);
		},
		on_edit_blur: function(event) {
			var editor = this.option("helper"),
				do_confirm = _.bind(function() {
					var e = new $.Event("confirm_value");
					e.value = this.element.val();

					this.element.trigger(e);
				}, this);
			event.preventDefault();
			event.stopPropagation();

			var on_editor_blur = _.bind(function() {
					this._helper_focused = false;
					_.delay(_.bind(function() {
						if(!this.element.is(":focus")) {
							do_confirm();
						}
					}, this), 50);

					editor.off("blur", on_editor_blur);
					editor.off("change", on_editor_change);
				}, this),
				on_editor_change = _.bind(function(event) {
					if(this._helper_focused) {
						this.element.val(editor.getValue());
					}
				}, this);

			if(editor) { // they might have clicked on the helper
				_.delay(_.bind(function() {
					if(editor.isFocused()) {
						this._helper_focused = true;
						editor.on("change", on_editor_change);
						editor.on("blur", on_editor_blur);
					} else {
						do_confirm();
					}
				}, this), 50);
			} else {
				do_confirm();
			}
		},
		on_edit_keydown: function(event) {
			var keyCode = event.keyCode;

			if(keyCode === 27) { //esc
				event.preventDefault();
				event.stopPropagation();

				var e = new $.Event("cancel_value");
				this.element.trigger(e);
			} else if(keyCode === 13) { //enter
				if(!event.shiftKey && !event.ctrlKey && !event.metaKey) {
					event.preventDefault();
					event.stopPropagation();

					var e = new $.Event("confirm_value");
					e.value = this.element.val();
					this.element.trigger(e);
				}
			}
		}
	});
}(interstate, jQuery));
