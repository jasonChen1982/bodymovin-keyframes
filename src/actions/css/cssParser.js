'use strict';

const path = require('path');
const fs = require('fs');
const Layer = require('./layer');

function getAsset(assets, refId) {
  return assets.filter(it => {
    return it.id === refId;
  })[0];
}

function createTree(data, clayers, options) {
  const tree = [];
  const layers = data.layers;
  const assets = data.assets;
  for (let i = 0; i < layers.length; i++) {
    const nm = layers[i].nm;
    const asset = getAsset(assets, layers[i].refId);
    if (clayers.indexOf(nm) > -1) tree.push(new Layer(layers[i], asset, options));
  }
  return tree;
}

module.exports = function(data, clayers, options) {
  const layerTree = createTree(data, clayers, options);
  const baseDir = path.dirname(options.path);
  const queue = layerTree.map(layer => {
    return layer.getCSS(options).catch(err => {
      console.log(err);
    });
  });
  return Promise.all(queue)
    .then(css => {
      fs.writeFileSync(path.resolve(baseDir, 'animation.styl'), css.join('\n'));
    });
};
