# Sets default AWS profile for `hugo deploy` commands;
export AWS_PROFILE=zalla-io-s3-manager

# Copies `normalize.css` into `./static` directory
mkdir -p ./static/css/vendor/normalize-css
cp ./node_modules/normalize-css/normalize.css ./static/css/vendor/normalize-css/
