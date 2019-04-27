#!/bin/bash
# Small script to properly link all dependencies in a dev environment.
root=$PWD

function linkPackage {
  if [ ! -z "$2" ]; then
    dir="$PWD/../../packages/"
    sub="$(echo $2 | sed "s/cubic-//g")"
    mkdir -p "$1/node_modules"
    echo "$2 -> $dir$sub"
    ln -s "$dir$sub" "$1/node_modules/$2" 2>/dev/null
  fi
}
export -f linkPackage # make accessible with xargs

# Auto-generate based on peer dependencies
for package in `find $root/packages -maxdepth 1 -mindepth 1 -type d`; do
  cd "$package"
  node --eval "Object.keys(require('./package.json').peerDependencies || {}).forEach(p => console.log(p))" | xargs -L1 bash -c 'linkPackage $1 $2' "$1" "$package"
done

# Webpack will also look for cubic-ui and its dependencies inside the root
# node_modules
echo "cubic-ui, cubic-api, cubic-auth, cubic-client -> /node_modules/cubic-client"
ln -s "$root/packages/ui" "$root/node_modules/cubic-ui" 2>/dev/null
ln -s "$root/packages/api" "$root/node_modules/cubic-api" 2>/dev/null
ln -s "$root/packages/auth" "$root/node_modules/cubic-auth" 2>/dev/null
ln -s "$root/packages/client" "$root/node_modules/cubic-client" 2>/dev/null

for package in `find $root/packages/ui/node_modules -maxdepth 1 -mindepth 1 -type d`; do
  ln -s "$package" "$root/node_modules/" 2>/dev/null
done

exit 0
