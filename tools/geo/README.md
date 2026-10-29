# geo.js builder

Rebuilds `geo.js` (offline world and US map data used by the Geo & history tools).

```
cd tools/geo
npm install
node build.mjs
cp geo.js ../../geo.js
```

Map data: Natural Earth via world-atlas and us-atlas (public domain). Country names and capitals: countries-list and i18n-iso-countries (MIT). Flags in img/flags come from flag-icons (MIT).
