sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'scm',
            componentId: 'ZSCH_C_SA_ACTIVEList',
            contextPath: '/ZSCH_C_SA_ACTIVE'
        },
        CustomPageDefinitions
    );
});