sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'horse/salesvolrep/test/integration/FirstJourney',
		'horse/salesvolrep/test/integration/pages/ZOTC_C_ROOT_SALES_VOLUMEList',
		'horse/salesvolrep/test/integration/pages/ZOTC_C_ROOT_SALES_VOLUMEObjectPage'
    ],
    function(JourneyRunner, opaJourney, ZOTC_C_ROOT_SALES_VOLUMEList, ZOTC_C_ROOT_SALES_VOLUMEObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('horse/salesvolrep') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheZOTC_C_ROOT_SALES_VOLUMEList: ZOTC_C_ROOT_SALES_VOLUMEList,
					onTheZOTC_C_ROOT_SALES_VOLUMEObjectPage: ZOTC_C_ROOT_SALES_VOLUMEObjectPage
                }
            },
            opaJourney.run
        );
    }
);