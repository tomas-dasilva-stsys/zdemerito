sap.ui.define([
    "sap/ui/test/opaQunit"
], function (opaTest) {
    "use strict";

    var Journey = {
        run: function() {
            QUnit.module("First journey");

            opaTest("Start application", function (Given, When, Then) {
                Given.iStartMyApp();

                Then.onTheZOTC_C_ROOT_SALES_VOLUMEList.iSeeThisPage();

            });


            opaTest("Navigate to ObjectPage", function (Given, When, Then) {
                // Note: this test will fail if the ListReport page doesn't show any data
                
                When.onTheZOTC_C_ROOT_SALES_VOLUMEList.onFilterBar().iExecuteSearch();
                
                Then.onTheZOTC_C_ROOT_SALES_VOLUMEList.onTable().iCheckRows();

                When.onTheZOTC_C_ROOT_SALES_VOLUMEList.onTable().iPressRow(0);
                Then.onTheZOTC_C_ROOT_SALES_VOLUMEObjectPage.iSeeThisPage();

            });

            opaTest("Teardown", function (Given, When, Then) { 
                // Cleanup
                Given.iTearDownMyApp();
            });
        }
    }

    return Journey;
});