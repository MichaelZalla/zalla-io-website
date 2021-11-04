# Sets default AWS profile for `hugo deploy` commands;
export AWS_PROFILE=zalla-io-s3-manager

# Generates light and dark-theme styles for (code) syntax highlighting
hugo gen chromastyles --style=monokai > ./static/css/monokai-dark.css
hugo gen chromastyles --style=monokailight > ./static/css/monokai-light.css
