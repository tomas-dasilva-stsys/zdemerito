sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'scm',
            componentId: 'ZSCH_C_SA_ACTIVEObjectPage',
            contextPath: '/ZSCH_C_SA_ACTIVE'
        },
        CustomPageDefinitions
    );
});