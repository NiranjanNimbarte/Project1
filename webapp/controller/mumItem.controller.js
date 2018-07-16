var aData = [];
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"ZMUM_ITEM/js/formatter"
], function(Controller, formatter) {
	"use strict";

	return Controller.extend("ZMUM_ITEM.controller.mumItem", {

		onInit: function() {
			// Whole Data loading from json file
			var oAppModel = new sap.ui.model.json.JSONModel();
			oAppModel.loadData("json/data.json", null, false);
			aData = oAppModel.oData.items;

			// Maint sort field data binding
			var flags = {};
			var aSortFldFilterData = aData.filter(function(entry) {
				if (flags[entry["Maint Plan sort field"]]) {
					return false;
				}
				flags[entry["Maint Plan sort field"]] = true;
				return true;
			});
			var oSortfieldDataModel = new sap.ui.model.json.JSONModel();
			oSortfieldDataModel.oData.items = aSortFldFilterData;
			this.getView().setModel(oSortfieldDataModel);

			//Table Data Binding
			var oTableModel = new sap.ui.model.json.JSONModel();
			oTableModel.loadData("json/data.json", null, false);
			//	oModel.setData(mData);
			this.getView().byId("idProductsTable").setModel(oTableModel);
			//	this.getView().setModel(oTableModel);;

		},

		//Download data as CSV
		onExportCsv: function() {
			function exportCSVFile(headers, items, fileTitle) {
				if (headers) {
					items.unshift(headers);
				}

				// Convert Object to JSON
				var jsonObject = JSON.stringify(items);

				var array = typeof jsonObject != 'object' ? JSON.parse(jsonObject) : jsonObject;
				var str = '';

				for (var i = 0; i < array.length; i++) {
					var line = '';
					for (var index in array[i]) {
						if (line != '') line += ',';

						line += array[i][index];
					}

					str += line + '\r\n';
				}

				var csv = str;

				var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

				var blob = new Blob([csv], {
					type: 'text/csv;charset=utf-8;'
				});
				if (navigator.msSaveBlob) { // IE 10+
					navigator.msSaveBlob(blob, exportedFilenmae);
				} else {
					var link = document.createElement("a");
					if (link.download !== undefined) { // feature detection
						// Browsers that support HTML5 download attribute
						var url = URL.createObjectURL(blob);
						link.setAttribute("href", url);
						link.setAttribute("download", exportedFilenmae);
						link.style.visibility = 'hidden';
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
					}
				}
			}
			var list = this.getView().byId("idProductsTable");
			var aBinding = list.getBinding("items").oList;

			var aKeys = Object.keys(aBinding[0]);
			var sHeaders = "{";

			for (var i = 0; i < aKeys.length; i++) {
				if (i != aKeys.length - 1) {
					sHeaders = sHeaders + '"' + aKeys[i] + '"' + ':' + '"' + aKeys[i] + '"' + ',';
				} else {
					sHeaders = sHeaders + '"' + aKeys[i] + '"' + ':' + '"' + aKeys[i] + '"';
				}
			}
			sHeaders = sHeaders + "}";

			var headers = JSON.parse(sHeaders);
			// var headers = {
			// 	model: 'Phone Model'.replace(/,/g, ''), // remove commas to avoid errors
			// 	chargers: "Chargers",
			// 	cases: "Cases",
			// 	earphones: "Earphones"
			// };

			// var itemsNotFormatted = [{
			// 	model: 'Samsung S7',
			// 	chargers: '55',
			// 	cases: '56',
			// 	earphones: '57',
			// 	scratched: '2'
			// }, {
			// 	model: 'Pixel XL',
			// 	chargers: '77',
			// 	cases: '78',
			// 	earphones: '79',
			// 	scratched: '4'
			// }, {
			// 	model: 'iPhone 7',
			// 	chargers: '88',
			// 	cases: '89',
			// 	earphones: '90',
			// 	scratched: '6'
			// }];

			var itemsFormatted = [];

			// format the data
			// itemsNotFormatted.forEach((item) => {
			// 	itemsFormatted.push({
			// 		model: item.model.replace(/,/g, ''), // remove commas to avoid errors,
			// 		chargers: item.chargers,
			// 		cases: item.cases,
			// 		earphones: item.earphones
			// 	});
			// });

			var fileTitle = 'orders'; // or 'my-unique-title'

			exportCSVFile(headers, aBinding, fileTitle);

		},

		//handles search
		handleSearch: function(evt) {
			// create model filter
			var filters = [];
			if (evt.getParameter("query") != undefined) {
				var query = evt.getParameter("query");
			} else {
				var query = evt.getParameter("newValue");
			}
			if (query && query.length > 0) {
				var filter = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, query);
				filters.push(filter);
			}

			// update list binding
			var list = this.getView().byId("idProductsTable");
			var binding = list.getBinding("items");
			binding.filter(filters);
		},

		handleSortFieldChange: function() {
			//	alert("Hii");
			var sSelectedSortFld = this.getView().byId("idSortFieldCombo").getSelectedKey();
			var aMaintPlan = aData.filter(function(data) {
				return data["Maint Plan sort field"] == sSelectedSortFld;
			});
			var oMaintFieldModel = new sap.ui.model.json.JSONModel();
			oMaintFieldModel.oData.items=aMaintPlan;
			this.getView().byId("idMaintPlanCombo").setModel(oMaintFieldModel);
			this.getView().byId("idMaintPlanCombo").setEnabled(true);
		//	console.log(aMaintPlan);
		},
		handleMaintPlanChange: function() {
			//	alert("Hii");
			var sSelectedMaintPlanFld = this.getView().byId("idMaintPlanCombo").getSelectedKey();
			var aFilterData = aData.filter(function(data) {
				return data["Maint Plan"] == sSelectedMaintPlanFld;
			});
			var oBuildingRoomModel = new sap.ui.model.json.JSONModel();
			oBuildingRoomModel.oData.items=aFilterData;
			this.getView().byId("idBuildingCombo").setModel(oBuildingRoomModel);
			this.getView().byId("idRoomCombo").setModel(oBuildingRoomModel);
			this.getView().byId("idBuildingCombo").setEnabled(true);
			this.getView().byId("idRoomCombo").setEnabled(true);
		//	console.log(aMaintPlan);
		}

	});
});