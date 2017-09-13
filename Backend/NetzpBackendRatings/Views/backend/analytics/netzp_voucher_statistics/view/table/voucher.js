

//{namespace name=backend/analytics/view/main}
//{block name="backend/analytics/netzp_voucher_statistics/view/table/voucher"}
Ext.define('Shopware.apps.Analytics.netzpVoucherStatistics.view.table.Voucher', {
    extend: 'Shopware.apps.Analytics.view.main.Table',
    alias: 'widget.analytics-table-voucher',

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

        me.initStoreIndices('numberofunits', 'Anzahl: [0]');

        me.callParent(arguments);
    },

    valueRenderer: function(value) {

        var me = this;

        return Ext.util.Format.currency(value, ' ', me.shopStore.application.currencySign, 2,
            (me.shopStore.application.currencyAtEnd == 0)
        );
    },

    getColumns: function () {
        var me = this;

        return [
            {
                dataIndex: 'description',
                text: 'Name',
                align: 'left',
                width: 100,
                flex: 1,
                renderer: function(val) {
                    return '<span style="color: purple; font-weight: bold">' + val + '</span>';
                }
            },
            {
                xtype: 'datecolumn',
                dataIndex: 'validfrom',
                text: 'Gültig von',
                align: 'left',
                width: 75,
            },
            {
                xtype: 'datecolumn',
                dataIndex: 'validto',
                text: 'bis',
                align: 'left',
                width: 75,
            },
            {
                dataIndex: 'value',
                text: 'Wert',
                renderer: me.valueRenderer,
                width: 50,
            },
            {
                dataIndex: 'numberofunits',
                text: 'Anzahl',
                width: 75
            },
            {
                dataIndex: 'cashedAll',
                text: 'Eingelöst Total'
            },
            {
                dataIndex: 'guests',
                text: 'Gäste',
                width: 60,
            },
            {
                dataIndex: 'cashed1',
                text: '1. Bestellung'
            },
            {
                dataIndex: 'cashed2',
                text: '2. Bestellung'
            },
            {
                dataIndex: 'cashed3',
                text: '3. Bestellung'
            },
            {
                dataIndex: 'cashed0',
                text: '> 3 Bestellung'
            },
            {
                dataIndex: 'averageamount',
                text: 'ø Bestellwert',
                renderer: function(val) {
                    return '<span style="color: purple;">' + val + '</span>';
                }
            }
        ];
    }
});
//{/block}