const path = require("path");

module.exports = {
	entry: {
		content: "./src/content.js",
		background: "./src/background.js"
	},
	output: {
		path: path.resolve(__dirname, "addon"),
		filename: "[name].js"
	},

	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: [ "@babel/preset-env" ]
				}
			},
		]
	},
	
	resolve: {
		extensions: [ '.js', ".json" ]
	}
};
