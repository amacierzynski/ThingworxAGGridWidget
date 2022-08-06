import { Grid } from 'ag-grid-community';

import 'ag-grid-community/styles//ag-grid.css';
import 'ag-grid-community/styles//ag-theme-alpine.css';import { CheckboxRenderer } from './renderers/checkboxRenderer';

export function initAGGrid(uid: string, config: any, debugMode: boolean) {
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

    // if (typeof config.getRowNodeId === "string") {
    //   config.getRowNodeId = new Function("data", config.getRowNodeId);
    // }

    const cellClassRules = {
        'aggrid-edited': (params) =>
            editedCells[params.node.id] && editedCells[params.node.id][params.colDef.field],
    };

    for (let index = 0; index < config.columnDefs.length; index++) {
        config.columnDefs[index].cellClassRules = cellClassRules;

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
    const child = <HTMLElement>document.getElementsByClassName(container)[0];
    return new Grid(child, config);
}
