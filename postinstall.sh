# Auto-installs global package CLIs
npm i -g postcss-cli
npm install -g autoprefixer

# Sets default AWS profile for `hugo deploy` commands;
export AWS_PROFILE=zalla-io-s3-manager

# Generates light and dark-theme styles for (code) syntax highlighting
mkdir -p ./static/css
hugo gen chromastyles --style=monokai > ./static/css/monokai-dark.css
hugo gen chromastyles --style=monokailight > ./static/css/monokai-light.css
