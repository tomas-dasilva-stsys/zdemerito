sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'horse.salesvolrep',
            componentId: 'ZOTC_C_ROOT_SALES_VOLUMEList',
            contextPath: '/ZOTC_C_ROOT_SALES_VOLUME'
        },
        CustomPageDefinitions
    );
});