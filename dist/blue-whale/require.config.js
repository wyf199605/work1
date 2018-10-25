function __setRequireBaseUrl(baseUrl, urlArg) { G.setRequire({ baseUrl: baseUrl, paths: {
    "BasicPage": "blue-whale/pages/basicPage.js?v=1539934001469",
    "PlanPage": "blue-whale/pages/PlanPage.js?v=1539943315656"
}, bundles: {
    "blue-whale/module/table.js?v=1539937688866": [
        "BwInventoryBtnFun",
        "BwMainTableModule",
        "BwSubTableModule",
        "BwTableModule",
        "newTableModule"
    ]
} }, urlArg); }