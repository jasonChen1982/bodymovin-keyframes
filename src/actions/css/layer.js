'use strict';
const Util = require('../../lib/util');
const Keyframes = require('./keyframes');
const stylus = require('stylus');
const autoprefixer = require('autoprefixer-stylus');
const ORDERTRANS = [ 'p', 'r', 's' ];
const OTHERS = [ 'o', 'a' ];
const PM = {
  r: {
    wrap(deg) {
      return `rotate(${deg[0]})`;
    },
    scale: 1,
    prop: 'transform',
  },
  p: {
    wrap(pos) {
      return `translate(${pos[0]}, ${pos[1]})`;
    },
    scale: 1,
    sr: true,
    prop: 'transform',
  },
  s: {
    wrap(scale) {
      return `scale(${scale[0]}, ${scale[1]})`;
    },
    scale: 0.01,
    prop: 'transform',
  },
  o: {
    wrap(opacity) {
      return opacity[0];
    },
    scale: 0.01,
    prop: 'opacity',
  },
  a: {
    wrap(origin) {
      return `${origin[0]} ${origin[1]}`;
    },
    scale: 1,
    sr: true,
    prop: 'transform-origin',
  },
};

/**
 * Layer类型动画对象
 *
 * @class Layer
 * @param {object} layer   动画配置信息
 * @param {object} asset   该层的资源配置信息
 * @param {object} options 命令行配置信息
 */
function Layer(layer, asset, options) {
  Keyframes.call(this, layer);
  this.asset = asset;
  this.flags = options;
  this.position = [ 0, 0, 0 ];
}

Layer.prototype = Object.create(Keyframes.prototype);

Layer.prototype.getCSS = function() {
  const css =
`
/**
 * ${this.name} animation style
 */

.${this.name + '-style'} {
  ${this.getStyle()}
}
@keyframes ${this.name + '-ani'} {
  ${this.getKeys()}
}
`;
  return new Promise((res, rej) => {
    stylus(css)
      .use(autoprefixer({ browsers: [ '> 1%' ] }))
      .render(function(err, output) {
        if (err) {
          rej(err);
        } else {
          res(output);
        }
      });
  });
};

Layer.prototype.getStyle = function() {
  const transform = this.getProp(ORDERTRANS, this.style, true);
  const other = this.getProp(OTHERS, this.style);
  const time = this.tfs * this.rfr;
  const layout = this.flags.l ? this.getLayout() : '';
  const tp = transform.length > 0 ? ('transform: ' + transform.join(' ') + ';') : '';
  const op = other.length > 0 ? other.join('\n') : '';
  const ap = `animation: ${this.name + '-ani'} ${parseInt(time)}ms linear infinite;`;
  return layout + tp + op + ap;
};

Layer.prototype.getLayout = function() {
  const r = this.flags.r;
  const f = this.flags.f;
  let top = 0;
  let left = 0;
  let x = 0;
  let y = 0;

  // deal with css position
  if (this.keyframes[0].value.p) {
    x = this.position[0] = this.keyframes[0].value.p[0];
    y = this.position[1] = this.keyframes[0].value.p[1];
    if (r) {
      x = Util.wrapDot(x / f, 2);
      y = Util.wrapDot(y / f, 2);
      top = Util.passUnit(x, 'rem');
      left = Util.passUnit(y, 'rem');
    } else {
      top = Util.passUnit(x, 'px');
      left = Util.passUnit(y, 'px');
    }
  }

  // deal with css width、height、background style
  let w = 0;
  let h = 0;
  let width = 0;
  let height = 0;
  let url = '';
  let picture = '';
  if (this.asset) {
    w = this.asset.w;
    h = this.asset.h;
    url = './' + this.asset.u + this.asset.p;
    if (r) {
      w = Util.wrapDot(w / f, 2);
      h = Util.wrapDot(h / f, 2);
      width = Util.passUnit(w, 'rem');
      height = Util.passUnit(h, 'rem');
    } else {
      width = Util.passUnit(w, 'px');
      height = Util.passUnit(h, 'px');
    }
    picture = `
width: ${width};
height: ${height};
background-image: url('${url}');
background-size: ${width} ${height};
`;
  }

  // compose layout and width、height、background style
  return `
position: absolute;
top: ${top};
left: ${left};
${picture}
`;
};

Layer.prototype.getKeys = function() {
  const keys = [];
  this.keyframes.forEach(({ rate, value }) => {
    const transform = this.getProp(ORDERTRANS, value, true);
    const other = this.getProp(OTHERS, value);
    const tp = transform.length > 0 ? ('transform: ' + transform.join(' ') + ';') : '';
    const op = other.length > 0 ? other.join('\n') : '';
    const r = Util.wrapDot(rate * 100, 2);
    const k = `${r}% {
      ${tp}
      ${op}
    }`;
    keys.push(k);
  });
  return keys.join('\n');
};

Layer.prototype.getProp = function(ORDER, value, isT) {
  const r = this.flags.r;
  const f = this.flags.f;
  const props = [];
  ORDER.forEach(p => {
    let unit = '';
    const vvp = value[p];
    if (vvp) {
      if (p === 'r') unit = 'deg';
      let vp = Util.isArray(vvp) ? vvp : [ vvp ];
      const { scale, sr, wrap, prop } = PM[p];
      vp = vp.map((it, id) => {
        if (p === 'p') {
          it = it - this.position[id];
        }
        if (sr) {
          if (r) {
            return Util.passUnit(Util.wrapDot(scale * it / f, 2), 'rem');
          }
          return Util.passUnit(Util.wrapDot(it, 2), 'px');
        }
        return Util.passUnit(Util.wrapDot(scale * it, 2), unit);
      });
      if (isT) {
        props.push(`${wrap(vp)}`);
      } else {
        props.push(`${prop}: ${wrap(vp)};`);
      }
    }
  });
  return props;
};

module.exports = Layer;
