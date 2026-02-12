sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'horse/zdomtest/test/integration/FirstJourney',
		'horse/zdomtest/test/integration/pages/SingletonIDList',
		'horse/zdomtest/test/integration/pages/SingletonIDObjectPage',
		'horse/zdomtest/test/integration/pages/InterchangableObjectPage'
    ],
    function(JourneyRunner, opaJourney, SingletonIDList, SingletonIDObjectPage, InterchangableObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('horse/zdomtest') + '/index.html'
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