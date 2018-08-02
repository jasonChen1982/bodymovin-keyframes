#!/usr/bin/env node
'use strict';

const pkg = require('../package.json');
const yargs = require('yargs');

yargs
.commandDir('cmds')
.demandCommand()
.version(() => pkg.version)
.help('h')
.alias('h', 'help')
.wrap(80)
.argv;
