sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'horse/zdominterchangeability/test/integration/FirstJourney',
		'horse/zdominterchangeability/test/integration/pages/SingletonIDList',
		'horse/zdominterchangeability/test/integration/pages/SingletonIDObjectPage',
		'horse/zdominterchangeability/test/integration/pages/InterchangableObjectPage'
    ],
    function(JourneyRunner, opaJourney, SingletonIDList, SingletonIDObjectPage, InterchangableObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('horse/zdominterchangeability') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheSingletonIDList: SingletonIDList,
					onTheSingletonIDObjectPage: SingletonIDObjectPage,
					onTheInterchangableObjectPage: InterchangableObjectPage
                }
            },
            opaJourney.run
        );
    }
);