import { Grid } from 'ag-grid-community';

import 'ag-grid-community/styles//ag-grid.css';
import 'ag-grid-community/styles//ag-theme-alpine.css';
import { CheckboxRenderer } from './renderers/checkboxRenderer';

export interface GridListener {
    selectedRowChanged(data: any);
    columnMoved(column: string, toIndex: number): void;
    cellValueChanged(oldValue: any, newValue: any): void;
}

export class TwxAgGrid {
    gridListeners: GridListener[] = [];
    agg: any;

    initAGGrid(uid: string, config: any, debugMode: boolean): void {
        const gridListeners = this.gridListeners;

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

        config.onCellValueChanged = function (event): void {
            if (typeof event.newValue !== 'undefined' && event.oldValue !== event.newValue) {
                event.data.isEdited = true;
                event.api.refreshCells();
                for (const listener of gridListeners) {
                    listener.cellValueChanged(event.oldValue, event.newValue);
                }
            }
        };

        config.onColumnPinned = function (event) {
            if (debugMode) {
                console.log('AGGrid - Column Pinned');
            }

            config.columnDefs.find((row) => row.field === event.columns[0].colDef.field).pinned =
                event.columns[0].pinned;
        };

        config.onColumnVisible = function (event) {
            if (debugMode) {
                console.log('AGGrid - Column Visibility Changed');
            }

            const visibilityColumns = {};
            for (let index = 0; index < event.columns.length; index++) {
                visibilityColumns[event.columns[index].colDef.field] = event.columns[index].visible;
                config.columnDefs.find(
                    (row) => row.field === event.columns[index].colDef.field,
                ).hide = !event.columns[index].visible;
            }
        };

        config.onColumnMoved = function (event): void {
            if (debugMode) {
                console.log('AGGrid - Column Moved');
            }

            for (const listener of gridListeners) {
                listener.columnMoved(event.columns[0].colDef.field, event.toIndex);
            }
        };

        config.onRowSelected = function (event): void {
            if (debugMode) {
                console.log('AGGRID Row Selected Event');
            }

            for (const listener of gridListeners) {
                listener.selectedRowChanged(event.data);
            }
        };

        config.onDragStopped = function (event) {
            // TODO: implement
        };

        config.onSelectionChanged = function (event) {
            if (debugMode) {
                console.log('AGGrid - Row Selected');
            }
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

            this.agg.gridOptions.api.refreshCells();
        };

        for (let index = 0; index < config.columnDefs.length; index++) {
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

        const child = <HTMLElement>document.getElementsByClassName(container.substring(1))[0];
        this.agg = new Grid(child, config);
    }

    getSelectedRows(): any[] {
        return this.agg.gridOptions.api.getSelectedRows();
    }

    deselectAll(): void {
        this.agg.gridOptions.api.deselectAll();
    }

    refreshCells(force: boolean, suppressFlash: boolean): void {
        this.agg.gridOptions.api.refreshCells(force, suppressFlash);
    }

    redrawRows(): void {
        this.agg.gridOptions.api.redrawRows();
    }

    /**
     * Adds a new listener that gets called when a new code is detected by quagga
     * @param listener Listener that gets notified whenever a code is detected
     */
    addListener(listener: GridListener): void {
        this.gridListeners.push(listener);
    }

    /**
     * Removes the given listener from the listener list
     * @param listener Listener to remove
     */
    removeListener(listener: GridListener): void {
        this.gridListeners.forEach((item, index) => {
            if (item === listener) this.gridListeners.splice(index, 1);
        });
    }
}
