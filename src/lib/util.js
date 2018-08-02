'use strict';
/* eslint-disable */

const defaultValue = {
  o: 100,
  r: 0,
  s: 100,
  p: 0,
};
/**
 * 返回数据类型
 * @param {*} val 任何类型
 * @return {String} 数据类型
 */
function _rt(val) {
  return Object.prototype.toString.call(val);
}

/**
 * Utils 引擎工具箱
 *
 * @namespace JC.Utils
 */
module.exports = {
  /**
   * 简单拷贝纯数据的JSON对象
   *
   * @static
   * @memberof JC.Utils
   * @param {JSON} json 待拷贝的纯数据JSON
   * @return {JSON} 拷贝后的纯数据JSON
   */
  copyJSON: function(json) {
    return JSON.parse(JSON.stringify(json));
  },

  /**
   * 将角度转化成弧度的乘法因子
   *
   * @static
   * @memberof JC.Utils
   * @type {number}
   */
  DTR: Math.PI/180,

  /**
   * 将弧度转化成角度的乘法因子
   *
   * @static
   * @memberof JC.Utils
   * @type {number}
   */
  RTD: 180/Math.PI,

  /**
   * 判断变量是否为数组类型
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {Array} variable 待判断的变量
   * @return {Boolean} 判断的结果
   */
  isArray: (function() {
    let ks = _rt([]);
    return function(object) {
      return _rt(object) === ks;
    };
  })(),

  /**
   * 判断变量是否为对象类型
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {Object} variable 待判断的变量
   * @return {Boolean} 判断的结果
   */
  isObject: (function() {
    let ks = _rt({});
    return function(object) {
      return _rt(object) === ks;
    };
  })(),

  /**
   * 判断变量是否为字符串类型
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {String} variable 待判断的变量
   * @return {Boolean} 判断的结果
   */
  isString: (function() {
    let ks = _rt('s');
    return function(object) {
      return _rt(object) === ks;
    };
  })(),

  /**
   * 判断变量是否为数字类型
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {Number} variable 待判断的变量
   * @return {Boolean} 判断的结果
   */
  isNumber: (function() {
    let ks = _rt(1);
    return function(object) {
      return _rt(object) === ks;
    };
  })(),

  /**
   * 判断变量是否为函数类型
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {Function} variable 待判断的变量
   * @return {Boolean} 判断的结果
   */
  isFunction: (function() {
    let ks = _rt(function() {});
    return function(object) {
      return _rt(object) === ks;
    };
  })(),

  /**
   * 强化的随机数，可以随机产生给定区间内的数字、随机输出数字内的项
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {Array | Number} min 当只传入一个变量时变量应该为数字，否则为所给定区间较小的数字
   * @param {Number} max 所给定区间较大的数字
   * @return {ArrayItem | Number} 返回数组中大一项或者给定区间内的数字
   */
  random: function(min, max) {
    if (this.isArray(min))
      return min[~~(Math.random() * min.length)];
    if (!this.isNumber(max))
      max = min || 1, min = 0;
    return min + Math.random() * (max - min);
  },

  /**
   * 阿基米德求模
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {Number} n 索引
   * @param {Number} m 模
   * @return {Number} 映射到模长内到索引
   */
  euclideanModulo: function(n, m) {
    return ((n % m) + m) % m;
  },

  /**
   * 数字区间闭合，避免超出区间
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {Number} x 待闭合到值
   * @param {Number} a 闭合区间左边界
   * @param {Number} b 闭合区间右边界
   * @return {Number} 闭合后的值
   */
  clamp: function(x, a, b) {
    return (x < a) ? a : ((x > b) ? b : x);
  },

  /**
   * 线性插值
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {Number} x 输入的值
   * @param {Number} min 输入值的下区间
   * @param {Number} max 输入值的上区间
   * @return {Number} 返回的值在区间[0,1]内
   */
  linear: function( x, min, max ) {
    if ( x <= min ) return 0;
    if ( x >= max ) return 1;
    x = ( x - min ) / ( max - min );
    return x;
  },

  /**
   * 保留小数点
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {Number} num 输入的值
   * @param {Number} dot 输入值的下区间
   * @return {Number} 返回的值在区间[0,1]内
   */
  wrapDot: function( num, dot ) {
    const s = Math.pow(10, dot);
    return Math.round(num * s) / s;
  },

  /**
   * 过滤掉没有动画的层
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {object} layers 原始数据
   * @return {object} 符合标准的
   */
  passAL: function( layers ) {
    return layers
      .filter(layer => {
        let has = false;
        for (const k in layer.ks) {
          if (layer.ks[k].a === 1) {
            has = true;
            break;
          }
        }
        return has;
      })
      .map(layer => layer.nm);
  },

  /**
   * 获取图层的名字
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {string} nm layer的名字
   * @return {string} 获取到的名字
   */
  getName: function(nm) {
    const reg = /[\(\{\[\（](\w+[\w\d-_]+)[\）\]\}\)]/;
    if (reg.test(nm)) {
      return nm.match(reg)[1];
    }
    return nm;
  },

  /**
   * 进行简单排序
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {array} arr 数组
   * @return {array} 排序后的数组
   */
  sort: function (arr) {
    return arr.sort(function(a, b) {
      if (a > b) {
        return 1;
      }
      if (a < b) {
        return -1;
      }
      return 0;
    });
  },

  /**
   * 净化单位
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {array} num 数字
   * @param {string} unit 单位
   * @return {string} css属性值
   */
  passUnit: function (num, unit) {
    return num - 0 === 0 ? '0' : num + unit;
  },

  /**
   * 默认值检查
   *
   * @static
   * @method
   * @memberof JC.Utils
   * @param {array} key css的属性名
   * @param {string} k 值列表
   * @return {boolean} 是否默认值
   */
  isDefault: function(key, k) {
    let result = true;
    if (this.isNumber(k)) {
      return k === defaultValue[key];
    } else if (this.isArray(k)) {
      k.forEach(it => {
        if (it !== defaultValue[key]) result = false;
      });
    }
    return result;
  },
};
