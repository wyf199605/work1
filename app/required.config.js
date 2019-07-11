function __setRequireBaseUrl(baseUrl, urlArg) {
    G.setRequire({ 
        baseUrl: baseUrl,
        paths: {},
        bundles: {}
    }, urlArg);
}