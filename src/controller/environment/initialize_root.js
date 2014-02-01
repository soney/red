/*jslint nomen: true, vars: true */
/*global interstate,esprima,able,uid,console */

(function (ist) {
	"use strict";
	var cjs = ist.cjs,
		_ = ist._;

	ist.get_default_root = function(dont_initialize, builtins) {
		var root = new ist.Dict({has_protos: false, direct_attachments: [new ist.PaperAttachment(), new ist.DomAttachment({instance_options: {tag: 'div'}})]});

		if(!dont_initialize) {
			ist.initialize_root(root, builtins);
		}

		return root;
	};
	ist.initialize_root = function (root_dict, builtins) {
		if(builtins !== false || (_.indexOf(builtins, "raphael") >= 0)) {
			var screen = new ist.Dict({has_protos: false});
			root_dict.set("screen", screen);

			root_dict.set("width", new ist.Cell({str: "100"/* + (window.innerWidth-0)*/}));
			root_dict.set("height", new ist.Cell({str: "100"/* + (window.innerHeight-0)*/}));

			var shape = new ist.Dict({has_protos: false});
			root_dict.set("shape", shape);

			var circle = new ist.Dict({has_protos: false, direct_attachments: [new ist.ShapeAttachment({
																								instance_options: {
																									shape_type: "circle",
																									constructor_params: [0, 0, 0]
																								}
																						})]
																					});
			shape.set("circle", circle);
			circle.set("show", new ist.Cell({str: "true"}));
			circle.set("clip_rect", new ist.Cell({str: "null"}));
			circle.set("cursor", new ist.Cell({str: "'default'"}));
			circle.set("cx", new ist.Cell({str: "sketch.width/2"}));
			circle.set("cy", new ist.Cell({str: "sketch.height/2"}));
			circle.set("fill", new ist.Cell({str: "'teal'"}));
			circle.set("fill_opacity", new ist.Cell({str: "1.0"}));
			circle.set("opacity", new ist.Cell({str: "1.0"}));
			circle.set("r", new ist.Cell({str: "50"}));
			circle.set("stroke", new ist.Cell({str: "'none'"}));
			circle.set("stroke_dasharray", new ist.Cell({str: "''"}));
			circle.set("stroke_opacity", new ist.Cell({str: "1.0"}));
			circle.set("stroke_width", new ist.Cell({str: "1"}));
			circle.set("transform", new ist.Cell({str: "''"}));
			circle.set("animated_properties", new ist.Cell({str: "false"}));
			circle.set("animation_duration", new ist.Cell({str: "300"}));
			circle.set("animation_easing", new ist.Cell({str: "'linear'"}));


			var ellipse = new ist.Dict({has_protos: false, direct_attachments: [new ist.ShapeAttachment({
																								instance_options: {
																									shape_type: "ellipse",
																									constructor_params: [0, 0, 0, 0]
																								}
																						})]
																					});
			shape.set("ellipse", ellipse);
			ellipse.set("show", new ist.Cell({str: "true"}));
			ellipse.set("clip_rect", new ist.Cell({str: "null"}));
			ellipse.set("cursor", new ist.Cell({str: "'default'"}));
			ellipse.set("cx", new ist.Cell({str: "sketch.width/3"}));
			ellipse.set("cy", new ist.Cell({str: "sketch.height/3"}));
			ellipse.set("fill", new ist.Cell({str: "'yellow'"}));
			ellipse.set("fill_opacity", new ist.Cell({str: "1.0"}));
			ellipse.set("opacity", new ist.Cell({str: "1.0"}));
			ellipse.set("rx", new ist.Cell({str: "150"}));
			ellipse.set("ry", new ist.Cell({str: "90"}));
			ellipse.set("stroke", new ist.Cell({str: "'none'"}));
			ellipse.set("stroke_dasharray", new ist.Cell({str: "''"}));
			ellipse.set("stroke_opacity", new ist.Cell({str: "1.0"}));
			ellipse.set("stroke_width", new ist.Cell({str: "1"}));
			ellipse.set("transform", new ist.Cell({str: "''"}));
			ellipse.set("animated_properties", new ist.Cell({str: "false"}));
			ellipse.set("animation_duration", new ist.Cell({str: "300"}));
			ellipse.set("animation_easing", new ist.Cell({str: "'linear'"}));
			
			var image = new ist.Dict({has_protos: false, direct_attachments: [new ist.ShapeAttachment({
																								instance_options: {
																									shape_type: "image",
																									constructor_params: ["", 0, 0, 0, 0]
																								}
																						})]
																					});
			shape.set("image", image);
			image.set("show", new ist.Cell({str: "true"}));
			image.set("clip_rect", new ist.Cell({str: "null"}));
			image.set("cursor", new ist.Cell({str: "'default'"}));
			image.set("opacity", new ist.Cell({str: "1.0"}));
			image.set("src", new ist.Cell({str: "'http://interstate.from.so/images/interstate_logo.png'"}));
			image.set("transform", new ist.Cell({str: "''"}));
			image.set("x", new ist.Cell({str: "20"}));
			image.set("y", new ist.Cell({str: "20"}));
			image.set("width", new ist.Cell({str: "150"}));
			image.set("height", new ist.Cell({str: "150"}));
			image.set("animated_properties", new ist.Cell({str: "false"}));
			image.set("animation_duration", new ist.Cell({str: "300"}));
			image.set("animation_easing", new ist.Cell({str: "'linear'"}));


			var rect = new ist.Dict({has_protos: false, direct_attachments: [new ist.ShapeAttachment({
																								instance_options: {
																									shape_type: "rect",
																									constructor_params: [0, 0, 0, 0]
																								}
																						})]
																					});
			shape.set("rect", rect);
			rect.set("show", new ist.Cell({str: "true"}));
			rect.set("clip_rect", new ist.Cell({str: "null"}));
			rect.set("cursor", new ist.Cell({str: "'default'"}));
			rect.set("x", new ist.Cell({str: "sketch.width/4"}));
			rect.set("y", new ist.Cell({str: "sketch.height/4"}));
			rect.set("fill", new ist.Cell({str: "'Chartreuse'"}));
			rect.set("fill_opacity", new ist.Cell({str: "1.0"}));
			rect.set("opacity", new ist.Cell({str: "1.0"}));
			rect.set("r", new ist.Cell({str: "0"}));
			rect.set("stroke", new ist.Cell({str: "'none'"}));
			rect.set("stroke_dasharray", new ist.Cell({str: "''"}));
			rect.set("stroke_opacity", new ist.Cell({str: "1.0"}));
			rect.set("stroke_width", new ist.Cell({str: "1"}));
			rect.set("transform", new ist.Cell({str: "''"}));
			rect.set("width", new ist.Cell({str: "140"}));
			rect.set("height", new ist.Cell({str: "90"}));
			rect.set("animated_properties", new ist.Cell({str: "false"}));
			rect.set("animation_duration", new ist.Cell({str: "300"}));
			rect.set("animation_easing", new ist.Cell({str: "'linear'"}));
			
			var text = new ist.Dict({has_protos: false, direct_attachments: [new ist.ShapeAttachment({
																								instance_options: {
																									shape_type: "text",
																									constructor_params: [0, 0, ""]
																								}
																						})]
																					});
			shape.set("text", text);
			text.set("show", new ist.Cell({str: "true"}));
			text.set("clip_rect", new ist.Cell({str: "null"}));
			text.set("cursor", new ist.Cell({str: "'default'"}));
			text.set("x", new ist.Cell({str: "200"}));
			text.set("y", new ist.Cell({str: "150"}));
			text.set("opacity", new ist.Cell({str: "1.0"}));
			text.set("stroke", new ist.Cell({str: "'none'"}));
			text.set("fill", new ist.Cell({str: "'grey'"}));
			text.set("fill_opacity", new ist.Cell({str: "1.0"}));
			text.set("stroke_dasharray", new ist.Cell({str: "''"}));
			text.set("stroke_opacity", new ist.Cell({str: "1.0"}));
			text.set("stroke_width", new ist.Cell({str: "1"}));
			text.set("transform", new ist.Cell({str: "''"}));
			text.set("text", new ist.Cell({str: "'hello world'"}));
			text.set("text_anchor", new ist.Cell({str: "'middle'"}));
			text.set("font_family", new ist.Cell({str: "'Arial'"}));
			text.set("font_size", new ist.Cell({str: "40"}));
			text.set("font_weight", new ist.Cell({str: "400"}));
			text.set("font_style", new ist.Cell({str: "'normal'"}));
			text.set("animated_properties", new ist.Cell({str: "false"}));
			text.set("animation_duration", new ist.Cell({str: "300"}));
			text.set("animation_easing", new ist.Cell({str: "'linear'"}));

			var path = new ist.Dict({has_protos: false, direct_attachments: [new ist.ShapeAttachment({
																								instance_options: {
																									shape_type: "path",
																									constructor_params: ["M0,0"]
																								}
																						})]
																					});
			shape.set("path", path);
			path.set("show", new ist.Cell({str: "true"}));
			path.set("clip_rect", new ist.Cell({str: "null"}));
			path.set("cursor", new ist.Cell({str: "'default'"}));
			path.set("fill", new ist.Cell({str: "'none'"}));
			path.set("fill_opacity", new ist.Cell({str: "1.0"}));
			path.set("opacity", new ist.Cell({str: "1.0"}));
			path.set("stroke", new ist.Cell({str: "'RoyalBlue'"}));
			path.set("stroke_dasharray", new ist.Cell({str: "''"}));
			path.set("stroke_opacity", new ist.Cell({str: "1.0"}));
			path.set("stroke_miterlimit", new ist.Cell({str: "0"}));
			path.set("stroke_width", new ist.Cell({str: "1"}));
			path.set("path", new ist.Cell({str: "'M0,0L300,300'"}));
			path.set("transform", new ist.Cell({str: "''"}));
			path.set("animated_properties", new ist.Cell({str: "false"}));
			path.set("animation_duration", new ist.Cell({str: "300"}));
			path.set("animation_easing", new ist.Cell({str: "'linear'"}));

			var group = new ist.Dict({has_protos: false, direct_attachments: [new ist.GroupAttachment()]});
			shape.set("group", group);
			group.set("show", new ist.Cell({str: "true"}));
		}

		if(builtins !== false || (_.indexOf(builtins, "dom") >= 0)) {
		/*
			var child_nodes = new ist.Dict({has_protos: false});
			//root_dict.set("child_nodes", child_nodes);
			var dom = new ist.Dict({has_protos: false, direct_attachments: [new ist.DomAttachment()]});
			root_dict.set("dom", dom);
			dom.set("tag", new ist.Cell({str: "'div'"}));
			*/
		}

		if(builtins !== false || (_.indexOf(builtins, "functions") >= 0)) {
			root_dict.set("on", ist.on_event);
			root_dict.set("find", ist.find_fn);
			root_dict.set("emit", ist.emit);
		}
	};
}(interstate));