'use strict';

const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const cwd = process.cwd();
const cssParser = require('../actions/css/cssParser');
const Util = require('../lib/util');

const tips = `请选择你需要导出的动画名字
${chalk.yellow('space 键')}：选择／取消
${chalk.yellow('a or i键')}：全选／反选
`;

exports.command = 'css';
exports.desc = '将AE导出的数据解析成相应的CSS3的keyframes';
exports.builder = yargs => {
  return yargs
  .option('path', {
    alias: 'p',
    describe: '数据目录, data.json所在的目录',
    default: './animations/data.json',
  })
  .option('layout', {
    alias: 'l',
    describe: '是否开启智能布局',
    default: true,
  })
  .option('rem', {
    alias: 'r',
    describe: '是否将像素单位转化成rem',
    default: false,
  })
  .option('fontsize', {
    alias: 'f',
    describe: '设置rem的根数值，px 转 rem 的比例',
    default: 1000,
  })
  .boolean([
    'layout',
    'rem',
  ]);
};
exports.handler = function(argv) {
  const filePath = path.resolve(cwd, argv.path);
  const data = require(filePath);
  const choices = Util.passAL(data.layers);
  inquirer.prompt({
    name: 'animations',
    type: 'checkbox',
    message: tips,
    choices,
  }).then(({ animations }) => {
    console.log(chalk.red('start parser...'));
    cssParser(data, animations, argv).then(() => {
      console.log(chalk.red('  end parser...'));
    })
    .catch(err => {
      console.log(err);
    });
  });
};
