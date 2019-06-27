function __setRequireBaseUrl(baseUrl, urlArg) {
    debugger;
    G.setRequire({ 
        baseUrl: baseUrl,
        paths: {},
        bundles: {}
    }, urlArg);
}