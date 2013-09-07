/*global interstate */

(function(ist) {
	"use strict";

	var env = new ist.Environment();
env
.cd("child_nodes")
	.set("paper", "<stateful>")
	.cd("paper")
		.set("(prototypes)", "(start)", "[raphael]")
		.set("rtype", "(start)", "'paper'")
		.set("rattr", "<dict>")
		.cd("rattr")
			.set("width", "500")
			.set("height", "500")
		.up()
	.set("ball", "<stateful>")
	.cd("ball")
		.set("(prototypes)", "(start)", "[raphael]")
		.set("rtype", "(start)", "'circle'")
		.set("rattr", "<dict>")
		.cd("rattr")
			.set("r", "50")
			.set("cx", "50")
			.set("cy", "50")
			.set("fill", "'orange'")

	ist.on_sample_app_ready(env.get_root());
}(interstate));
