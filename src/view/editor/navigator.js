/*jslint nomen: true, vars: true, white: true */
/*jshint scripturl: true */
/*global red,esprima,able,uid,console,window,jQuery,Raphael */

(function (red, $) {
	"use strict";
	var cjs = red.cjs,
		_ = red._;

	$.widget("red.navigator", {
		options: {
			root_client: false,
			single_col: false,
			client_socket: false
		},
		_create: function() {
			var client = this.option("root_client");
			client.signal_interest();

			this.element.attr("id", "obj_nav")
						.on("open_cobj.nav", _.bind(this.open_cobj, this));

			var root_col = $("<table />")	.appendTo(this.element);
			root_col						.column({
												name: "sketch",
												client: client,
												is_curr_col: true,
												show_prev: false,
												client_socket: this.option("client_socket")
											})
											.on("child_select.nav", _.bind(this.on_child_select, this, root_col))
											.on("header_click.nav", _.bind(this.on_header_click, this, root_col))
											.on("prev_click.nav", _.bind(this.on_prev_click, this, root_col))
											.on("child_removed.nav", _.bind(this.on_child_removed, this, root_col))
											.focus();
			this.curr_col = root_col;
			this.columns = [root_col];
		},
		_destroy: function() {
			this._super();
			_.each(this.columns, function(col) {
				col	.off("child_select.nav header_select.nav prev_click.nav child_removed.nav")
					.column("destroy");
			});
			var client = this.option("root_client");
			this.element.off("open_cobj.nav");
			client.signal_destroy();

			delete this.options.root_client;
			delete this.options.client_socket;
			delete this.options;
		},
		on_child_select: function(column, event, child_info) {
			var value = child_info.value;
			if(value instanceof red.WrapperClient && (value.type() === "dict" || value.type() === "stateful")) {
				this.curr_col.column("option", "is_curr_col", false);

				var column_index = _.indexOf(this.columns, column);
				var subsequent_columns = this.columns.slice(column_index + 1);
				_.each(subsequent_columns, function(col) {
					col.column("destroy").remove();
				});
				this.columns.length = column_index + 1;
				var next_col = $("<table />")	.appendTo(this.element);
				next_col						.column({
													name: child_info.name,
													client: child_info.value,
													is_curr_col: true,
													prev_col: column,
													show_prev: this.option("single_col"),
													client_socket: this.option("client_socket")
												})
												.on("child_select.nav", _.bind(this.on_child_select, this, next_col))
												.on("header_click.nav", _.bind(this.on_header_click, this, next_col))
												.on("prev_click.nav", _.bind(this.on_prev_click, this, next_col))
												.on("child_removed.nav", _.bind(this.on_child_removed, this, next_col))
												.focus();

				this.columns.push(next_col);
				if(this.option("single_col")) {
					this.curr_col.hide();
				} else {
					//next_col.hide()
							//.show("fade", "fast");

				}
				this.curr_col = next_col;
			}
		},
		on_header_click: function(column, event, child_info) {
			var column_index = _.indexOf(this.columns, column);
			var subsequent_columns = this.columns.slice(column_index + 1);
			_.each(subsequent_columns, function(col) {
				col.column("destroy").remove();
			});
			this.columns.length = column_index + 1;
			this.curr_col = column;
			this.curr_col.column("option", "is_curr_col", true);
		},
		on_prev_click: function(column, event) {
			var column_index = _.indexOf(this.columns, column);
			var subsequent_columns = this.columns.slice(column_index);
			_.each(subsequent_columns, function(col) {
				col.column("destroy").remove();
			});
			this.columns.length = column_index;
			this.curr_col = this.columns[column_index-1];
			this.curr_col.show();
			this.curr_col.column("option", "is_curr_col", true);
		},

		on_child_removed: function(target, event, client) {
			var removed_index = -1;
			var column;
			for(var i = this.columns.length-1; i>=0; i--) {
				column = this.columns[i];
				if(column.column("option", "client") === client) {
					removed_index = i;
					break;
				}
			}
			if(removed_index >= 0) {
				var subsequent_columns = this.columns.slice(removed_index);
				_.each(subsequent_columns, function(col) {
					col.column("destroy").remove();
				});
				this.columns.length = removed_index;
				this.curr_col = this.columns[removed_index-1];
				this.curr_col.show();
				this.curr_col.column("option", "is_curr_col", true);
			}
		},

		_setOption: function(key, value) {
			this._super(key, value);
			if(key === "anotations") {
				console.log(value);
			}
		},

		open_cobj: function(event) {
			var client_socket = this.option("client_socket");
			var cobj_id = event.cobj_id;
			client_socket.post({type: "get_ptr", cobj_id: cobj_id});
			client_socket.once("cobj_links", function(message) {
				if(message.cobj_id === cobj_id) {
					var vals = message.value;
					var wrapper_clients = _.map(vals, function(val) {
						return client_socket.get_wrapper_client(val.object_summary);
					}, this);

					this.curr_col.column("option", "is_curr_col", false);

					var subsequent_columns = this.columns.slice(1);
					_.each(subsequent_columns, function(col) {
						col.column("destroy").remove();
					});
					this.columns.length = 1;
					var len = wrapper_clients.length;
					var next_col = this.columns[0];
					var single_col = this.option("single_col");
					var last_col;
					for(var i = 0; i<len; i++) {
						var wc = wrapper_clients[i];
						var val = vals[i];
						var is_last = i===len-1;
						last_col = next_col;
						last_col.column("option", "selected_prop_name", val.object_summary.name);

						next_col = $("<table />")	.appendTo(this.element);
						next_col						.column({
															name: val.object_summary.name,
															client: wc,
															is_curr_col: is_last,
															prev_col: next_col,
															show_prev: single_col,
															client_socket: client_socket
														})
														.on("child_select.nav", _.bind(this.on_child_select, this, next_col))
														.on("header_click.nav", _.bind(this.on_header_click, this, next_col))
														.on("prev_click.nav", _.bind(this.on_prev_click, this, next_col))
														.on("child_removed.nav", _.bind(this.on_child_removed, this, next_col));
						if(is_last) {
							next_col.focus();
						}
						this.columns.push(next_col);
					}
					/*
					var next_col = $("<table />")	.appendTo(this.element);
					next_col						.column({
														name: child_info.name,
														client: child_info.value,
														is_curr_col: true,
														prev_col: column,
														show_prev: this.option("single_col"),
														client_socket: this.option("client_socket")
													})
													.on("child_select.nav", _.bind(this.on_child_select, this, next_col))
													.on("header_click.nav", _.bind(this.on_header_click, this, next_col))
													.on("prev_click.nav", _.bind(this.on_prev_click, this, next_col))
													.on("child_removed.nav", _.bind(this.on_child_removed, this, next_col))
													.focus();

					this.columns.push(next_col);
					if(this.option("single_col")) {
						this.curr_col.hide();
					} else {
						//next_col.hide()
								//.show("fade", "fast");

					}
					*/
					this.curr_col = next_col;
				}
			}, this);
		}
	});

}(red, jQuery));
