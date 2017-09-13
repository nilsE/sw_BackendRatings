

//{namespace name=backend/analytics/view/main}
//{block name="backend/analytics/netzp_voucher_statistics/view/chart/voucher"}
Ext.define('Shopware.apps.Analytics.netzpVoucherStatistics.view.chart.Voucher', {
    extend: 'Shopware.apps.Analytics.view.main.Chart',
    alias: 'widget.analytics-chart-voucher',
    animate: true,
    shadows: true,

    legend: {
        position: 'right'
    },

    initComponent: function () {
        var me = this;

        me.series = [];

        me.axes = [
            {
                type: 'Numeric',
                position: 'left',
                fields: me.getAxesFields('cashed1', 'cashed2', 'cashed3', 'cashed0'),
                title: 'Eingelöst Total',
                grid: true,
                minimum: 0
            },
            {
                type: 'Category',
                position: 'bottom',
                fields: ['description'],
                title: 'Gutscheine'
            }
        ];

        me.legend = {
            position: 'right',

        },

        me.series = [
            {
                type: 'bar',
                highlight: true,
                column: true,
                stacked: true,
                showInLegend: true,
                
                xField: 'description',
                yField: ['cashed1', 'cashed2', 'cashed3', 'cashed0'],

                title: ['1. Bestellung', '2. Bestellung', '3. Bestellung', '> 3. Bestellung'],
                colorSet: ['#FF0000', '#FF4500', '#008000', '#90EE90', '#32CD32'],

                label: {
                    field: ['cashed1', 'cashed2', 'cashed3', 'cashed0'],
                    display: 'insideEnd',
                    orientation: 'horizontal',
                    contrast: true,
                    'text-anchor': 'middle'
                },

                tips: {
                    trackMouse: true,
                    width: 200,
                    height: 40,
                    
                    renderer: function (storeItem, barItem) {

                        var totals = storeItem.get('cashed0') + storeItem.get('cashed1') + storeItem.get('cashed2') + storeItem.get('cashed3'),
                            value = barItem.value[1];

                        this.setTitle(
                            'Eingelöst Total: ' + totals + '<br>' + 
                            'Anteil: ' + Math.round(value / totals * 100) + ' %'
                        );
                    }
                }                
            }
        ];

        me.callParent(arguments);
    }
});
//{/block}
