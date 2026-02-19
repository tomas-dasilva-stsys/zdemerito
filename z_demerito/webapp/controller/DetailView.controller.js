sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], (Controller,
    JSONModel,
    Filter,
    FilterOperator) => {
    "use strict";

    return Controller.extend("zdemerito.controller.DetailView", {
        onInit() {
            const oModel = new JSONModel({
                piezas: [
                    { selected: false, cantRecup: "", conceptoClas: "4050", pos: "0010", componente: "RNA0527GGH", denominacion: "ROTOR ASS", cantidad: "1,000", um: "Pl" },
                    { selected: false, cantRecup: "", conceptoClas: "4050", pos: "0020", componente: "RNA0528HHJ", denominacion: "STATOR ASS", cantidad: "1,000", um: "Pl" },
                    { selected: false, cantRecup: "", conceptoClas: "4050", pos: "0030", componente: "BRG0045KLM", denominacion: "RETAINER", cantidad: "2,000", um: "Pl" },
                    { selected: false, cantRecup: "", conceptoClas: "4050", pos: "0040", componente: "SHF0102NPQ", denominacion: "JUNTA", cantidad: "1,000", um: "Pl" },
                    { selected: false, cantRecup: "", conceptoClas: "4050", pos: "0050", componente: "FAN0078RST", denominacion: "CAMISA AGUA", cantidad: "1,000", um: "Pl" },
                    { selected: false, cantRecup: "", conceptoClas: "4050", pos: "0060", componente: "HSG0234UVW", denominacion: "PARAFUSO M6", cantidad: "1,000", um: "Pl" },
                    { selected: false, cantRecup: "", conceptoClas: "4060", pos: "0070", componente: "GKT0089XYZ", denominacion: "JUNTA RESOLVER", cantidad: "2,000", um: "Pl" },
                    { selected: false, cantRecup: "", conceptoClas: "4060", pos: "0080", componente: "CPL0156ABC", denominacion: "TAMPA TERMIN", cantidad: "1,000", um: "Pl" },
                    { selected: false, cantRecup: "", conceptoClas: "4080", pos: "0090", componente: "TRM0067DEF", denominacion: "BORNE TERMIN", cantidad: "4,000", um: "Pl" },
                    { selected: false, cantRecup: "", conceptoClas: "4080", pos: "0100", componente: "PLT0345GHI", denominacion: "1F TAMPA", cantidad: "1,000", um: "Pl" }
                ]
            });
            this.getView().setModel(oModel);

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("DetailView").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const oArguments = oEvent.getParameter("arguments")["?query"];

            const sMaterial = oArguments?.material;
            const sPlant = oArguments?.plant;
            const sSerialNumber = oArguments?.serialNumber;
            const sCostCenter = oArguments?.costCenter;

            this._loadData(sMaterial, sPlant, sSerialNumber, sCostCenter);
        },

        _loadData: async function (sMaterial, sPlant, sSerialNumber, sCostCenter) {
            const oModel = this.getOwnerComponent().getModel();

            // Lógica para cargar datos desde el backend
        },

        onSearch: function (oEvent) {
            const sQuery = oEvent.getSource().getValue();
            const oTable = this.getView().byId("piezasTable");
            const oBinding = oTable.getBinding("items");

            if (sQuery && sQuery.length > 0) {
                const oFilter = new Filter("componente", FilterOperator.Contains, sQuery);
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

        onCantRecupInputChange: function (oEvent) {
            const oInput = oEvent.getSource();
            const sValue = oInput.getValue();

            if (sValue) {
                const newValue = parseFloat(sValue).toFixed(3);
                oInput.setValue(newValue);
            }
        },

        onNavBack() {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("MainView");
            }
        },
    });
});