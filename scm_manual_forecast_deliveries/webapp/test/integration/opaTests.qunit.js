sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'scm/test/integration/FirstJourney',
		'scm/test/integration/pages/ZSCH_C_SA_ACTIVEList',
		'scm/test/integration/pages/ZSCH_C_SA_ACTIVEObjectPage'
    ],
    function(JourneyRunner, opaJourney, ZSCH_C_SA_ACTIVEList, ZSCH_C_SA_ACTIVEObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('scm') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheZSCH_C_SA_ACTIVEList: ZSCH_C_SA_ACTIVEList,
					onTheZSCH_C_SA_ACTIVEObjectPage: ZSCH_C_SA_ACTIVEObjectPage
                }
            },
            opaJourney.run
        );
    }
);