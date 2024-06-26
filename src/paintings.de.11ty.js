exports.data = {
  layout: "painting-item.11ty.js",
  lang: "de",
  collectionID: "paintingsDE",
  entityType: "paintings",
  pagination: {
    data: "collections.paintingsDE",
    size: 1,
    alias: "painting",
    currentCollection: "collections.paintingsDE",
  },
  permalink: function(data){
    const item = data.pagination.items[0];
    return `/${data.lang}/${item.metadata.id}/`;
  }
};

exports.render = (data) => {
  return data.pagination.items[0];
};


