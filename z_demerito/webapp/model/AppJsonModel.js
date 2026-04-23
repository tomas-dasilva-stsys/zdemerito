sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "zdemerito/utils/FioriComponent"
], function (JSONModel, FioriComponent) {
    "use strict";

    return {
        getModel: function () {
            //gets component
            var component = FioriComponent.getComponent();
            //gets model
            var jsonModel = component.byId("App").getModel("AppJsonModel");
            //checks if the model exists
            if (!jsonModel) {
                jsonModel = new JSONModel();
                component.byId("App").setModel(jsonModel, "AppJsonModel");
            }
            return jsonModel;
        },

        initializeModel: function () {
            let jsonModel = this.getModel();

            jsonModel.setData({
                "DemeritData": {
                    "Material": "",
                    "SerialNumber": "",
                    "Plant": "",
                    "Storage": "",
                    "CostCenter": "",
                },
                "Plant": [{
                    "label": "{i18n>plantLabel}",
                    "template": "werks"
                }, {
                    "label": "{i18n>name}",
                    "template": "name1"
                }
                ],
                "Storage": [
                    {
                        "label": "{i18n>storageLabel}",
                        "template": "lgort"
                    },
                    {
                        "label": "{i18n>plantLabel}",
                        "template": "werks"
                    }
                ],
                "Material": [
                    {
                        "label": "{i18n>materialLabel}",
                        "template": "matnr"
                    },
                    {
                        "label": "{i18n>descriptionLabel}",
                        "template": "maktx"
                    },
                ],
                "CostCenter": [
                    // {
                    //     "label": "{i18n>codeLabel}",
                    //     "template": "kokrs"
                    // },
                    {
                        "label": "{i18n>costCenterLabel}",
                        "template": "Costcenter"
                    },
                    {
                        "label": "{i18n>descriptionLabel}",
                        "template": "ktext"
                    },
                ],
                "SerialNumber": [{
                    "label": "{i18n>serialNumber}",
                    "template": "SerialNumber"
                }, {
                    "label": "{i18n>productionOrder}",
                    "template": "ProductionOrder"
                }],
                "WorkCenters": [],
                "Equipments": [],
                "TableData": [{}],
                "Descripcion": {},
                "Enabled": {
                },
                "Editable": {
                },
            });

            return jsonModel;
        },

        setProperty: function (sPropery, value) {
            this.getModel().setProperty(sPropery, value);
            this.updateModel();
        },

        setInnerProperty: function (sProperty, innerProp, value) {
            let mainProp = this.getProperty(sProperty);

            mainProp[innerProp] = value;
            this.updateModel();
        },

        getProperty: function (sPropery) {
            return this.getModel().getProperty(sPropery);
        },

        updateModel: function () {
            this.getModel().updateBindings(true);
        }

    };
});