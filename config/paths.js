
module.exports = {
	getPath: __getPath,

	getConfig: __getPath.bind(null, 'config'),
	getData: __getPath.bind(null, 'data'),
	getService: __getPath.bind(null, 'services'),
	// getModule: __getPath.bind(null, 'node_modules'),
	getPublic: __getPath.bind(null, 'public'),
	getRoute: __getPath.bind(null, 'routes'),
	getView: __getPath.bind(null, 'views'),
};

function __getPath(pathRoot, partialPath) {
	partialPath = partialPath || '';
	return require('path').join(process.cwd(), pathRoot, partialPath);
}
