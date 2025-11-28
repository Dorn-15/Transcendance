const path = require('path');

module.exports = {
  entry: './src/main.ts', // Ton point d'entrée (on va le créer)
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js', // Le fichier final
    path: path.resolve(__dirname, 'public'), // Destination
  },
  mode: 'development', // Passe en 'production' pour le rendu final
};