import { TwxAgGrid } from '../common/twxAgGrid';
import { GridOptions } from 'ag-grid-community';

import {
    TWWidgetDefinition,
    TWEvent,
    property,
    event,
    service,
} from 'typescriptwebpacksupport/widgetRuntimeSupport';

import './runtime.css';

const uid = new Date().getTime() + '_' + Math.floor(1000 * Math.random());

/**
 * The `@TWWidgetDefinition` decorator marks a class as a Thingworx widget. It can only be applied to classes
 * that inherit from the `TWRuntimeWidget` class.
 */
@TWWidgetDefinition
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AGGridWebpackWidget extends TWRuntimeWidget {
    public twxAgGrid: TwxAgGrid;

    /**
     * The `@property` decorator can be applied to class member to mark them as events.
     * The value of the class member and of the associated widget property will be kept in sync.
     *
     * The runtime will also automatically update the value of the property for bindings; because of this
     * the `updateProperty` method becomes optional. If `updateProperty` is overriden, you must invoke
     * the superclass implementation to ensure that decorated properties are updated correctly.
     *
     * Optionally, the decorator can receive a number of aspects as its parameters.
     * Optionally, the first parameter of the `@property` decorator can be a string that specifies the
     * name of the property as it is defined in the IDE class. This can be used to have different names
     * in the definition and implementation.
     */

    @property DebugMode;

    @property SelectedRows;

    @property set Data(Data: TWInfotable) {
        const config = this.getConfigFromInfoTable(Data);
        console.log(config);
        this.twxAgGrid.initAGGrid(uid, config, this.DebugMode);
    }

    @property set config(config: JSON) {
        this.twxAgGrid.initAGGrid(uid, config, this.DebugMode);
    }

    /**
     * The `@service` decorator can be applied to methods to mark them as thingworx services.
     *
     * The runtime will also automatically call the method when the associated service is invoked.
     *
     * Optionally, the decorator can receive the name of the service as its parameter; if it is not specified,
     * the name of the service will be considered to be the same as the name of the method.
     */
    @service DeselectAll(): void {
        if (this.DebugMode) console.log(`All data deselected.`);
        this.twxAgGrid.deselectAll();
    }

    @service GetSelectedRows(): any {
        const selectedRows = this.twxAgGrid.getSelectedRows();
        this.SelectedRows = selectedRows;
        if (this.DebugMode) {
            console.log(`Selected row number`);
            console.log(selectedRows);
        }
    }

    @service RefreshCells(): void {
        if (this.DebugMode) console.log(`All data refreshed.`);
        this.twxAgGrid.refreshCells(true, true);
    }

    @service RedrawRows(): void {
        if (this.DebugMode) console.log(`All data redrawn.`);
        this.twxAgGrid.redrawRos();
    }

    /**
     * The `@event` decorator can be applied to class member to mark them as events.
     * They must have the `TWEvent` type and can be invoked to trigger the associated event.
     *
     * Optionally, the decorator can receive the name of the event as its parameter; if it is not specified,
     * the name of the event will be considered to be the same as the name of the class member.
     */

    @event ColumnMoved: TWEvent;

    columnMoved(column, toIndex): void {
        if (this.DebugMode) console.log(`Column ${column} moved to ${toIndex}`);
        this.ColumnMoved();
    }

    @event CellValueChanged: TWEvent;

    cellValueChanged(oldValue, newValue): void {
        if (this.DebugMode) console.log(`Column Value changed from ${oldValue} to ${newValue}`);
        this.CellValueChanged();
    }

    @event SelectedRowChanged: TWEvent;

    selectedRowChanged(data): void {
        if (this.DebugMode) console.log(`Selected row changed to ${data}`);
        this.SelectedRows = data;
        this.SelectedRowChanged();
    }

    /**
     * The `canBind` and `didBind` aspects can be used to specify callback methods to execute when the value of
     * the property is about to be updated or has been updated because of a binding.
     *
     * For `canBind`, the method can decide to reject the newly received value.
     */

    /**
     * This method is invoked whenever the `value` property is about to be updated because of a binding,
     * because it has been specified in the `canBind` aspect of the `value` property.
     * @param value         Represents the property's new value.
     * @param info          The complete updatePropertyInfo object.
     * @return              `true` if the property should update to the new value, `false` otherwise.
     */
    // valueWillBind(value: string, info: TWUpdatePropertyInfo): boolean {
    //     alert(`Value will be updated to ${value}`);
    //     return true;
    // }

    /**
     * Invoked to obtain the HTML structure corresponding to the widget.
     * @return      The HTML structure.
     */
    renderHtml(): string {
        const html =
            `<div class="widget-content widget-aggrid widget-aggrid-${uid}">` +
            `  <div class="widget-aggrid-container widget-aggrid-container-${uid}">` +
            `  </div>` +
            `</div>`;
        return html;
    }

    // internalLogic;

    /**
     * Invoked after the widget's HTML element has been created.
     * The `jqElement` property will reference the correct element within this method.
     */
    async afterRender(): Promise<void> {
        this.twxAgGrid = new TwxAgGrid();
        this.twxAgGrid.addListener(this);
        // TODO: add theme as property?
        $(`.widget-aggrid-container-${uid}`).addClass('ag-theme-alpine');
    }

    /**
     * Invoked when this widget is destroyed. This method should be used to clean up any resources created by the widget
     * that cannot be reclaimed by the garbage collector automatically (e.g. HTML elements added to the page outside of the widget's HTML element)
     */
    beforeDestroy?(): void {
        // add disposing logic
    }

    getConfigFromInfoTable(data: TWInfotable): GridOptions {
        const dataShape: TWDataShape = data.dataShape;
        const columnDefs = [];
        Object.entries(dataShape.fieldDefinitions).forEach(([key, value]) => {
            columnDefs.push({
                field: value.name,
                headerName: value.name,
            });
        });
        return { columnDefs: columnDefs };
    }
}
