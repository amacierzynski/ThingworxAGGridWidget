export class CheckboxRenderer {
    init: (params: any) => void;
    checkedHandler: (e: any) => void;
    getGui: (params: any) => any;
    destroy: (params: any) => void;
}

CheckboxRenderer.prototype.init = function (params: any): void {
    this.params = params;
    if (params.node.group) {
        this.eGui = document.createElement('span');
    } else {
        this.eGui = document.createElement('input');
        this.eGui.type = 'checkbox';
        this.eGui.checked = params.value;
        this.eGui.disabled =
            typeof params.colDef.editable === 'function'
                ? !params.colDef.editable(params)
                : !params.colDef.editable;

        this.checkedHandler = this.checkedHandler.bind(this);
        this.eGui.addEventListener('click', this.checkedHandler);
    }
};

CheckboxRenderer.prototype.checkedHandler = function (e): void {
    const checked = e.target.checked;
    const colId = this.params.column.colId;
    this.params.node.setDataValue(colId, checked);
};

CheckboxRenderer.prototype.getGui = function (): any {
    return this.eGui;
};

CheckboxRenderer.prototype.destroy = function (): void {
    if (this.checkedHandler) {
        this.eGui.removeEventListener('click', this.checkedHandler);
    }
};
