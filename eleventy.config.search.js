const searchFilter = require("./filters/searchFilter");

module.exports = eleventyConfig => {
    eleventyConfig.addFilter("search", searchFilter);
}