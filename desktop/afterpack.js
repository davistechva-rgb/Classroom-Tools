// Puts the icon and version details into ClassroomTools.exe (no Wine needed).
const fs = require('fs'), path = require('path'), ResEdit = require('resedit');
exports.default = async ctx => {
  if (ctx.electronPlatformName !== 'win32') return;
  const exe = path.join(ctx.appOutDir, `${ctx.packager.appInfo.productFilename}.exe`);
  const v = ctx.packager.appInfo.version, parts = v.split('.').map(Number);
  const pe = ResEdit.NtExecutable.from(fs.readFileSync(exe), { ignoreCert: true });
  const res = ResEdit.NtExecutableResource.from(pe);
  const ico = ResEdit.Data.IconFile.from(fs.readFileSync(path.join(__dirname, 'build', 'icon.ico')));
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, 1, 1033, ico.icons.map(i => i.data));
  const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];
  vi.setFileVersion(...parts, 0); vi.setProductVersion(...parts, 0);
  vi.setStringValues({ lang: 1033, codepage: 1200 }, { FileDescription: 'Classroom Tools', ProductName: 'Classroom Tools', CompanyName: 'Davis Tech Support', LegalCopyright: '© Davis Tech Support', OriginalFilename: 'Classroom Tools.exe' });
  vi.outputToResourceEntries(res.entries);
  res.outputResource(pe);
  fs.writeFileSync(exe, Buffer.from(pe.generate()));
  console.log('  • set icon and version info on', path.basename(exe));
};
