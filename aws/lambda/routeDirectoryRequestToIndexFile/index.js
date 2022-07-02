'use strict';

exports.handler = (event, context, callback) => {

    // Extract the request from the CloudFront event that is sent to Lambda@Edge
    const request = event.Records[0].cf.request;

    // Extract the URI from the request
    const oldUri = request.uri;

    // Match any '/' that occurs at the end of a URI. Replace it with a default index
    const newUri = oldUri.replace(/\/$/, '\/index.html');

    // Replace the received URI with the URI that includes the index page
    request.uri = newUri;

    // Return to CloudFront
    return callback(null, request);

};
