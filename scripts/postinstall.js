var mkdirp = require('mkdirp');
var path = require('path');
var package = require('../package.json');
var ncp = require('ncp').ncp;
var rimraf = require('rimraf');

var script_directory = __dirname;
// パッケージ名が @ で始まるならスコープ有りと見なす
var has_scope = /^@/.test(package.name);

if ('node_modules' != path.basename(path.resolve(script_directory, (has_scope ? '../' : '') + '../../'))) {
  // 開発インストールの場合無視する
  return;
}

// パッケージ名を決定
//   (ネームスペースを持つ場合、そのまま namespace + @ をプレフィックスにする)
var package_name = '';
if (/^@/.test(package.name)) {
  package_name = package.name.replace(
    /^@([^\/]+)\/(.*)$/,
    function(match, namespace, name) {
      return namespace + '@' + name;
    }
  );
} else {
  package_name = package.name;
}

// umm インストール後に移動させるファイル群
var move_items = [
  '/Plugins/Android/Firebase/AndroidManifest.xml',
  '/Plugins/Android/Firebase/AndroidManifest.xml.meta',
  '/Plugins/Android/Firebase/project.properties',
  '/Plugins/Android/Firebase/project.properties.meta',
  '/Firebase/Editor/generate_xml_from_google_services_json.exe',
  '/Firebase/Editor/generate_xml_from_google_services_json.exe.meta',
  '/Firebase/Editor/generate_xml_from_google_services_json.py',
  '/Firebase/Editor/generate_xml_from_google_services_json.py.meta',
  '/Editor Default Resources/Firebase/',
  '/Editor Default Resources/Firebase.meta',
];

// スクリプトの存在するディレクトリから見たパス
sync(
  path.resolve(script_directory, '../Assets/'),
  path.resolve(script_directory, (has_scope ? '../' : '') + '../../../Assets/Modules/' + package_name + '/'),
  {},
  function(err) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    move_items.forEach(
      function(move_item) {
        sync(
          path.resolve(script_directory, (has_scope ? '../' : '') + '../../../Assets/Modules/' + package_name + move_item),
          path.resolve(script_directory, (has_scope ? '../' : '') + '../../../Assets' + move_item),
          { remove_source: true },
          function(err) {
            if (err) {
              console.log(err);
              process.exit(1);
            }
          }
        );
      }
    )
  }
);

function sync(source, destination, options, callback) {
  // 宛先ディレクトリを作る (mkdir -p)
  mkdirp(
    /\/$/.test(destination) ? destination : path.dirname(destination),
    function(err) {
      if (err) {
        callback(err);
      }
      // 再帰的にコピーする
      ncp(
        source,
        destination,
        function(err) {
          if (err) {
            callback(err);
          }
          // 元ディレクトリを削除する
          if (options && options.remove_source) {
            rimraf(
              source,
              function(err) {
                callback(err);
              }
            );
          } else {
            callback();
          }
        }
      );
    }
  );
};
