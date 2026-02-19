sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, Filter, FilterOperator) => {
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

        onContinuePress: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            const sBusy = oResourceBundle.getText("busyText");
            const oModel = this.getView().getModel();

            if (!this.checkInputs()) {
                return;
            }

            const sMaterial = this.byId("meterialInput").getValue().trim();
            const sPlant = this.byId("plantInput").getValue().trim();
            const sSerialNumber = this.byId("serialNumberInput").getValue().trim();
            const sCostCenter = this.byId("costCenterInput").getValue().trim();

            const busyDialog = (sap.ui.getCore().byId("busy4")) ? sap.ui.getCore().byId("busy4") : new sap.m.BusyDialog('busy4', {
                title: sBusy
            });

            busyDialog.open();
            // Cambiar por la llamada real al backend
            // oModel.read("/validateData", {
            //     filters: [
            //         new Filter("material", FilterOperator.EQ, sMaterial),
            //         new Filter("plant", FilterOperator.EQ, sPlant),
            //         new Filter("costcenter", FilterOperator.EQ, sCostCenter)
            //     ],
            //     success: (_) => {
            //         busyDialog.close();

            //         oRouter.navTo("DetailView", {
            //             query: {
            //                 material: sMaterial,
            //                 serialNumber: sSerialNumber,
            //                 plant: sPlant,
            //                 costCenter: sCostCenter
            //             }
            //         });
            //     },
            //     error: (oError) => {
            //         busyDialog.close();

            //         // Manejo de errores, por ejemplo, mostrar un mensaje al usuario
            //         MessageBox.error(oError.message || "Error al validar los datos");
            //     }
            // })

            setTimeout(() => {
                busyDialog.close();

                oRouter.navTo("DetailView", {
                    query: {
                        material: sMaterial,
                        serialNumber: sSerialNumber,
                        plant: sPlant,
                        costCenter: sCostCenter
                    }
                });
            }, 1000);
        }
    });
});