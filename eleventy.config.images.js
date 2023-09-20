const path = require("path");
const eleventyImage = require("@11ty/eleventy-img");

module.exports = eleventyConfig => {
	function relativeToInputPath(inputPath, relativeFilePath) {
		let split = inputPath.split("/");
		split.pop();

		return path.resolve(split.join(path.sep), relativeFilePath);
	}

	// Eleventy Image shortcode
	// https://www.11ty.dev/docs/plugins/image/
	eleventyConfig.addAsyncShortcode("image", async function imageShortcode(src, alt, widths, sizes) {
		// Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
		// Warning: Avif can be resource-intensive so take care!
		let formats = ["avif", "webp", "auto"];
		let file = src;
		if (src.indexOf('.') === 0) {
			file = relativeToInputPath(this.page.inputPath, src);
		}
		
		let metadata = await eleventyImage(file, {
			widths: widths || ["auto"],
			formats,
			outputDir: path.join(eleventyConfig.dir.output, "img"), // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
		});

		// TODO loading=eager and fetchpriority=high
		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
		};
		return eleventyImage.generateHTML(metadata, imageAttributes);
	});

	eleventyConfig.addFilter("backgroundImage", async function(imageUrl) {
		let fullPath = imageUrl;
		if (fullPath.indexOf('.') === 0) {
			fullPath = relativeToInputPath(this.page.inputPath, imageUrl);
		}
		
		if (!imageUrl) {
		  return '';
		}
	
		// Generate responsive images using Eleventy Image
		let image = await eleventyImage(fullPath, {
		  widths: [1200], // You can adjust the widths as needed
		  formats: ["webp"], // Supported image formats
		  outputDir: "_site/img", // Output directory for generated images
		});

		// console.log(image)
	
		// Return the CSS background-image property
		return `background-image: url(${image.webp[0].url});`;
	  });
};
