sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/base/Log",
    "zdemerito/model/AppJsonModel",
    "sap/ui/model/json/JSONModel",
    "zdemerito/services/MatchCodeService",
    "zdemerito/services/ListMaterialService",
], (Controller,
    Filter,
    FilterOperator,
    Fragment,
    MessageBox,
    Log,
    AppJsonModel,
    JSONModel,
    MatchCodeService,
    ListMaterialService) => {
    "use strict";
    let inputId;

    return Controller.extend("zdemerito.controller.MainView", {
        onInit() {
            AppJsonModel.initializeModel();
            this.oFragments = {}; // Map para cachear fragments
        },

        getFragment: function (sFragmentName) {
            if (!this.oFragments) {
                this.oFragments = {};
            }

            if (this.oFragments[sFragmentName]) {
                return Promise.resolve(this.oFragments[sFragmentName]);
            }

            return Fragment.load({
                id: this.getView().getId(),
                name: `zdemerito.view.fragments.${sFragmentName}`,
                controller: this
            }).then((oFragment) => {
                const oControl = Array.isArray(oFragment) ? oFragment[0] : oFragment;
                this.oFragments[sFragmentName] = oControl;
                this.getView().addDependent(oControl);
                return oControl;
            }).catch((oError) => {
                Log.error(`Error al cargar el fragment: ${sFragmentName}`, oError);
                return Promise.reject(oError);
            });
        },

        _closeValueHelpDialog: function (_oEvent) {
            this.getFragment(`${inputId}HelpDialog`).then(function (oFragment) {
                oFragment.close();
            });
        },

        destroyFragments: function () {
            if (this.oFragments) {
                Object.keys(this.oFragments).forEach(function (sKey) {
                    this.oFragments[sKey].destroy();
                    delete this.oFragments[sKey];
                }, this);
            }
        },

        checkInputs: function () {
            const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            const materialInput = this.byId("Material");
            const plantInput = this.byId("Plant");
            const storageInput = this.byId("Storage");
            const costCenterInput = this.byId("CostCenter");

            const isMaterialInputValid = materialInput.getValue().trim() !== "";
            const isPlantInputValid = plantInput.getValue().trim() !== "";
            const isStorageInputValid = storageInput.getValue().trim() !== "";
            const isCostCenterInputValid = costCenterInput.getValue().trim() !== "";

            if (!isMaterialInputValid) {
                materialInput.setValueState("Error");
                materialInput.setValueStateText(oResourceBundle.getText("materialError"));
            }

            if (!isPlantInputValid) {
                plantInput.setValueState("Error");
                plantInput.setValueStateText(oResourceBundle.getText("plantError"));
            }

            if (!isStorageInputValid) {
                storageInput.setValueState("Error");
                storageInput.setValueStateText(oResourceBundle.getText("storageError"));
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
            const oSVM = this.byId("idSmartVariantMgmt");

            if (sValue !== "") {
                oInput.setValueState("None");
                oInput.setValueStateText("");
                oSVM.currentVariantSetModified(true);
            }

            if (sValue === "") {
                oSVM.currentVariantSetModified(false);
            }
        },

        getMatchCodePath: function (sInputId) {
            const matchCodeMap = {
                "Material": "/MatchMaterial",
                "Plant": "/MatchWorkCenter",
                "Storage": "/MatchStorageLocation",
                "CostCenter": "/MatchCostCenter"
            };
            return matchCodeMap[sInputId] || "";
        },

        setStorageMatchchodeFilters: function () {
            let aFilters;

            const plant = AppJsonModel.getProperty('/DemeritData/Plant');

            if (plant) {
                aFilters = [new Filter("werks", FilterOperator.EQ, plant)];
            } else {
                aFilters = [];
            }

            return aFilters;
        },

        onInputValueHelpRequest: function (oEvent) {
            const currInputId = oEvent.getSource().getId().split('-').pop()
            const currMatchCodePath = this.getMatchCodePath(currInputId);
            let aFilters;
            inputId = currInputId;

            if (inputId === 'Storage') {
                aFilters = this.setStorageMatchchodeFilters();
            }

            // Lógica para mostrar el value help dependiendo del input
            this.getFragment(`${currInputId}HelpDialog`).then((oFragment) => {
                if (oFragment._initialized) {
                    oFragment.open();
                    return;
                }

                oFragment.getTableAsync().then((oTable) => {
                    oTable.setModel(MatchCodeService.getOdataModel());

                    let tableCols = AppJsonModel.getProperty(`/${currInputId}`)
                    let currentJsonModel = new JSONModel({
                        "cols": tableCols
                    })

                    oTable.setModel(currentJsonModel, "columns");
                    if (oTable.bindRows) {
                        oTable.bindAggregation("rows", {
                            path: currMatchCodePath,
                            filters: aFilters,
                            showHeader: false
                        });
                    }

                    oFragment.update();
                    if (inputId !== 'Storage') {
                        oFragment._initialized = true; // marcar como listo
                    }
                    oFragment.open();

                }).catch((oError) => {
                    MessageBox.error(oError.message || "Error al cargar la tabla del value help");
                });

                // oFragment.open();
            }).catch((oError) => {
                MessageBox.error(oError.message || "Error al cargar el value help");
            });
        },

        onValueHelpOkPress: function (oEvent) {
            const currToken = oEvent.getParameter("tokens")[0].getCustomData()[0];
            const oSMV = this.byId("idSmartVariantMgmt");

            if (inputId === 'Material') {
                AppJsonModel.setInnerProperty('/DemeritData', 'Material', currToken.getValue().matnr);
                this.byId(inputId).setValueState("None");
                this.byId(inputId).setValueStateText("");
            }

            if (inputId === 'Plant') {
                AppJsonModel.setInnerProperty('/DemeritData', 'Plant', currToken.getValue().werks);
                this.byId(inputId).setValueState("None");
                this.byId(inputId).setValueStateText("");
            }

            if (inputId === 'Storage') {
                AppJsonModel.setInnerProperty('/DemeritData', 'Storage', currToken.getValue().lgort);
                this.byId(inputId).setValueState("None");
                this.byId(inputId).setValueStateText("");
            }

            if (inputId === 'CostCenter') {
                AppJsonModel.setInnerProperty('/DemeritData', 'CostCenter', currToken.getValue().Costcenter);
                this.byId(inputId).setValueState("None");
                this.byId(inputId).setValueStateText("");
            }

            this._closeValueHelpDialog(oEvent);
            oSMV.currentVariantSetModified(true);
        },

        onValueHelpSearch: function (oEvent) {
            const oSource = oEvent.getSource();

            // Navegar hasta el ValueHelpDialog sin importar quién disparó el evento
            let oDialog = oSource;
            while (oDialog && !oDialog.isA("sap.ui.comp.valuehelpdialog.ValueHelpDialog")) {
                oDialog = oDialog.getParent();
            }

            if (!oDialog) {
                Log.error("No se encontró el ValueHelpDialog");
                return;
            }

            this._applyValueHelpFilters(oDialog);
        },

        _applyValueHelpFilters: function (oDialog) {
            // Obtener el FilterBar del dialog dinámicamente
            const oFilterBar = oDialog.getContent().find(
                (oControl) => oControl.isA("sap.ui.comp.filterbar.FilterBar")
            ) || oDialog.getFilterBar?.();

            // Recorrer TODOS los FilterGroupItems dinámicamente
            const aFilters = oFilterBar.getFilterGroupItems().reduce((aAcc, oItem) => {
                const oControl = oItem.getControl();
                const sValue = oControl.getValue?.();
                const sField = oItem.getName(); // "matnr", "maktx", etc.

                if (sValue) {
                    aAcc.push(this._buildFilter(sField, sValue));
                }
                return aAcc;
            }, []);

            oDialog.getTableAsync().then((oTable) => {
                const sAggregation = oTable.isA("sap.ui.table.Table") ? "rows" : "items";

                const fnApplyFilter = () => {
                    const oBinding = oTable.getBinding(sAggregation);
                    if (oBinding) {
                        oBinding.filter(aFilters);
                    }
                };

                const oBinding = oTable.getBinding(sAggregation);
                if (oBinding) {
                    // Binding ya existe, filtrar directo
                    fnApplyFilter();
                } else {
                    // Esperar a que el binding esté listo
                    oTable.attachEventOnce("rowsUpdated", fnApplyFilter);
                }

                oBinding.attachEventOnce("dataReceived", () => {
                    // El ValueHelpDialog usa internamente _updateTitles, dispararlo via rerender
                    const iCount = oBinding.getLength();

                    // Buscar el elemento del DOM que muestra el contador y actualizarlo
                    const oTable = oDialog.getTable(); // tabla ya resuelta
                    oDialog.setTitle(oDialog.getTitle()); // forzar re-render del header

                    // Disparar el evento que usa internamente el ValueHelpDialog
                    oDialog.fireSelectionChange({ tableSelectionParams: { rowIndices: [] } });
                    oDialog._updateTitles && oDialog._updateTitles();
                });
            });
        },

        // Soporta: ES* (startsWith), *ES (endsWith), *ES* (contains), ES (EQ)
        _buildFilter: function (sField, sValue) {
            const bStarts = !sValue.startsWith("*") && sValue.endsWith("*");
            const bEnds = sValue.startsWith("*") && !sValue.endsWith("*");
            const bContains = sValue.startsWith("*") && sValue.endsWith("*");

            let sOperator;
            let sCleanValue;

            if (bContains) {
                sOperator = FilterOperator.Contains;
                sCleanValue = sValue.slice(1, -1);
            } else if (bStarts) {
                sOperator = FilterOperator.StartsWith;
                sCleanValue = sValue.slice(0, -1);
            } else if (bEnds) {
                sOperator = FilterOperator.EndsWith;
                sCleanValue = sValue.slice(1);
            } else {
                // Sin *
                sOperator = FilterOperator.Contains;
                sCleanValue = sValue;
            }

            return new Filter(sField, sOperator, sCleanValue);
        },

        onContinuePress: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            const demeritData = AppJsonModel.getProperty('/DemeritData');
            const sBusy = oResourceBundle.getText("busyText");
            const oModel = this.getView().getModel();

            if (!this.checkInputs()) {
                return;
            }

            const sMaterial = demeritData.Material;
            const sPlant = demeritData.Plant;
            const sStorage = demeritData.Storage;
            const sSerialNumber = demeritData.SerialNumber;
            const sCostCenter = demeritData.CostCenter;

            const busyDialog = (sap.ui.getCore().byId("busy4")) ? sap.ui.getCore().byId("busy4") : new sap.m.BusyDialog('busy4', {
                title: sBusy
            });

            busyDialog.open();

            const aFilter = [
                new Filter("matnr", FilterOperator.EQ, sMaterial),
                new Filter("werks", FilterOperator.EQ, sPlant),
            ];

            ListMaterialService.callGetService('/ListMaterialOrder', aFilter)
                .then((oData) => {
                    if (oData.results.length > 0) {
                        busyDialog.close();
                        this.destroyFragments(); // Limpiar fragments cacheados al continuar

                        oRouter.navTo("DetailView", {
                            query: {
                                material: sMaterial,
                                serialNumber: sSerialNumber,
                                plant: sPlant,
                                storage: sStorage,
                                costCenter: sCostCenter
                            }
                        });
                    }

                    if (oData.results.length === 0) {
                        busyDialog.close();
                        MessageBox.error(oResourceBundle.getText("noDataFound"));
                        return;
                    }
                })
                .catch((oError) => {
                    busyDialog.close();
                    MessageBox.error(oError.message || oResourceBundle.getText("dataValidationError"));
                });
        }
    });
});