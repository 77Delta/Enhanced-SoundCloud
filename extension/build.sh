set -e
rm -rf dist && mkdir -p dist
for target in chrome firefox; do
  mkdir -p dist/$target/icons
  cp src/*.js dist/$target/
  cp icons/*.png dist/$target/icons/
  cp manifests/$target.json dist/$target/manifest.json
  (cd dist/$target && zip -qr ../$target.zip .)
done
