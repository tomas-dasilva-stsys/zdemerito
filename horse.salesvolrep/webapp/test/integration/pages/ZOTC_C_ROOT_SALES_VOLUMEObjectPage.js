sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'horse.salesvolrep',
            componentId: 'ZOTC_C_ROOT_SALES_VOLUMEObjectPage',
            contextPath: '/ZOTC_C_ROOT_SALES_VOLUME'
        },
        CustomPageDefinitions
    );
});