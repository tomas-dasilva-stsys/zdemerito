sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
], (Controller, JSONModel) => {
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