sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "zdemerito/services/ListMaterialService",
    "zdemerito/model/AppJsonModel",
], (Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessagePopover,
    MessageItem,
    MessageBox,
    History,
    ListMaterialService,
    AppJsonModel) => {
    "use strict";

    let oMessageTemplate = new MessageItem({
        type: '{T}',
        title: '{S}',
    });

    let oMessagePopover = new MessagePopover({
        items: {
            path: '/',
            template: oMessageTemplate
        }
    });

    return Controller.extend("zdemerito.controller.DetailView", {
        onInit() {
            AppJsonModel.initializeModel();

            let pop_msgModel = new JSONModel({
                "messageLength": '',
                "type": 'Default'
            })

            this.getView().setModel(pop_msgModel, "popoverModel");
            let popModel = new JSONModel({});
            oMessagePopover.setModel(popModel);

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("DetailView").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oArguments = oEvent.getParameter("arguments")["?query"];

            const sMaterial = oArguments?.material;
            const sPlant = oArguments?.plant;
            const sStorage = oArguments?.storage;
            const sSerialNumber = oArguments?.serialNumber;
            const sCostCenter = oArguments?.costCenter;

            // Primero limpiar variables de paginación
            this._nextLink = null;
            this._aFilter = null;
            this._isLoading = false;

            this.getView().setModel(new JSONModel({
                material: sMaterial,
                plant: sPlant,
                storage: sStorage,
                serialNumber: sSerialNumber,
                costCenter: sCostCenter
            }), "headerParams");

            // Inicializar modelo vacío para evitar datos viejos mientras carga
            this.getView().setModel(new JSONModel({
                piezas: [],
                hasMore: false,
                isLoading: false
            }));

            this._loadData(sMaterial, sPlant, sSerialNumber);
        },

        _loadData: async function (sMaterial, sPlant, sSerialNumber) {
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const aFilter = [
                new Filter("matnr", FilterOperator.EQ, sMaterial),
                new Filter("sernr", FilterOperator.EQ, sSerialNumber),
                new Filter("werks", FilterOperator.EQ, sPlant)
            ];

            this._aFilter = aFilter;
            this._nextLink = null;
            this._isLoading = false;

            this.getView().setBusy(true);

            try {
                const oData = await ListMaterialService.callGetService('/ListMaterialOrder', aFilter);
                const finaloData = oData.results.filter(item => item.menge).map(item => ({
                    ...item,
                    recoveryQty: item.menge
                }));

                const uniqueConcepts = [...new Set(finaloData.map(item => item.sortf))];
                const concepts = uniqueConcepts.map(concept => ({ key: concept, text: concept }));
                const finalConcepts = [{ key: "all", text: oResourceBundle.getText("allConcepts") }, ...concepts];

                this._nextLink = oData.__next || null;

                this.getView().setModel(new JSONModel({
                    piezas: finaloData,
                    concepts: finalConcepts,
                    hasMore: !!oData.__next,
                    isLoading: false
                }));

            } catch (oError) {
                console.error("Error al obtener datos:", oError);
            } finally {
                this.getView().setBusy(false);
            }
        },

        onLoadMore: function () {
            this._loadMoreData();
        },

        _loadMoreData: async function () {
            if (!this._nextLink || this._isLoading) return;

            this._isLoading = true;

            const oModel = this.getView().getModel();
            oModel.setProperty("/isLoading", true);

            try {
                const sRelativePath = this._getRelativePath(this._nextLink);
                const oData = await ListMaterialService.callGetService(sRelativePath, []);

                const currentPiezas = oModel.getProperty("/piezas");
                oModel.setProperty("/piezas", [...currentPiezas, ...oData.results]);
                oModel.setProperty("/hasMore", !!oData.__next);

                this._nextLink = oData.__next || null;

            } catch (oError) {
                console.error("Error al cargar más:", oError);
            } finally {
                this._isLoading = false;
                oModel.setProperty("/isLoading", false);
            }
        },

        _getRelativePath: function (sNextLink) {
            const oUrl = new URL(sNextLink);
            const sSkipToken = oUrl.searchParams.get("$skiptoken");
            return `/ListMaterialOrder?$skiptoken=${sSkipToken}`;
        },

        onPiezasTableUpdateFinished: function (oEvent) {
            const oTable = this.byId("piezasTable");
            const oDomRef = oTable.getDomRef();

            if (oDomRef) {
                const oScrollContainer = oDomRef.querySelector(".sapMListItems");
                oScrollContainer?.addEventListener("scroll", () => {
                    const { scrollTop, scrollHeight, clientHeight } = oScrollContainer;
                    // Cargar más cuando está cerca del final
                    if (scrollTop + clientHeight >= scrollHeight - 50) {
                        this._loadMoreData();
                    }
                });
            }
        },

        onSearch: function (oEvent) {
            const sQuery = oEvent.getSource().getValue();
            const oTable = this.getView().byId("piezasTable");
            const oBinding = oTable.getBinding("items");

            if (!sQuery || sQuery.length === 0) {
                oBinding.filter([]);
                return;
            }

            const aValues = sQuery.split(/[\s,;]+/).map((s) => s.trim()).filter((s) => s !== "");

            const aFilters = aValues.map((value) => new Filter("matnr_2", FilterOperator.Contains, value));
            const combinedFilters = new Filter({
                filters: aFilters,
                and: false
            })

            oBinding.filter(combinedFilters);

            /*if (sQuery && sQuery.length > 0) {
                const oFilter = new Filter("matnr_2", FilterOperator.Contains, sQuery);
            }*/
        },

        onFilterChange: function (oEvent) {
            const sSelectedKey = oEvent.getSource().getSelectedKey();
            const oTable = this.getView().byId("piezasTable");
            const oBinding = oTable.getBinding("items");

            if (sSelectedKey === "all") {
                oBinding.filter([]);
            }

            if (sSelectedKey !== "all") {
                const oFilter = new Filter("sortf", FilterOperator.EQ, sSelectedKey);
                oBinding.filter(oFilter);
            }
        },

        onPiezasTableSelectionChange: function (oEvent) {
            const oTable = oEvent.getSource();
            const aSelectedItems = oTable.getSelectedItems();
            const oSaveButton = this.getView().byId("saveButton");

            oSaveButton.setEnabled(aSelectedItems.length > 0);
        },

        onRecoveryQtyInputChange: function (oEvent) {
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            const saveBtn = this.getView().byId("saveButton");
            const oInput = oEvent.getSource();
            const sValue = oInput.getValue();
            const mengeQty = oInput.getParent().getCells().filter(cell => cell.getId().includes("idMenge"))[0]?.getText();

            if (sValue > parseFloat(mengeQty)) {
                oInput.setValueState("Error");
                oInput.setValueStateText(oResourceBundle.getText("recoveryQtyError"));
                saveBtn.setEnabled(false);
                return;
            }

            if (sValue) {
                const newValue = parseFloat(sValue).toFixed(3);
                oInput.setValueState("None");
                oInput.setValueStateText("");
                oInput.setValue(newValue);
                // saveBtn.setEnabled(true);
            }
        },

        onSavePress: function () {
            const oTable = this.getView().byId("piezasTable");
            const oHeaderModel = this.getView().getModel("headerParams");
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const aSelectedItems = oTable.getSelectedItems();
            const aSelectedData = aSelectedItems.map(item => item.getBindingContext().getObject());

            const oParameters = {
                matnr: oHeaderModel.getProperty("/material"),
                werks: oHeaderModel.getProperty("/plant"),
                kostl: oHeaderModel.getProperty("/costCenter"),
                sernr: oHeaderModel.getProperty("/serialNumber"),
                lgort: oHeaderModel.getProperty("/storage"),
                to_Position: aSelectedData.map(row => {
                    return {
                        maktx: row.maktx,
                        matnr: row.matnr,
                        matnr_2: row.matnr_2,
                        meins: row.meins,
                        menge: row.recoveryQty,
                        posnr: row.posnr,
                        sortf: row.sortf,
                        werks: row.werks
                    }
                }),
            }

            let busyDialog4 = (sap.ui.getCore().byId("busy4")) ? sap.ui.getCore().byId("busy4") : new sap.m.BusyDialog('busy4', {
                title: oResourceBundle.getText("busyText"),
            });

            busyDialog4.open();

            setTimeout(() => {
                ListMaterialService.callPostService('/Header', oParameters)
                    .then(({ oData, oResponse }) => {
                        oMessagePopover.getModel().setData('');

                        const sapMessageInfo = JSON.parse(oResponse.headers["sap-message"]);
                        const oMessage = sapMessageInfo.message;
                        const severity = sapMessageInfo.severity;

                        const messageData = [{
                            T: severity === "error" ? "Error" : "Success",
                            S: oMessage
                        }];

                        if (severity !== "error") {
                            MessageBox.success(oMessage, {
                                onClose: () => {
                                    this.onNavBack();
                                }
                            });
                        }

                        oMessagePopover.getModel().setData(messageData);
                        oMessagePopover.getModel().refresh(true);
                        this.getView().getModel('popoverModel').getData().messageLength = messageData.length;
                        this.getView().getModel('popoverModel').getData().type = "Emphasized";
                        this.getView().getModel('popoverModel').refresh(true);
                    }).catch(oError => {
                        console.log(oError)
                        MessageBox.error(oError.message || oResourceBundle.getText("dataValidationError"));
                    }).finally(() => {
                        busyDialog4.close()
                    })
            }, 100);
        },

        onNavBack() {
            this._cleanUp();
            this.clearNotifications();

            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("MainView");
            }
        },

        _cleanUp: function () {
            // Resetear el modelo
            const oModel = this.getView().getModel();
            if (oModel) {
                oModel.setData({ piezas: [], hasMore: false, isLoading: false });
            }

            // Limpiar variables de paginación
            this._nextLink = null;
            this._aFilter = null;
            this._isLoading = false;
            this._scrollListenerAttached = false;
        },

        clearNotifications: function () {
            oMessagePopover.getModel().setData([]);
            oMessagePopover.getModel().refresh(true);
            this.getView().getModel('popoverModel').getData().messageLength = ''
            this.getView().getModel('popoverModel').getData().type = "Default";
            this.getView().getModel('popoverModel').refresh(true);
        },
        handleMessagePopoverPress: function (oEvent) {
            oMessagePopover.toggle(oEvent.getSource());
        },
    });
});