function isNotValid(objType) {
	return objType == 'undefined' || objType == 'null';
}

if(isNotValid(typeof global.require)) {

	const insertLine = require('insert-line');
	const process = require('process');
	const Module = require('module');
	const separator = require('path').sep;
	const fs = require('fs');
	const moduleCache = Module._cache;
	const PLUGIN_DIR = process.env['INSO_EXTRA_PLUGINS_PATH'];
	const PATH_TO_MODULE = `${process.cwd()}${separator}node_modules${separator}insomnia-inso`;
	const FILE_LINE = 119;
	const EXTERNAL_PLUGIN = "::external::";
	const argv = process.argv;
	let hasCiFlag = false;
	argv.forEach(function(arg) {
		hasCiFlag = hasCiFlag || arg == '--ci';
	});
	hasCiFlag = hasCiFlag || process.env['insomnia-plugin-inso-plugin-support-debug'] == 'true';
	if(!hasCiFlag) {
		console.log('use only with --ci or environment var insomnia-plugin-inso-plugin-support-debug=true');
		process.exit(1);
	}


	function getAllPlugins(path) {
		return fs.readdirSync(path).filter(function(file) {
			let normalized = fs.statSync(`${path}/${file}`);
			return normalized.isDirectory() && file.indexOf('insomnia-plugin') == 0;
		});
	}
	const allPlugins = `,"${getAllPlugins(PLUGIN_DIR).join(EXTERNAL_PLUGIN + '","')}${EXTERNAL_PLUGIN}"`;
	Module.prototype.originalRequire = Module.prototype.require;
	Module.prototype.require = function(name) {
		let ret = null;
		if(name == 'insomnia-send-response') {
			insertLine(
				`${PATH_TO_MODULE}${separator}node_modules${separator}${name}${separator}dist${separator}index.js`
			).contentSync(allPlugins).at(FILE_LINE);
		}
		ret = this.originalRequire(name);
		if(name == 'insomnia-inso') {
			const obtainedModule = moduleCache[`${PATH_TO_MODULE}${separator}dist${separator}index.js`];
			global.require = function(name) {
				if(name.indexOf(EXTERNAL_PLUGIN) > -1) {
					name = PLUGIN_DIR + separator + name.split(EXTERNAL_PLUGIN).join('');
				}
				return Module.prototype.require.apply(obtainedModule, [name]);
			};
		}
		return ret;
	};

	require('insomnia-inso').go();
} else {
	function createConfigGUI() {
		function createElem(elemType) {
			return global.document.createElement(elemType);
		}
		let div = createElem('div');
		let span1 = createElem('span');
		span1.innerHTML = 'Please note this package is not actually a insomnia plugin.';
		div.appendChild(span1);
		div.appendChild(createElem('br'));
		let anchor = createElem('a');
		anchor.href = 'javascript://';
		
		anchor.addEventListener('click', function(e) {
			global.location.href = 'https://github.com/pedro-arruda-moreira/insomnia-plugin-inso-plugin-support';
		});
		anchor.innerHTML = 'Check the GitHub repository';
		div.appendChild(anchor);
		let span2 = createElem('span');
		span2.innerHTML = '&nbsp;for more details.';
		div.appendChild(span2);
		return div;
	}
	module.exports.workspaceActions = [{
		label: 'insomnia-plugin-inso-plugin-support information',
		icon: 'fa-info-circle',
		action: async (context, models) => {
			context.app.dialog(
				'insomnia-plugin-inso-plugin-support information',
				createConfigGUI(),
				{
					tall: false,
					wide: false,
					skinny: true
				}
			);
		},
	}];
}