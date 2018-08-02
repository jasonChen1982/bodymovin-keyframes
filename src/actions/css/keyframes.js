'use strict';
const Util = require('../../lib/util');
const tansform = [ 'r', 'p', 's' ];


/**
 * Keyframes类型动画对象
 *
 * @class Keyframes
 * @param {object} [options] 动画配置信息
 */
function Keyframes(options) {
  this.options = options;
  this.keys = options.ks;
  this.name = Util.getName(options.nm);
  this.aks = {};
  this.keyframes = [];
  this.style = [];
  this.fr = this.keys.fr || 30;
  this.rfr = 1000 / this.fr;
  this.ip = options.ip;
  this.op = options.op;

  this.tfs = Math.floor(this.op - this.ip);

  this.st = this.ip * this.rfr;
  this.et = this.op * this.rfr;

  this.preParser(options.ks);
}

Keyframes.prototype.preParser = function(ks) {
  this.isAT = this.hAT(ks);
  const kps = this.parserKPS(ks);
  this.ast = kps[0] * this.rfr;
  if (kps.indexOf(this.ip) === -1) kps.push(this.ip);
  if (kps.indexOf(this.op) === -1) kps.push(this.op);
  Util.sort(kps);
  this.keyframes = kps.map(t => {
    this.progress = t * this.rfr;
    const pose = this.nextPose(t);
    return pose;
  });
};

Keyframes.prototype.hAT = function(ks) {
  for (const it in ks) {
    if (tansform.indexOf(it) > -1 && ks[it].a === 1) return true;
  }
  return false;
};

Keyframes.prototype.parserKPS = function(ks) {
  const kps = [];
  for (const it in ks) {
    if (ks[it].a === 1 || (it !== 'p' && this.isAT && tansform.indexOf(it) > -1) && !Util.isDefault(it, ks[it].k)) {
      this.aks[it] = ks[it];
      if (ks[it].a === 1) {
        ks[it].k.forEach(it => {
          const t = Math.round(it.t);
          if (Util.isNumber(t) && kps.indexOf(t) === -1) kps.push(t);
        });
      }
    } else if (!Util.isDefault(it, ks[it].k)) {
      this.style[it] = ks[it].k;
    }
  }
  return Util.sort(kps);
};

Keyframes.prototype.nextPose = function(t) {
  const pose = {
    rate: Util.linear(t, this.ip, this.op),
    value: {},
  };
  /* eslint guard-for-in: "off" */
  for (const key in this.aks) {
    const ak = this.aks[key];
    pose.value[key] = this.interpolation(key, ak);
  }
  return pose;
};

Keyframes.prototype.interpolation = function(key, ak) {
  const k = ak.k;
  const progress = Util.clamp(this.progress, this.st, this.et);
  let pkt = this.ast;

  /* eslint no-else-return: 0 */
  if (ak.a === 0) {
    return ak.k;
  }
  if (progress < pkt) {
    return k[0].s;
  } else {
    const l = k.length;
    for (let i = 1; i < l; i++) {
      const kt = k[i].t * this.rfr;
      if (progress < kt) {
        const s = k[i - 1].s;
        const e = k[i - 1].e;
        const value = [];
        const rate = Util.linear(progress, pkt, kt);
        for (let j = 0; j < s.length; j++) {
          const v = e[j] - s[j];
          value[j] = Util.wrapDot(s[j] + v * rate, 2);
        }
        return value;
      }
      pkt = kt;
    }
    return k[l - 2].e;
  }
};

module.exports = Keyframes;
