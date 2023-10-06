const elasticlunr = require("elasticlunr");
const stripTags = require('striptags');

module.exports = function (collection) {
    // what fields we'd like our index to consist of
    var index = elasticlunr(function () {
      this.addField("title");
      this.addField("description");
      this.addField("tags");
      this.addField("content");
      this.setRef("id");
    });
  
    // loop through each page and add it to the index
    collection.forEach((page) => {
      index.addDoc({
        id: page.url,
        title: page.template.frontMatter.data.title,
        description: page.template.frontMatter.data.description,
        tags: page.template.frontMatter.data.tags,
        content: stripTags(page.templateContent).substring(0, 5_000)
      });
    });
  
    return index.toJSON();
  };