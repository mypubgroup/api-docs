const fs = require('fs-extra');

const src = './src';
const dist = './dist';

const dirs = {
  assets: `${dist}/assets`,
  css: `${dist}/css`,
  js: `${dist}/js`,
};

const files = {
  stoplightJs: {
    from: './node_modules/@stoplight/elements/web-components.min.js',
    to: `${dirs.js}/site.js`,
  },
  stoplightCss: {
    from: './node_modules/@stoplight/elements/styles.min.css',
    to: `${dirs.css}/site.css`,
  },
  customCss: {
    from: './assets/custom.css',
    to: `${dirs.css}/custom.css`,
  },
  spec: {
    from: './openapi.json',
    to: `${dist}/openapi.json`,
  },
};

function build() {
  fs.emptyDirSync(dist);
  fs.copySync(src, dist);
  fs.copySync('./assets', dirs.assets);

  Object.values(dirs).forEach((dir) => {
    fs.ensureDirSync(dir);
  });

  Object.values(files).forEach(({ from, to }) => {
    fs.copySync(from, to);
  });

  fs.copyFileSync(`${src}/index.html`, `${dist}/404.html`);
  fs.ensureFileSync(`${dist}/.nojekyll`);
}

if (require.main === module) {
  build();
  console.log('Build complete.');
}

module.exports = {
  build,
  dirs,
  files,
};
