const path = require('path');
const umm = require('@umm/scripts');

if (umm.libraries.info.development_install) {
  return;
}

umm.libraries.synchronize(
  path.join(umm.libraries.info.base_path, 'Assets', 'Modules', umm.libraries.info.module_name),
  path.join(umm.libraries.info.base_path, 'Assets'),
  [
    'Plugins/Android*',
    'Firebase/Editor/generate_xml_from_google_services_json*',
    'Editor Default Resources*',
  ],
  {
    overwrite: false,
    remove_source: true,
    remove_empty_source_directory: true,
  }
);

