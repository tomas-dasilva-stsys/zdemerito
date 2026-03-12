sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "zdemerito/services/ListMaterialService",
], (Controller,
    JSONModel,
    Filter,
    FilterOperator,
    ListMaterialService) => {
    "use strict";

    return Controller.extend("zdemerito.controller.DetailView", {
        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("DetailView").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oArguments = oEvent.getParameter("arguments")["?query"];

            const sMaterial = oArguments?.material;
            const sPlant = oArguments?.plant;
            const sSerialNumber = oArguments?.serialNumber;
            const sCostCenter = oArguments?.costCenter;

            // Primero limpiar variables de paginación
            this._nextLink = null;
            this._aFilter = null;
            this._isLoading = false;

            // Inicializar modelo vacío para evitar datos viejos mientras carga
            this.getView().setModel(new JSONModel({
                piezas: [],
                hasMore: false,
                isLoading: false
            }));

            this._loadData(sMaterial, sPlant);
        },

        _loadData: async function (sMaterial, sPlant) {
            const aFilter = [
                new Filter("matnr", FilterOperator.EQ, sMaterial),
                new Filter("werk", FilterOperator.EQ, sPlant)
            ];

            this._aFilter = aFilter;
            this._nextLink = null;
            this._isLoading = false;

            this.getView().setBusy(true);

            try {
                const oData = await ListMaterialService.callGetService('/ListMaterialOrder', aFilter);

                this._nextLink = oData.__next || null;

                this.getView().setModel(new JSONModel({
                    piezas: oData.results,
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

            if (sQuery && sQuery.length > 0) {
                const oFilter = new Filter("matnr_2", FilterOperator.Contains, sQuery);
                oBinding.filter(oFilter);
            }

            if (!sQuery || sQuery.length === 0) {
                oBinding.filter([]);
            }
        },

        onFilterChange: function (oEvent) {
            const sSelectedKey = oEvent.getSource().getSelectedKey();
            const oTable = this.getView().byId("piezasTable");
            const oBinding = oTable.getBinding("items");

            if (sSelectedKey === "all") {
                oBinding.filter([]);
            }

            if (sSelectedKey !== "all") {
                const oFilter = new Filter("conceptoClas", FilterOperator.EQ, sSelectedKey);
                oBinding.filter(oFilter);
            }
        },

        onPiezasTableSelectionChange: function (oEvent) {
            const oTable = oEvent.getSource();
            const aSelectedItems = oTable.getSelectedItems();
            const oSaveButton = this.getView().byId("saveButton");

            oSaveButton.setEnabled(aSelectedItems.length > 0);
        },

        onMengeInputChange: function (oEvent) {
            const oInput = oEvent.getSource();
            const sValue = oInput.getValue();

            if (sValue) {
                const newValue = parseFloat(sValue).toFixed(3);
                oInput.setValue(newValue);
            }
        },

        onNavBack() {
            this._cleanUp();

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
    });
});