// automatically import the css file
import './ide.css';
import {
    TWWidgetDefinition,
    autoResizable,
    description,
    property,
    defaultValue,
    bindingTarget,
    service,
    event,
    bindingSource,
    nonEditable,
    willSet,
    didSet,
} from 'typescriptwebpacksupport/widgetIDESupport';

import { TwxAgGrid } from '../common/twxAgGrid';
import widgetIconUrl from '../images/icon.svg';

/**
 * The `@TWWidgetDefinition` decorator marks a class as a Thingworx widget. It can only be applied to classes
 * that inherit from the `TWComposerWidget` class. It must receive the display name of the widget as its first parameter.
 * Afterwards any number of widget aspects may be specified.
 *
 * Because of this, the `widgetProperties` method is now optional. If overriden, you must invoke the superclass
 * implementation to ensure that decorated aspects are initialized correctly.
 */

const uid = new Date().getTime() + '_' + Math.floor(1000 * Math.random());

@description('PSC AGGrid')
@TWWidgetDefinition('AGGrid', autoResizable)
class AGGridWebpackWidget extends TWComposerWidget {
    public twxAgGrid: TwxAgGrid;
    /**
     * The `@property` decorator can be applied to class members to mark them as widget properties.
     * This must be applied with the base type of the property as its first parameter.
     * The decorator can then also receive a series of aspects to apply to that properties as parameters.
     *
     * Because of this, the `widgetProperties` method is now optional. If overriden, you must invoke the superclass
     * implementation to ensure that decorated properties are initialized correctly.
     *
     * The `@description` decorator can be applied before widget definitions and property, event or service decorators to specify
     * the description of the decorated class member. That description will appear in the composer.
     */
    @property('NUMBER', defaultValue(200))
    width: number;

    @property('NUMBER', defaultValue(200))
    height: number;

    @description('Debug Mode for extended Console Logging.')
    @property('BOOLEAN')
    DebugMode: boolean;

    @description(
        'The (eventually) edited JSON object containing full configuration (data and settings)',
    )
    @property('JSON', bindingSource, bindingTarget)
    config: JSON;

    @description('The data in Infotable format')
    @property('INFOTABLE', bindingSource, bindingTarget)
    Data: TWInfotable;

    @description('Selected Rowsin JSON array format')
    @property('JSON', bindingSource, bindingTarget)
    SelectedRows: JSON;

    /**
     * Invoked to obtain the URL to this widget's icon.
     * @return  The URL.
     */
    widgetIconUrl(): string {
        return widgetIconUrl;
    }

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

    /**
     * This method is invoked whenever the `value` property is about to be updated for any reason, either through
     * direct assignment or because the user has edited its value in the composer,
     * because it has been specified in the `willSet` aspect of the `value` property.
     *
     * Because of this, the `beforeSetProperty` method is now optional. If overriden, you must invoke the superclass
     * implementation to ensure that decorated properties are updated correctly.
     *
     * @param value         Represents the property's new value.
     * @return              A string, if the new value should be rejected, in which case the returned string will be
     *                      displayed as an error message to the user. If the value should be accepted, this method should return nothing.
     */
    valueWillSet(value: string): string | void {
        if (value == 'test') return 'Invalid value specified';
    }

    /**
     * This method is invoked whenever the `value` property has been updated for any reason, either through
     * direct assignment or because the user has edited its value in the composer,
     * because it has been specified in the `didSet` aspect of the `value` property.
     *
     * Because of this, the `afterSetProperty` method is now optional. If overriden, you must invoke the superclass
     * implementation to ensure that decorated properties are handled correctly.
     *
     * @param value         Represents the property's new value.
     * @return              `true` if the widget should be redrawn because of this change, nothing or `false` otherwise.
     */
    valueDidSet(value: string): boolean | void {
        this.jqElement[0].innerText = value;
    }

    /**
     * The service decorator defines a service.
     *
     * Because of this, the `widgetServices` method is now optional. If overriden, you must invoke the superclass
     * implementation to ensure that decorated services are initialized correctly.
     */
    @description('Deselects all data, regardless filtering.')
    @service
    DeselectAll;

    @description('Gets selected rows in TData[] format')
    @service
    GetSelectedRows;

    /**
     * The event decorator defines an event.
     *
     * Because of this, the `widgetEvents` method is now optional. If overriden, you must invoke the superclass
     * implementation to ensure that decorated events are initialized correctly.
     */
    @description('Triggered when the column is manually moved by the user.')
    @event
    ColumnMoved;

    @description('Triggered when the cell value edited by the user.')
    @event
    CellValueChanged;

    @description('Triggered when new row is selected.')
    @event
    SelectedRowChanged;

    /**
     * Invoked after the widget's HTML element has been created.
     * The `jqElement` property will reference the correct element within this method.
     */
    afterRender(): void {
        const columnDefs = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

        // specify the data
        const rowData = [
            { make: 'Toyota', model: 'Celica', price: 35000 },
            { make: 'Ford', model: 'Mondeo', price: 32000 },
            { make: 'Porsche', model: 'Boxster', price: 72000 },
        ];

        // let the grid know which columns and what data to use
        const gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData,
        };

        this.twxAgGrid = new TwxAgGrid();
        this.twxAgGrid.initAGGrid(uid, gridOptions, this.DebugMode);
        $(`.widget-aggrid-container-${uid}`).addClass('ag-theme-alpine');
    }

    /**
     * Invoked when this widget is destroyed. This method should be used to clean up any resources created by the widget
     * that cannot be reclaimed by the garbage collector automatically (e.g. HTML elements added to the page outside of the widget's HTML element)
     */
    beforeDestroy(): void {
        // add dispose logic here
    }
}
