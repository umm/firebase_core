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
    sync(
      path.resolve(script_directory, (has_scope ? '../' : '') + '../../../Assets/Modules/' + package_name + '/Firebase/Editor/'),
      path.resolve(script_directory, (has_scope ? '../' : '') + '../../../Assets/Firebase/Editor/'),
      { remove_source: true },
      function(err) {
        if (err) {
          console.log(err);
          process.exit(1);
        }
      }
    );
    sync(
      path.resolve(script_directory, (has_scope ? '../' : '') + '../../../Assets/Modules/' + package_name + '/Firebase/Editor.meta'),
      path.resolve(script_directory, (has_scope ? '../' : '') + '../../../Assets/Firebase/Editor.meta'),
      { remove_source: true },
      function(err) {
        if (err) {
          console.log(err);
          process.exit(1);
        }
      }
    );
    sync(
      path.resolve(script_directory, (has_scope ? '../' : '') + '../../../Assets/Modules/' + package_name + '/Editor Default Resources/Firebase/'),
      path.resolve(script_directory, (has_scope ? '../' : '') + '../../../Assets/Editor Default Resources/Firebase/'),
      { remove_source: true },
      function(err) {
        if (err) {
          console.log(err);
          process.exit(1);
        }
      }
    );
    sync(
      path.resolve(script_directory, (has_scope ? '../' : '') + '../../../Assets/Modules/' + package_name + '/Editor Default Resources/Firebase.meta'),
      path.resolve(script_directory, (has_scope ? '../' : '') + '../../../Assets/Editor Default Resources/Firebase.meta'),
      { remove_source: true },
      function(err) {
        if (err) {
          console.log(err);
          process.exit(1);
        }
      }
    );
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
