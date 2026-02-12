sap.ui.define([
    "sap/ui/test/opaQunit"
], function (opaTest) {
    "use strict";

    var Journey = {
        run: function() {
            QUnit.module("First journey");

            opaTest("Start application", function (Given, When, Then) {
                Given.iStartMyApp();

                Then.onTheZSCH_C_SA_ACTIVEList.iSeeThisPage();

            });


            opaTest("Navigate to ObjectPage", function (Given, When, Then) {
                // Note: this test will fail if the ListReport page doesn't show any data
                
                When.onTheZSCH_C_SA_ACTIVEList.onFilterBar().iExecuteSearch();
                
                Then.onTheZSCH_C_SA_ACTIVEList.onTable().iCheckRows();

                When.onTheZSCH_C_SA_ACTIVEList.onTable().iPressRow(0);
                Then.onTheZSCH_C_SA_ACTIVEObjectPage.iSeeThisPage();

            });

            opaTest("Teardown", function (Given, When, Then) { 
                // Cleanup
                Given.iTearDownMyApp();
            });
        }
    }

    return Journey;
});