sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("zdemerito.controller.MainView", {
        onInit() {
        },

        checkInputs: function () {
            const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            
            const materialInput = this.byId("meterialInput");
            const plantInput = this.byId("plantInput");
            const costCenterInput = this.byId("costCenterInput");

            const isMaterialInputValid = materialInput.getValue().trim() !== "";
            const isPlantInputValid = plantInput.getValue().trim() !== "";
            const isCostCenterInputValid = costCenterInput.getValue().trim() !== "";

            if (!isMaterialInputValid) {
                materialInput.setValueState("Error");
                materialInput.setValueStateText(oResourceBundle.getText("materialError"));
            }

            if (!isPlantInputValid) {
                plantInput.setValueState("Error");
                plantInput.setValueStateText(oResourceBundle.getText("plantError"));
            }

            if (!isCostCenterInputValid) {
                costCenterInput.setValueState("Error");
                costCenterInput.setValueStateText(oResourceBundle.getText("costCenterError"));
            }

            if (!isMaterialInputValid || !isPlantInputValid || !isCostCenterInputValid) {
                return false;
            }

            return true;
        },

        onInputChange: function (oEvent) {
            const oInput = oEvent.getSource();
            const sValue = oInput.getValue().trim();

            if (sValue !== "") {
                oInput.setValueState("None");
                oInput.setValueStateText("");
            }
        },

        onContinuePress: function (oEvent) {
            const oRouter = this.getOwnerComponent().getRouter();
            if (!this.checkInputs()) {
                return;
            }

            oRouter.navTo("DetailView");
        }
    });
});