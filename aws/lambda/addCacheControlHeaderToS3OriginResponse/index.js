'use strict';

const mime = require('mime-types');

const MIN_CACHE_TTL = 24 * 60 * 60;
const DEFAULT_CONTENT_TYPE = 'application/octet-stream';
const blacklistContentTypes = [DEFAULT_CONTENT_TYPE];

function shouldFixContentTypeFromS3(
    headers)
{

    if('Content-Type' in headers)
    {
        let responseContentType = headers['content-type'][0].value.toLowerCase();

        if(blacklistContentTypes.includes(responseContentType))
        {
            return true;
        }
    }

    return false;

}

exports.handler = (event, context, callback) => {

    const request = event.request;
    const response = event.Records[0].cf.response;
    const headers = response.headers;

    if('server' in headers && headers.server[0].value === 'AmazonS3')
    {

        if(shouldFixContentTypeFromS3(headers))
        {
            console.log(`Missing or incorrect MIME-type for resource URI: ${request.uri}`);

            let mimetype = DEFAULT_CONTENT_TYPE;

            try
            {
                mimetype = mime.contentType(mime.lookup(request.uri)) || DEFAULT_CONTENT_TYPE;

                console.log(`Guessed mimemtype of resource URI: ${request.uri}: ${mimetype}`);
            }
            catch(e)
            {
                console.log(`Error while guessing mimetype of resource URI: ${request.uri}`);
            }
            finally
            {
                headers['content-type'] = mimetype;
                headers['Content-Type'] = mimetype;
            }
        }

        if(
            'etag' in headers &&
            !('Cache-Control' in headers) &&
            !('cache-control' in headers)
        )
        {
            const contentControl = `public, max-age=${MIN_CACHE_TTL}`;
            headers['cache-control'] = contentControl;
            headers['Cache-Control'] = contentControl;
            console.log(`Set missing cache-control to ${contentControl}.`, contentControl);
        }

    }

   callback(null, response);

};
