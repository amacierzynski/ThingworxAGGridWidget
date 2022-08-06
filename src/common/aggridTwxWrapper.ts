import { Grid } from 'ag-grid-community';

import 'ag-grid-community/styles//ag-grid.css';
import 'ag-grid-community/styles//ag-theme-alpine.css';
import { CheckboxRenderer } from './renderers/checkboxRenderer';

export function initAGGrid(uid: string, config: any, debugMode: boolean) {
    let agg: any;

    if (debugMode) {
        console.log('AGGrid - Data inited');
    }

    if (debugMode) {
        console.log('AGGrid - config = ');
        console.log(config);
    }

    config = JSON.parse(JSON.stringify(config));
    config.enableRangeSelection = true;
    config.enableFillHandle = true;
    config.components = {
        checkboxRenderer: CheckboxRenderer,
    };

    config.onCellValueChanged = function (event) {
        //        hot.validateCells(valid => thisWidget.setProperty("isDataValid", valid));
        //   thisWidget.setProperty('data', agg.gridOptions.rowData);

        if (typeof event.newValue !== 'undefined' && event.oldValue !== event.newValue) {
            event.data.isEdited = true;
            event.api.refreshCells();
        }

        if (debugMode) {
            console.log('AGGrid - Data changed');
        }
        // thisWidget.jqElement.triggerHandler('DataChanged');
    };

    config.onColumnPinned = function (event) {
        if (debugMode) {
            console.log('AGGrid - Column Pinned');
        }

        // const config = thisWidget.getProperty('config');
        config.columnDefs.find((row) => row.field === event.columns[0].colDef.field).pinned =
            event.columns[0].pinned;

        // thisWidget.setProperty('pinnedColumn', event.columns[0].colDef.field);
        // thisWidget.setProperty('pinnedOption', event.columns[0].pinned);
        // thisWidget.setProperty('config', config);

        // thisWidget.jqElement.triggerHandler('ColumnPinned');
    };

    config.onColumnVisible = function (event) {
        if (debugMode) {
            console.log('AGGrid - Column Visibility Changed');
        }

        const visibilityColumns = {};
        // const config = thisWidget.getProperty('config');
        for (let index = 0; index < event.columns.length; index++) {
            visibilityColumns[event.columns[index].colDef.field] = event.columns[index].visible;
            config.columnDefs.find((row) => row.field === event.columns[index].colDef.field).hide =
                !event.columns[index].visible;
        }

        // thisWidget.setProperty('visibilityColumns', visibilityColumns);
        // thisWidget.setProperty('config', config);
        // thisWidget.jqElement.triggerHandler('ColumnVisibilityChanged');
    };

    let movingColumn = false;

    config.onColumnMoved = function (event) {
        if (debugMode) {
            console.log('AGGrid - Column Moved');
        }

        this.movingColumn = true;
        // thisWidget.setProperty('movedColumn', event.columns[0].colDef.field);
        // thisWidget.setProperty('movedToIndex', event.toIndex);
    };

    config.onDragStopped = function (event) {
        // if (movingColumn) {
        // thisWidget.jqElement.triggerHandler('ColumnMoved');
        // }

        movingColumn = false;
    };

    config.onSelectionChanged = function (event) {
        if (debugMode) {
            console.log('AGGrid - Row Selected');
        }

        // thisWidget.setProperty('selectedRows', agg.gridOptions.api.getSelectedRows());
        // thisWidget.jqElement.triggerHandler('RowSelected');
    };

    config.onColumnRowGroupChanged = function (event) {
        let groupedColumns = '';

        // const config = thisWidget.getProperty('config');
        for (let index = 0; index < config.columnDefs.length; index++) {
            config.columnDefs[index].rowGroup = false;
        }
        for (let index = 0; index < event.columns.length; index++) {
            groupedColumns = groupedColumns
                ? groupedColumns + ',' + event.columns[index].colDef.field
                : event.columns[index].colDef.field;
            config.columnDefs.find(
                (row) => row.field === event.columns[index].colDef.field,
            ).rowGroup = true;
        }

        agg.gridOptions.api.refreshCells();

        // thisWidget.setProperty('groupedColumns', groupedColumns);
        // thisWidget.setProperty('config', config);

        // thisWidget.jqElement.triggerHandler('RowGroupChanged');
    };

    // if (typeof config.getRowNodeId === "string") {
    //   config.getRowNodeId = new Function("data", config.getRowNodeId);
    // }

    // const cellClassRules = {
    //     'aggrid-edited': (params) =>
    //         editedCells[params.node.id] && editedCells[params.node.id][params.colDef.field],
    // };

    for (let index = 0; index < config.columnDefs.length; index++) {
        // config.columnDefs[index].cellClassRules = cellClassRules;

        if (typeof config.columnDefs[index].editable === 'string') {
            config.columnDefs[index].editable = new Function(
                'params',
                config.columnDefs[index].editable,
            );
        }

        if (typeof config.columnDefs[index].cellStyle === 'string') {
            config.columnDefs[index].cellStyle = new Function(
                'params',
                config.columnDefs[index].cellStyle,
            );
        }

        if (
            config.columnDefs[index].cellEditorParams &&
            config.columnDefs[index].cellEditorParams.mapping
        ) {
            config.columnDefs[index].valueFormatter = (params) =>
                params.colDef.cellEditorParams.mapping[params.value];
            config.columnDefs[index].valueParser = (params) => {
                for (const key in params.colDef.cellEditorParams.mapping) {
                    if (
                        params.colDef.cellEditorParams.mapping.hasOwnProperty(key) &&
                        params.newValue === params.colDef.cellEditorParams.mapping[key]
                    ) {
                        return key;
                    }
                }
            };
        }
    }

    const container = `.widget-aggrid-container-${uid}`;

    $(container).empty();

    // removing . from class name
    const child = <HTMLElement>document.getElementsByClassName(container.substring(1))[0];
    agg = new Grid(child, config);
    // agg.setAutoSize()
    return agg;
}
