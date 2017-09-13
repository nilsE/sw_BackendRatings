

//{namespace name=backend/analytics/view/main}
//{block name="backend/analytics/netzp_buergel_statistics/view/table/buergel"}
Ext.define('Shopware.apps.Analytics.netzpBuergelStatistics.view.table.Buergel', {
    extend: 'Shopware.apps.Analytics.view.main.Table',
    alias: 'widget.analytics-table-buergel',

    initComponent: function () {
        var me = this;

        me.columns = {
            items: me.getColumns(),
            defaults: {
                flex: 0,
                align: 'right',
                sortable: false
            }
        };

        me.callParent(arguments);
    },

    getColumns: function () {
        var me = this;

        return [
            {
                dataIndex: 'score',
                text: 'Score',
                align: 'left',
                width: 50,
                renderer: function(value) {
                    return '<span style="color: purple; font-weight: bold">' + value + '</span>';
                }
            },
            {
                dataIndex: 'total',
                text: 'Anzahl Scorings',
                align: 'right',
                width: 100,
            },
            {
                dataIndex: 'orders',
                text: 'Bestellungen',
                align: 'right',
                width: 100,
            },
            {
                text: 'Anteil %',
                align: 'right',
                width: 100,
                renderer: function(value, metaData, record, row, col, store, gridView) {
                    return Math.round(parseInt(record.data.orders) / parseInt(record.data.total) * 100, 1) + '%';
                }
            }
        ];
    }
});
//{/block}